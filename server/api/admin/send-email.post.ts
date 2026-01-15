import { sendEmail } from '~~/server/lib/gmail'
import { requireAdminId } from '~~/server/lib/admin-auth'
import { EmailSendLog } from '~~/server/database/models'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

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

    // form_idの検証
    if (!body.form_id || typeof body.form_id !== 'number') {
      throw createError({
        statusCode: 400,
        statusMessage: 'フォームID（form_id）が必要です',
      })
    }

    const isTest = body.is_test === true

    // メール送信
    try {
      await sendEmail({
        to: body.to,
        subject: body.subject,
        text: body.text,
        html: body.html,
        from: body.from,
      })

      // 成功ログを記録
      await EmailSendLog.create({
        form_id: body.form_id,
        admin_id: adminId,
        recipient_email: body.to,
        subject: body.subject,
        html: body.html || null,
        text: body.text || null,
        status: 'success',
        is_test: isTest,
      })

      return {
        success: true,
        message: 'メールを送信しました',
      }
    } catch (emailError: any) {
      // 失敗ログを記録
      await EmailSendLog.create({
        form_id: body.form_id,
        admin_id: adminId,
        recipient_email: body.to,
        subject: body.subject,
        html: body.html || null,
        text: body.text || null,
        status: 'failed',
        error_message: emailError.message || String(emailError),
        is_test: isTest,
      })

      throw emailError
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

