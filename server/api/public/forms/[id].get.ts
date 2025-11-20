import { Form } from '~~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    // 公開用なので認証不要でフォームを取得
    const form = await Form.findOne({
      where: {
        id,
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

