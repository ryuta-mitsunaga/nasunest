import { Event, EventCategory } from '~~/server/database'

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

    const id = getRouterParam(event, 'id')
    const eventData = await Event.findOne({
      where: {
        id,
        admin_id: adminId,
      },
      include: [
        {
          model: EventCategory,
          as: 'categories',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
    })

    if (!eventData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'イベントが見つかりません',
      })
    }

    // thumbnailは既にURLなので変換不要
    return {
      success: true,
      data: eventData.toJSON(),
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'イベントの取得に失敗しました',
    })
  }
})
