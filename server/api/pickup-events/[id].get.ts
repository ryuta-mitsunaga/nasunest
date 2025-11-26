import { PickupEvent, Event } from '~~/server/database'

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

    const id = getRouterParam(event, 'id')
    const pickupEvent = await PickupEvent.findOne({
      where: { id },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'start_date', 'location_name', 'form_id', 'cta_button_text'],
        },
      ],
    })

    if (!pickupEvent) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ピックアップイベントが見つかりません',
      })
    }

    return {
      success: true,
      data: pickupEvent.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'ピックアップイベントの取得に失敗しました',
    })
  }
})

