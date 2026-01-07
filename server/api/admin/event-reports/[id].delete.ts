import { EventReport, Admin } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // マスターユーザーかどうかを確認
    const admin = await Admin.findByPk(adminId)
    const isMaster = admin?.isMaster || false

    const id = getRouterParam(event, 'id')

    const whereCondition: any = { id }
    if (!isMaster) {
      whereCondition.admin_id = adminId
    }

    const eventReport = await EventReport.findOne({
      where: whereCondition,
    })

    if (!eventReport) {
      throw createError({
        statusCode: 404,
        statusMessage: 'イベントレポートが見つかりません',
      })
    }

    await eventReport.destroy()

    return {
      success: true,
      message: 'イベントレポートを削除しました',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'イベントレポートの削除に失敗しました ' + error.message,
    })
  }
})

