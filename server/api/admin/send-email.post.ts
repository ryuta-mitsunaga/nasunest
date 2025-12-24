import { sendEmail } from '~~/server/lib/gmail'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    requireAdminId(event)

    const body = await readBody(event)

    // 必須パラメータの検証
    if (!body.to || typeof body.to !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: '送信先メールアドレス（to）が必要です',
      })
    }

    if (!body.subject || typeof body.subject !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: '件名（subject）が必要です',
      })
    }

    if (!body.text && !body.html) {
      throw createError({
        statusCode: 400,
        statusMessage: 'メール本文（textまたはhtml）が必要です',
      })
    }

    // メール送信
    await sendEmail({
      to: body.to,
      subject: body.subject,
      text: body.text,
      html: body.html,
      from: body.from,
    })

    return {
      success: true,
      message: 'メールを送信しました',
    }
  } catch (error: any) {
    console.error('メール送信APIエラー:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'メールの送信に失敗しました',
    })
  }
})

