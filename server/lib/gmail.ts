import nodemailer from 'nodemailer'

/**
 * Gmail SMTPトランスポーターを作成
 */
function createTransporter() {
  const user = process.env.GMAIL_USER
  const password = process.env.GOOGLE_APP_PASSWORD

  if (!user || !password) {
    throw new Error(
      'Gmail SMTP環境変数が設定されていません。GMAIL_USERとGOOGLE_APP_PASSWORDを設定してください。'
    )
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLSを使用
    auth: {
      user,
      pass: password,
    },
  })
}

/**
 * Gmail SMTPを使用してメールを送信
 */
export async function sendEmail(options: {
  to: string
  subject: string
  text?: string
  html?: string
  from?: string
}): Promise<void> {
  const { to, subject, text, html, from } = options

  // 送信元メールアドレス（環境変数から取得、デフォルトはGMAIL_USER）
  const senderEmail = from || process.env.GMAIL_USER

  if (!senderEmail) {
    throw new Error(
      '送信元メールアドレスが設定されていません。GMAIL_USER環境変数を設定するか、fromパラメータを指定してください。'
    )
  }

  if (!text && !html) {
    throw new Error('メール本文（textまたはhtml）が必要です')
  }

  const transporter = createTransporter()

  try {
    const mailOptions = {
      from: senderEmail,
      to,
      subject,
      text: text || undefined,
      html: html || undefined,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`[Gmail SMTP] メール送信成功: ${to} (Message ID: ${info.messageId})`)
  } catch (error: any) {
    console.error('[Gmail SMTP] メール送信エラー:', error)
    throw new Error(`メールの送信に失敗しました: ${error.message}`)
  }
}
