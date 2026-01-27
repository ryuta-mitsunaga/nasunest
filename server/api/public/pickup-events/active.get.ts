import { PickupEvent, Event } from '~~/server/database'
import { Op } from 'sequelize'
import dayjs from '~~/server/lib/dayjs'

export default defineEventHandler(async (event) => {
  try {
    // UTCの現在時刻を取得（DBにUTCで保存されているため）
    const now = dayjs.utc().toDate()

    // 最新のピックアップイベントを取得（1つだけ）
    const pickupEvent = await PickupEvent.findOne({
      where: {
        pickup_datetime_start: {
          [Op.lte]: now,
        },
        pickup_datetime_end: {
          [Op.gte]: now,
        },
      },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'start_date', 'end_date', 'location_name', 'form_id', 'cta_button_text'],
        },
      ],
      order: [['createdAt', 'DESC']], // 最新のレコードを取得
    })

    if (!pickupEvent) {
      return {
        success: true,
        data: null,
      }
    }

    return {
      success: true,
      data: pickupEvent.toJSON(),
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'ピックアップイベントの取得に失敗しました',
    })
  }
})

