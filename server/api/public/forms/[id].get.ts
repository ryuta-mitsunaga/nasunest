import { Form } from '~~/server/database'
import { Op } from 'sequelize'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    // 公開用なので認証不要でフォームを取得
    // 公開期間を考慮（分まで考慮）
    const now = new Date()

    const form = await Form.findOne({
      where: {
        id,
        [Op.and]: [
          {
            [Op.or]: [
              { published_start: null },
              { published_start: { [Op.lte]: now } },
            ],
          },
          {
            [Op.or]: [
              { published_end: null },
              { published_end: { [Op.gte]: now } },
            ],
          },
        ],
      },
    })

    if (!form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'フォームが見つかりません',
      })
    }

    return {
      success: true,
      data: form.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'フォームの取得に失敗しました',
    })
  }
})

