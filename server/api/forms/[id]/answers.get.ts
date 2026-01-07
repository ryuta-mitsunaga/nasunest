import { Form, FormAnswer, Admin } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // マスターユーザーかどうかを確認
    const admin = await Admin.findByPk(adminId)
    const isMaster = admin?.isMaster || false

    const id = getRouterParam(event, 'id')

    // フォームが存在し、管理者のものか確認（マスターユーザーの場合はadmin_idチェックをスキップ）
    const whereCondition: any = { id }
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

    // クエリパラメータでstatusフィルタを取得
    const query = getQuery(event)
    const statusFilter =
      query.status !== undefined
        ? parseInt(query.status as string, 10)
        : undefined

    // 回答データを取得
    const whereClause: any = {
      form_id: id,
    }
    if (statusFilter !== undefined) {
      whereClause.status = statusFilter
    }

    const answers = await FormAnswer.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    })

    return {
      success: true,
      data: answers.map(answer => answer.toJSON()),
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
