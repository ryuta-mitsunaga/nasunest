/**
 * フォームフィールドのtypeをtextからemailに変更するスクリプト
 *
 * labelが「メールアドレス」でtypeが「text」のフィールドを「email」に変更します。
 *
 * 使用方法:
 * pnpm tsx server/scripts/migrate-text-to-email-field.ts
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// ESMモジュールで__dirnameを取得
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 環境変数を読み込む（sequelizeの初期化より前に実行）
config({ path: resolve(__dirname, '../../.env') })

// 環境変数からデータベース接続情報を取得して確認
const dbName =
  process.env.DB_DATABASE || process.env.MYSQL_DATABASE || 'nasunest'
const dbUser = process.env.DB_USER || process.env.MYSQL_USER || 'app_user'
const dbPassword =
  process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || 'app_password'
const dbHost = process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost'
const dbPort = parseInt(
  process.env.DB_PORT || process.env.MYSQL_PORT || '5432',
  10
)

console.log('データベース接続情報:')
console.log(`  Host: ${dbHost}`)
console.log(`  Port: ${dbPort}`)
console.log(`  Database: ${dbName}`)
console.log(`  User: ${dbUser}`)
console.log('')

// 環境変数読み込み後に新しいSequelizeインスタンスを作成
import { Sequelize, QueryTypes } from 'sequelize'
// @ts-ignore - pgモジュールの型定義がない場合がある
import pg from 'pg'

// 新しいSequelizeインスタンスを作成（環境変数が読み込まれた後）
// SSL接続が必要かどうかを環境変数から判定
const requireSSL =
  process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production'

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  dialectModule: pg,
  logging: false,
  dialectOptions: requireSSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false, // 自己署名証明書の場合
        },
      }
    : undefined,
})

interface FormField {
  id: string
  type: string
  label: string
  description?: string
  placeholder?: string
  options?: string[] | any[]
  required?: boolean
}

interface FormContent {
  description?: string
  fields: FormField[]
}

async function migrateTextToEmailField() {
  try {
    await sequelize.authenticate()
    console.log('データベース接続成功\n')

    // すべてのフォームを取得（直接クエリを使用）
    const forms = (await sequelize.query('SELECT * FROM forms ORDER BY id', {
      type: QueryTypes.SELECT,
    })) as Array<{
      id: number
      admin_id: number
      name: string
      content: any
      published_start: Date | null
      published_end: Date | null
      createdAt: Date
      updatedAt: Date
    }>

    if (!forms || forms.length === 0) {
      console.log('フォームが見つかりませんでした')
      await sequelize.close()
      return
    }

    console.log(`\n${forms.length}件のフォームを確認します...\n`)

    let updatedCount = 0
    let fieldUpdatedCount = 0

    for (const form of forms) {
      const content = form.content as FormContent

      if (!content || !content.fields || !Array.isArray(content.fields)) {
        console.log(`フォーム ID ${form.id}: フィールドが見つかりません`)
        continue
      }

      let formUpdated = false
      const updatedFields = content.fields.map((field: FormField) => {
        // typeが'text'でlabelが'メールアドレス'のフィールドを検出
        if (
          field.type === 'text' &&
          field.label &&
          (field.label === 'メールアドレス' ||
            field.label.includes('メールアドレス') ||
            field.label.includes('メール'))
        ) {
          console.log(
            `フォーム ID ${form.id} (${form.name}): フィールド "${field.label}" (ID: ${field.id}) を type: text → email に変更`
          )
          fieldUpdatedCount++
          formUpdated = true
          return {
            ...field,
            type: 'email',
          }
        }
        return field
      })

      if (formUpdated) {
        // フォームを更新（直接SQLクエリを使用）
        await sequelize.query(
          'UPDATE forms SET content = :content, "updatedAt" = NOW() WHERE id = :id',
          {
            replacements: {
              content: JSON.stringify({
                ...content,
                fields: updatedFields,
              }),
              id: form.id,
            },
          }
        )
        updatedCount++
        console.log(`✓ フォーム ID ${form.id} を更新しました\n`)
      }
    }

    console.log('\n=== マイグレーション完了 ===')
    console.log(`更新されたフォーム数: ${updatedCount}`)
    console.log(`更新されたフィールド数: ${fieldUpdatedCount}`)
  } catch (error) {
    console.error('エラーが発生しました:', error)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

// スクリプトを実行
migrateTextToEmailField()
