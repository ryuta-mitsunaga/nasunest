import { Form, FormAnswer } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック（どの管理者でもアクセス可能）
    requireAdminId(event)

    const id = getRouterParam(event, 'id')

    // フォームが存在するか確認（admin_idチェックなし）
    const form = await Form.findByPk(id)

    if (!form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'フォームが見つかりません',
      })
    }

    // 回答データを取得（すべての回答）
    const answers = await FormAnswer.findAll({
      where: {
        form_id: id,
      },
      order: [['createdAt', 'DESC']],
    })

    return {
      success: true,
      data: {
        form: form.toJSON(),
        answers: answers.map(answer => answer.toJSON()),
      },
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
