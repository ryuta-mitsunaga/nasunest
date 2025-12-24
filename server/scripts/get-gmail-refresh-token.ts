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
      console.log('以下の環境変数を設定してください:\n')
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`)
      console.log(`GMAIL_USER=your-email@gmail.com\n`)
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
