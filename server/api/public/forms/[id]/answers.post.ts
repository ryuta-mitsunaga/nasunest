import { Form, FormAnswer, Event } from '~~/server/database'
import { getCookie } from 'h3'
import { decryptId } from '~~/server/lib/crypto-utils'

export default defineEventHandler(async event => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'フォームIDが指定されていません',
      })
    }
    const body = await readBody(event)
    const formId = parseInt(id, 10)

    // ログイン中のユーザーIDを取得（オプショナル）
    let userId: number | null = null
    const encryptedUserId = getCookie(event, 'loginId')
    if (encryptedUserId) {
      try {
        const decryptedUserId = decryptId(encryptedUserId)
        if (decryptedUserId !== null) {
          userId = decryptedUserId
        }
      } catch (error) {
        // デコードエラーは無視（ログインしていない扱い）
        console.error('User ID decryption error:', error)
      }
    }

    // フォームが存在するか確認
    const form = await Form.findOne({
      where: {
        id: formId,
      },
    })

    if (!form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'フォームが見つかりません',
      })
    }

    // event_idが指定されている場合、バリデーション
    let eventId: number | null = null
    if (body.event_id) {
      const eventIdNum = parseInt(body.event_id, 10)
      const event = await Event.findOne({
        where: {
          id: eventIdNum,
          form_id: formId, // イベントのform_idが現在のフォームIDと一致することを確認
        },
      })

      if (!event) {
        throw createError({
          statusCode: 400,
          statusMessage:
            '指定されたイベントが見つからないか、このフォームに関連付けられていません',
        })
      }

      eventId = eventIdNum
    }

    // 回答データを保存
    const answer = await FormAnswer.create({
      form_id: formId,
      event_id: eventId,
      date: new Date(),
      content: body.content || {},
      user_id: userId,
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
