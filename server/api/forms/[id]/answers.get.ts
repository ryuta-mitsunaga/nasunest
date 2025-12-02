import { Form, FormAnswer } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const id = getRouterParam(event, 'id')
    
    // フォームが存在し、管理者のものか確認
    const form = await Form.findOne({
      where: {
        id,
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
    const answers = await FormAnswer.findAll({
      where: {
        form_id: id,
      },
      order: [['createdAt', 'DESC']],
    })

    return {
      success: true,
      data: answers.map((answer) => answer.toJSON()),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '回答データの取得に失敗しました',
    })
  }
})

