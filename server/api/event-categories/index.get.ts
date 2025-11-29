import { EventCategory } from '~~/server/database'

export default defineEventHandler(async event => {
  try {
    const categories = await EventCategory.findAll({
      order: [['name', 'ASC']],
    })

    return {
      success: true,
      data: categories.map(category => category.toJSON()),
    }
  } catch (error: any) {
    console.error('カテゴリ取得エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'カテゴリの取得に失敗しました',
    })
  }
})

