import { EventReport } from '~~/server/database'

export default defineEventHandler(async event => {
  try {
    const id = getRouterParam(event, 'id')
    const query = getQuery(event)
    const token = query.token as string

    if (!token) {
      throw createError({
        statusCode: 400,
        message: 'トークンが指定されていません',
      })
    }

    const eventReport = await EventReport.findOne({
      where: {
        id,
        comment_token: token,
      },
    })

    if (!eventReport) {
      throw createError({
        statusCode: 404,
        message: 'イベントレポートが見つかりません、またはトークンが無効です',
      })
    }

    return {
      success: true,
      data: {
        id: eventReport.id,
        title: eventReport.title,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'トークンの検証に失敗しました ' + error.message,
    })
  }
})

