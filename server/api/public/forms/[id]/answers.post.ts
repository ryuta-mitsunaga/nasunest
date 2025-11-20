import { Form, FormAnswer } from '~~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    // フォームが存在するか確認
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

    // 回答データを保存
    const answer = await FormAnswer.create({
      form_id: parseInt(id, 10),
      date: new Date(),
      content: body.content || {},
    })

    return {
      success: true,
      data: answer.toJSON(),
      message: '回答を送信しました',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '回答の送信に失敗しました',
    })
  }
})

