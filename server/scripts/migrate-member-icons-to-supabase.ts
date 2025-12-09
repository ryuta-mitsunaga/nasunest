/**
 * 既存の協力隊員の画像をSupabase Storageにアップロードし、
 * chiki_okoshi_membersテーブルのiconカラムをURLに更新するバッチスクリプト
 *
 * 実行方法:
 * npx tsx server/scripts/migrate-member-icons-to-supabase.ts
 */

import { Member } from '../database/models/index'
import { sequelize } from '../database'
import { Op } from 'sequelize'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// ESMモジュールで__dirnameを取得
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 環境変数を読み込む
config({ path: resolve(__dirname, '../../.env') })

// Supabaseクライアントを作成
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Supabase環境変数が設定されていません。SUPABASE_URLとSUPABASE_SERVICE_ROLE_KEYを設定してください。'
  )
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Supabase Storageに画像をアップロード
 */
async function uploadImage(
  file: Buffer,
  fileName: string,
  folder: string = 'members',
  contentType: string = 'image/png'
): Promise<{ url: string; path: string }> {
  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filePath = `${folder}/${timestamp}-${sanitizedFileName}`

  const { data, error } = await supabase.storage
    .from('event-thumbnail')
    .upload(filePath, file, {
      contentType,
      upsert: false,
    })

  if (error) {
    throw new Error(`画像のアップロードに失敗しました: ${error.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('event-thumbnail').getPublicUrl(filePath)

  console.log(`[Supabase] 画像アップロード成功: ${filePath}`)
  console.log(`[Supabase] 公開URL: ${publicUrl}`)

  return {
    url: publicUrl,
    path: filePath,
  }
}

async function migrateMemberIcons() {
  try {
    console.log('データベース接続中...')
    await sequelize.authenticate()
    console.log('データベース接続成功')

    // iconがBufferとして保存されているメンバーを取得
    const members = await Member.findAll({
      where: {
        icon: { [Op.ne]: null },
      },
    })

    console.log(`処理対象のメンバー数: ${members.length}`)

    let successCount = 0
    let errorCount = 0
    let skipCount = 0

    for (const member of members) {
      try {
        const memberData = member.toJSON() as any
        const iconBuffer = memberData.icon

        // 既にURLの場合はスキップ
        if (typeof iconBuffer === 'string' && iconBuffer.startsWith('http')) {
          console.log(
            `[スキップ] メンバーID ${member.id}: 既にURLが設定されています`
          )
          skipCount++
          continue
        }

        // iconデータをBufferに変換
        let imageBuffer: Buffer | null = null

        if (Buffer.isBuffer(iconBuffer)) {
          // 既にBufferの場合はそのまま使用
          imageBuffer = iconBuffer
        } else if (typeof iconBuffer === 'string') {
          // Base64文字列の場合はデコード
          try {
            imageBuffer = Buffer.from(iconBuffer, 'base64')
            // デコード後のバッファが空でないか確認
            if (imageBuffer.length === 0) {
              console.log(
                `[スキップ] メンバーID ${member.id}: Base64デコード後のバッファが空です`
              )
              skipCount++
              continue
            }
          } catch (decodeError) {
            console.log(
              `[スキップ] メンバーID ${member.id}: Base64デコードに失敗しました: ${decodeError}`
            )
            skipCount++
            continue
          }
        } else {
          // その他の場合はスキップ
          console.log(
            `[スキップ] メンバーID ${member.id}: iconが無効な形式です`
          )
          skipCount++
          continue
        }

        console.log(
          `[処理中] メンバーID ${member.id}: ${member.name_sei} ${member.name_mei}`
        )

        // ファイル名を生成（メンバーIDを使用）
        const fileName = `member-${member.id}.png`

        // Supabaseにアップロード
        const result = await uploadImage(
          imageBuffer,
          fileName,
          'members',
          'image/png'
        )

        console.log(`[成功] メンバーID ${member.id}: ${result.url}`)

        // データベースを更新（型アサーションを使用）
        await member.update({
          icon: result.url as any,
        })

        successCount++
      } catch (error: any) {
        console.error(
          `[エラー] メンバーID ${member.id}: ${error.message}`,
          error
        )
        errorCount++
      }
    }

    console.log('\n=== 処理完了 ===')
    console.log(`成功: ${successCount}件`)
    console.log(`エラー: ${errorCount}件`)
    console.log(`スキップ: ${skipCount}件`)
    console.log(`合計: ${members.length}件`)

    await sequelize.close()
    process.exit(0)
  } catch (error: any) {
    console.error('バッチ処理エラー:', error)
    await sequelize.close()
    process.exit(1)
  }
}

// スクリプト実行
migrateMemberIcons()
