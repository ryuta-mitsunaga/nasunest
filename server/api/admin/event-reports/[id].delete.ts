import { EventReport } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const id = getRouterParam(event, 'id')

    const eventReport = await EventReport.findOne({
      where: {
        id,
        admin_id: adminId,
      },
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

