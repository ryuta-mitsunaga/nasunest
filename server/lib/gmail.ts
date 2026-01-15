import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

/**
 * Gmail APIクライアントを取得
 */
export async function getGmailClient(): Promise<OAuth2Client> {
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Gmail環境変数が設定されていません。GMAIL_CLIENT_ID、GMAIL_CLIENT_SECRET、GMAIL_REFRESH_TOKENを設定してください。'
    )
  }

  const oauth2Client = new OAuth2Client(clientId, clientSecret)
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  })

  // アクセストークンを明示的に取得して更新（スコープを確実に適用）
  try {
    await oauth2Client.getAccessToken()
  } catch (error: any) {
    throw new Error(
      `Gmail認証に失敗しました。リフレッシュトークンが無効またはスコープが不足している可能性があります: ${error.message}`
    )
  }

  return oauth2Client
}

/**
 * Gmail APIを使用してメールを送信
 */
export async function sendEmail(options: {
  to: string
  subject: string
  text?: string
  html?: string
  from?: string
}): Promise<void> {
  const { to, subject, text, html, from } = options

  // 送信元メールアドレス（環境変数から取得、デフォルトはOAuth2で認証したアカウント）
  const senderEmail = from || process.env.GMAIL_USER

  if (!senderEmail) {
    throw new Error(
      '送信元メールアドレスが設定されていません。GMAIL_USER環境変数を設定するか、fromパラメータを指定してください。'
    )
  }

  const oauth2Client = await getGmailClient()
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  // メール本文を作成
  let messageBody: string
  let contentType: string

  if (html) {
    // HTMLメールの場合
    contentType = 'text/html; charset=utf-8'
    messageBody = html
  } else if (text) {
    // テキストメールの場合
    contentType = 'text/plain; charset=utf-8'
    messageBody = text
  } else {
    throw new Error('メール本文（textまたはhtml）が必要です')
  }

  // SubjectをRFC 2047形式でエンコード（日本語対応）
  const encodeSubject = (subject: string): string => {
    // ASCII文字のみの場合はそのまま返す
    if (/^[\x00-\x7F]*$/.test(subject)) {
      return subject
    }
    // 日本語を含む場合はBase64エンコード
    const encoded = Buffer.from(subject, 'utf-8').toString('base64')
    return `=?UTF-8?B?${encoded}?=`
  }

  // RFC 2822形式のメッセージを作成
  const messageParts = [
    `To: ${to}`,
    `From: ${senderEmail}`,
    `Subject: ${encodeSubject(subject)}`,
    `Content-Type: ${contentType}`,
    `Content-Language: ja`,
    `MIME-Version: 1.0`,
    '',
    messageBody,
  ]

  const message = messageParts.join('\r\n')

  // Base64エンコード（URLセーフ形式、RFC 4648 Section 5）
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    })
    console.log(`[Gmail] メール送信成功: ${to}`)
  } catch (error: any) {
    console.error('[Gmail] メール送信エラー:', error)
    throw new Error(`メールの送信に失敗しました: ${error.message}`)
  }
}
