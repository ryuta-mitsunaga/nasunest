import { EventReportComment, EventReport } from '~~/server/database'

export default defineEventHandler(async event => {
  try {
    const id = getRouterParam(event, 'id')

    // イベントレポートが存在するか確認
    const eventReport = await EventReport.findOne({
      where: {
        id,
      },
    })

    if (!eventReport) {
      throw createError({
        statusCode: 404,
        message: 'イベントレポートが見つかりません',
      })
    }

    // コメントを取得（作成日時の降順）
    const comments = await EventReportComment.findAll({
      where: {
        event_id: eventReport.event_id,
      },
      order: [['createdAt', 'DESC']],
    })

    return {
      success: true,
      data: comments.map(comment => comment.toJSON()),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'コメントの取得に失敗しました ' + error.message,
    })
  }
})

