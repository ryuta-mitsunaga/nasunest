import { EventReport, Event } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const eventReports = await EventReport.findAll({
      where: {
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
      order: [['createdAt', 'DESC']],
    })

    return {
      success: true,
      data: eventReports.map(report => report.toJSON()),
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

