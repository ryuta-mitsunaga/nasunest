import { PickupEvent, Event } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    requireAdminId(event)

    // 最新の1つだけを取得
    const pickupEvents = await PickupEvent.findAll({
      include: [
        {
          model: Event,
          as: 'event',
          attributes: [
            'id',
            'title',
            'start_date',
            'end_date',
            'location_name',
          ],
        },
      ],
      order: [['createdAt', 'DESC']], // 最新のレコードを取得
      limit: 1, // 1つだけ取得
    })

    return {
      success: true,
      data: pickupEvents.map(pe => pe.toJSON()),
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
