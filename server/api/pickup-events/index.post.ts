import { PickupEvent, Event } from '~~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const adminIdStr = getCookie(event, 'adminId')
    if (!adminIdStr) {
      throw createError({
        statusCode: 401,
        statusMessage: '認証が必要です',
      })
    }

    const body = await readBody(event)

    // イベントが存在するか確認
    const eventData = await Event.findByPk(body.event_id)
    if (!eventData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'イベントが見つかりません',
      })
    }

    // 既存のピックアップイベントをすべて削除（1つだけに制限）
    await PickupEvent.destroy({
      where: {},
      truncate: false,
    })

    const pickupEvent = await PickupEvent.create({
      event_id: body.event_id,
      pickup_datetime_start: body.pickup_datetime_start,
      pickup_datetime_end: body.pickup_datetime_end,
      left_text: body.left_text,
    })

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
      statusMessage: 'ピックアップイベントの作成に失敗しました',
    })
  }
})

