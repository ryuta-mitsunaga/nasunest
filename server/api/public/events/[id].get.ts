import { Event, EventCategory } from '~~/server/database'
import { Op } from 'sequelize'

export default defineEventHandler(async event => {
  try {
    // 公開用なので認証不要でイベントを取得（公開されているもののみ）
    // 公開期間を考慮
    const id = getRouterParam(event, 'id')
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const eventData = await Event.findOne({
      where: {
        id,
        is_published: true,
        [Op.and]: [
          {
            [Op.or]: [
              { published_start: null },
              { published_start: { [Op.lte]: today } },
            ],
          },
          {
            [Op.or]: [
              { published_end: null },
              { published_end: { [Op.gte]: today } },
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
      ],
    })

    if (!eventData) {
      throw createError({
        statusCode: 404,
        message: 'イベントが見つかりません',
      })
    }

    // thumbnailは既にURLなので変換不要
    return {
      success: true,
      data: eventData.toJSON(),
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
