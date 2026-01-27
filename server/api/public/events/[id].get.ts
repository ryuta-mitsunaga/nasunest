import { Event, EventCategory, Form } from '~~/server/database'
import { Op } from 'sequelize'
import dayjs from '~~/server/lib/dayjs'

export default defineEventHandler(async event => {
  try {
    // 公開用なので認証不要でイベントを取得（公開されているもののみ）
    // 公開期間を考慮（分まで考慮）
    const id = getRouterParam(event, 'id')
    // UTCの現在時刻を取得（DBにUTCで保存されているため）
    const now = dayjs.utc()

    const eventData = await Event.findOne<Event & { form: Form }>({
      where: {
        id,
        is_displayed: true,
        [Op.and]: [
          {
            [Op.or]: [
              { published_start: null },
              { published_start: { [Op.lte]: now.toDate() } },
            ],
          },
          {
            [Op.or]: [
              { published_end: null },
              { published_end: { [Op.gte]: now.toDate() } },
            ],
          },
        ],
      },
      include: [
        {
          model: EventCategory,
          as: 'categories',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
        {
          model: Form,
          as: 'form',
          attributes: ['id', 'name', 'published_end'],
          required: false,
        },
      ],
    })

    if (!eventData) {
      throw createError({
        statusCode: 404,
        message: 'イベントが見つかりません',
      })
    }

    // ステータスを計算
    let status: 'published' | 'unpublished' | 'closed' | 'recruitment_closed' =
      'published'
    
    // イベントが終了しているかどうかを判定（UTCで比較、分まで考慮）
    const isEventEnded = eventData.end_date
      ? dayjs.utc(eventData.end_date).isBefore(now)
      : false

    // 募集が終了しているかどうかを判定（UTCで比較、分まで考慮）
    const isRecruitmentEnded = eventData.form?.published_end
      ? dayjs.utc(eventData.form.published_end).isBefore(now)
      : false

    // イベントが公開されているかどうかを判定
    const isPublished = eventData.is_displayed

    if (isEventEnded) {
      status = 'closed'
    } else if (isRecruitmentEnded) {
      status = 'recruitment_closed'
    } else if (!isPublished) {
      status = 'unpublished'
    }

    const eventDataWithStatus = {
      ...eventData.toJSON(),
      status,
    }

    // thumbnailは既にURLなので変換不要
    return {
      success: true,
      data: eventDataWithStatus,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'イベントの取得に失敗しました',
    })
  }
})
