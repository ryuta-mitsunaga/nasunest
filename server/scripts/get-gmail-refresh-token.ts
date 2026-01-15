/**
 * Gmail APIのリフレッシュトークンを取得するスクリプト
 *
 * 使用方法:
 * 1. .envファイルに環境変数を設定:
 *    GMAIL_CLIENT_ID=your-client-id
 *    GMAIL_CLIENT_SECRET=your-client-secret
 *
 * 2. スクリプトを実行:
 *    pnpm tsx server/scripts/get-gmail-refresh-token.ts
 *
 * 3. 表示されたURLをブラウザで開き、認証を完了
 * 4. 表示された認証コードを入力
 * 5. リフレッシュトークンが表示されます
 */

import { OAuth2Client } from 'google-auth-library'
import * as readline from 'readline'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import * as fs from 'fs'

// ESMモジュールで__dirnameを取得
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 環境変数を読み込む
config({ path: resolve(__dirname, '../../.env') })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(query, resolve))
}

/**
 * .envファイルに環境変数を追加または更新
 */
function updateEnvFile(key: string, value: string) {
  const envPath = resolve(__dirname, '../../.env')
  let envContent = ''

  // .envファイルが存在する場合は読み込む
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8')
  }

  // 既存のキーを更新、または新規追加
  const lines = envContent.split('\n')
  let keyExists = false
  const updatedLines = lines.map(line => {
    const trimmedLine = line.trim()
    // コメント行や空行はそのまま
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return line
    }
    // 既存のキーを更新
    if (trimmedLine.startsWith(`${key}=`)) {
      keyExists = true
      return `${key}=${value}`
    }
    return line
  })

  // キーが存在しない場合は追加
  if (!keyExists) {
    // 最後の空行を削除してから追加
    while (
      updatedLines.length > 0 &&
      !updatedLines[updatedLines.length - 1].trim()
    ) {
      updatedLines.pop()
    }
    updatedLines.push(`${key}=${value}`)
  }

  // ファイルに書き込み
  fs.writeFileSync(envPath, updatedLines.join('\n') + '\n', 'utf-8')
  console.log(`✓ ${key} を .env ファイルに保存しました`)
}

async function getRefreshToken() {
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error(
      'エラー: GMAIL_CLIENT_ID と GMAIL_CLIENT_SECRET を環境変数に設定してください'
    )
    process.exit(1)
  }

  console.log('clientId', clientId)
  console.log('clientSecret', clientSecret)

  const oauth2Client = new OAuth2Client(
    clientId,
    clientSecret,
    'urn:ietf:wg:oauth:2.0:oob' // デスクトップアプリ用のリダイレクトURI
  )

  // 認証URLを生成
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'consent', // リフレッシュトークンを確実に取得するため
  })

  console.log('\n以下のURLをブラウザで開いて認証を完了してください:')
  console.log('\n' + authUrl + '\n')

  // 認証コードを入力
  const code = await question('認証後に表示されたコードを入力してください: ')

  try {
    // 認証コードをアクセストークンとリフレッシュトークンに交換
    const { tokens } = await oauth2Client.getToken(code)

    if (tokens.refresh_token) {
      console.log('\n✅ リフレッシュトークンを取得しました！\n')

      // .envファイルに自動保存
      updateEnvFile('GMAIL_REFRESH_TOKEN', tokens.refresh_token)

      // GMAIL_USERが設定されていない場合は確認
      if (!process.env.GMAIL_USER) {
        const email = await question(
          '\nGmailアドレスを入力してください（GMAIL_USER）: '
        )
        if (email.trim()) {
          updateEnvFile('GMAIL_USER', email.trim())
        }
      } else {
        console.log(
          `✓ GMAIL_USER は既に設定されています: ${process.env.GMAIL_USER}`
        )
      }

      console.log('\n✅ 環境変数の設定が完了しました！')
      console.log(
        'アプリケーションを再起動して、新しいトークンを使用してください。\n'
      )
    } else {
      console.error('\n❌ リフレッシュトークンの取得に失敗しました')
      console.error('アクセストークンのみが返されました。')
      console.error('OAuth2認証情報の設定を確認してください。\n')
    }
  } catch (error: any) {
    console.error('\n❌ エラー:', error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

getRefreshToken()
