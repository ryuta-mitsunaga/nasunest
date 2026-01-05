import { EventReport, Event } from '~~/server/database'

export default defineEventHandler(async event => {
  try {
    // 公開用なので認証不要でイベントレポートを取得
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 12
    const offset = (page - 1) * limit

    const { count, rows: eventReports } = await EventReport.findAndCountAll({
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'start_date'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    })

    const totalPages = Math.ceil(count / limit)
    const hasMore = page < totalPages

    return {
      success: true,
      data: eventReports.map(report => report.toJSON()),
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasMore,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'イベントレポートの取得に失敗しました ' + error.message,
    })
  }
})

