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
      where: {
        admin_id: adminId,
      },
      order: [['start_date', 'DESC']],
    })

    // thumbnailは既にURLなので変換不要
    return {
      success: true,
      data: events.map(event => event.toJSON()),
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
