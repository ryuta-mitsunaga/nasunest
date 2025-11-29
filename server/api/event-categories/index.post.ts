import { EventCategory } from '~~/server/database'

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { name } = body

    if (!name || !name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'カテゴリ名は必須です',
      })
    }

    const category = await EventCategory.create({
      name: name.trim(),
    })

    return {
      success: true,
      data: category.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('カテゴリ作成エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'カテゴリの作成に失敗しました',
    })
  }
})

