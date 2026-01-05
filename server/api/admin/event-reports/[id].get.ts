import { EventReport, Event } from '~~/server/database'
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
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'start_date'],
          required: false,
        },
      ],
    })

    if (!eventReport) {
      throw createError({
        statusCode: 404,
        statusMessage: 'イベントレポートが見つかりません',
      })
    }

    return {
      success: true,
      data: eventReport.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'イベントレポートの取得に失敗しました ' + error.message,
    })
  }
})

