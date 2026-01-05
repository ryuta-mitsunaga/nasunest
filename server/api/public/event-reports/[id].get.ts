import { EventReport, Event } from '~~/server/database'

export default defineEventHandler(async event => {
  try {
    // 公開用なので認証不要でイベントレポートを取得
    const id = getRouterParam(event, 'id')

    const eventReport = await EventReport.findOne({
      where: {
        id,
      },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'start_date', 'end_date'],
          required: false,
        },
      ],
    })

    if (!eventReport) {
      throw createError({
        statusCode: 404,
        message: 'イベントレポートが見つかりません',
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
      message: 'イベントレポートの取得に失敗しました ' + error.message,
    })
  }
})

