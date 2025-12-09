import { Form, FormAnswer } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const formId = getRouterParam(event, 'id')
    const answerId = getRouterParam(event, 'answerId')

    // フォームが存在し、管理者のものか確認
    const form = await Form.findOne({
      where: {
        id: formId,
        admin_id: adminId,
      },
    })

    if (!form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'フォームが見つかりません',
      })
    }

    // 回答データを取得
    const answer = await FormAnswer.findOne({
      where: {
        id: answerId,
        form_id: formId,
      },
    })

    if (!answer) {
      throw createError({
        statusCode: 404,
        statusMessage: '回答が見つかりません',
      })
    }

    return {
      success: true,
      data: answer.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '回答の取得に失敗しました',
    })
  }
})

