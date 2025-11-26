import { Event } from '~~/server/database'

export default defineEventHandler(async (event) => {
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

    const id = getRouterParam(event, 'id')
    const eventData = await Event.findOne({
      where: {
        id,
        admin_id: adminId,
      },
    })

    if (!eventData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'イベントが見つかりません',
      })
    }

    // thumbnailをBase64文字列に変換
    const eventDataJson = eventData.toJSON()
    if (eventDataJson.thumbnail && Buffer.isBuffer(eventDataJson.thumbnail)) {
      eventDataJson.thumbnail = `data:image/png;base64,${eventDataJson.thumbnail.toString('base64')}`
    }

    return {
      success: true,
      data: eventDataJson,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'イベントの取得に失敗しました',
    })
  }
})

