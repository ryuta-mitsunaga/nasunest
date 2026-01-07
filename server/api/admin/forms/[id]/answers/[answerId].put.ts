import { Form, FormAnswer, Admin } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // マスターユーザーかどうかを確認
    const admin = await Admin.findByPk(adminId)
    const isMaster = admin?.isMaster || false

    const formId = getRouterParam(event, 'id')
    const answerId = getRouterParam(event, 'answerId')
    const body = await readBody(event)

    // フォームが存在し、管理者のものか確認（マスターユーザーの場合はadmin_idチェックをスキップ）
    const whereCondition: any = { id: formId }
    if (!isMaster) {
      whereCondition.admin_id = adminId
    }

    const form = await Form.findOne({
      where: whereCondition,
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

    // ステータスを更新（1: OK, 2: NG）
    if (body.status !== undefined) {
      const status = parseInt(body.status, 10)
      if (status === 1 || status === 2) {
        answer.status = status
        await answer.save()
      } else {
        throw createError({
          statusCode: 400,
          statusMessage: '無効なステータスです',
        })
      }
    }

    // キャンセルフラグを更新
    if (body.is_cancel !== undefined) {
      answer.is_cancel = !!body.is_cancel
      await answer.save()
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
      statusMessage: '回答の更新に失敗しました',
    })
  }
})
