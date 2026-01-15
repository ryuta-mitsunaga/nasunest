import { requireAdminId } from '~~/server/lib/admin-auth'
import { EmailSendLog, Admin } from '~~/server/database/models'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    requireAdminId(event)

    const formId = getRouterParam(event, 'id')
    if (!formId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'フォームIDが必要です',
      })
    }

    const logs = await EmailSendLog.findAll({
      where: {
        form_id: parseInt(formId, 10),
      },
      include: [
        {
          model: Admin,
          as: 'admin',
          attributes: ['id', 'login_id'],
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    return {
      success: true,
      data: logs,
    }
  } catch (error: any) {
    console.error('メール送信ログ取得エラー:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'メール送信ログの取得に失敗しました',
    })
  }
})
