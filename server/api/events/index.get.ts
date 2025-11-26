import { Event } from '~~/server/database'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminIdStr = getCookie(event, 'adminId')

    if (!adminIdStr) {
      throw createError({
        statusCode: 401,
        statusMessage: '認証が必要です',
      })
    }

    const adminId = parseInt(adminIdStr, 10)
    if (isNaN(adminId)) {
      throw createError({
        statusCode: 401,
        statusMessage: '認証情報が無効です',
      })
    }

    const events = await Event.findAll({
      order: [['start_date', 'DESC']],
    })

    // thumbnailをBase64文字列に変換
    const eventsWithThumbnail = events.map(event => {
      const eventData = event.toJSON()
      if (eventData.thumbnail && Buffer.isBuffer(eventData.thumbnail)) {
        eventData.thumbnail = `data:image/png;base64,${eventData.thumbnail.toString('base64')}`
      }
      return eventData
    })

    return {
      success: true,
      data: eventsWithThumbnail,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'イベントの取得に失敗しました ' + error.message,
    })
  }
})
