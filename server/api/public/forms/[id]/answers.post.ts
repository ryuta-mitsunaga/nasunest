import { Admin, Form, FormAnswer, Event } from '~~/server/database'
import { Op } from 'sequelize'
import { getCookie } from 'h3'
import { decryptId } from '~~/server/lib/crypto-utils'
import { pushLineMessage } from '~~/server/lib/line'

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
    let approvalType: number | null = null
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
      approvalType = event.approval_type

      // 定員チェック（capacity が設定されている場合）
      const capacity = event.capacity
      if (capacity != null && capacity > 0) {
        const participantCount = await FormAnswer.count({
          where: {
            event_id: eventIdNum,
            status: { [Op.in]: [0, 1] }, // 0: 回答待ち, 1: 承認済み（定員にカウント）
          },
        })
        if (participantCount >= capacity) {
          throw createError({
            statusCode: 400,
            statusMessage: '定員に達したため、申し込みを受け付けることができません',
            message: '定員に達したため、申し込みを受け付けることができません',
          })
        }
      }
    }

    // 回答データを保存
    const answer = await FormAnswer.create({
      form_id: formId,
      event_id: eventId,
      date: new Date(),
      content: body.content || {},
      user_id: userId,
      status: approvalType === 1 ? 0 : 1, // 手動承認の場合は回答待ち、以外の場合は承認済み
    })

    // LINE通知（フォーム作成者=管理者に通知）
    try {
      const admin = await Admin.findByPk(form.admin_id)
      if (admin?.line_user_id) {
        const messageLines = [
          'フォームに新しい申込みがありました。',
          `フォーム: ${form.name}`,
          eventId ? `イベントID: ${eventId}` : null,
        ].filter(Boolean) as string[]

        await pushLineMessage({
          to: admin.line_user_id,
          messages: [{ type: 'text', text: messageLines.join('\n') }],
        })
      }
    } catch (notifyError) {
      // 通知失敗でもフォーム送信自体は成功させる
      console.error('LINE通知エラー:', notifyError)
    }

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
