import { Member } from '~~/server/database'
import {
  uploadImage,
  base64ToBuffer,
  getFileExtensionFromBase64,
} from '~~/server/lib/supabase-repository'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = getCookie(event, 'adminId')

    if (!adminId) {
      throw createError({
        statusCode: 401,
        statusMessage: '認証が必要です',
      })
    }

    const body = await readBody(event)

    // Base64文字列をSupabaseにアップロード
    let iconUrl = null
    if (body.icon && typeof body.icon === 'string') {
      // URLかBase64かを判定
      const isUrl =
        body.icon.startsWith('http://') || body.icon.startsWith('https://')

      if (isUrl) {
        // 既にURLの場合はそのまま使用（画像を変更しない場合）
        iconUrl = body.icon
      } else {
        // Base64文字列の場合はSupabaseにアップロード
        try {
          // Base64文字列をBufferに変換
          const buffer = base64ToBuffer(body.icon)
          const extension = getFileExtensionFromBase64(body.icon)
          const fileName = `icon.${extension}`

          // Supabaseにアップロード
          const result = await uploadImage({
            file: buffer,
            fileName,
            folder: 'members',
            contentType: `image/${extension}`,
          })

          iconUrl = result.url
        } catch (uploadError: any) {
          console.error('画像アップロードエラー:', uploadError)
          throw createError({
            statusCode: 500,
            statusMessage: `画像のアップロードに失敗しました: ${uploadError.message}`,
          })
        }
      }
    }

    const member = await Member.create({
      name_sei: body.name_sei,
      name_mei: body.name_mei,
      start_date: body.start_date,
      end_date: body.end_date || null,
      mission: body.mission,
      description: body.description,
      icon: iconUrl,
      x_url: body.x_url || null,
      instagram_url: body.instagram_url || null,
      facebook_url: body.facebook_url || null,
    })

    // レスポンス用にiconをURLまたはBase64文字列に変換
    const memberData = member.toJSON()
    // iconは既にURLとして保存されているので、そのまま返す

    return {
      success: true,
      data: memberData,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'メンバーの作成に失敗しました',
    })
  }
})
