import { Event, Form, FormAnswer } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const events = await Event.findAll({
      where: {
        admin_id: adminId,
      },
      include: [
        {
          model: Form,
          as: 'form',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
      order: [['start_date', 'DESC']],
    })

    // 現在日付を取得（時刻を0時に設定）
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 各イベントの未回答申し込み数を取得（SQL側でCOUNT集計）
    const eventIds = events.map(e => e.dataValues.id)
    const pendingCountMap = new Map<number, number>()

    if (eventIds.length > 0) {
      const { Op, fn, col } = await import('sequelize')

      const pendingAnswers = await FormAnswer.findAll({
        where: {
          event_id: { [Op.in]: eventIds },
          status: 0, // 回答待ち
        },
        attributes: ['event_id', [fn('COUNT', col('id')), 'count']],
        group: ['event_id'],
        raw: true,
      })

      for (const answer of pendingAnswers as any[]) {
        const eventId = (answer as any).event_id as number
        const count = parseInt((answer as any).count as string, 10) || 0
        pendingCountMap.set(eventId, count)
      }
    }

    // thumbnailは既にURLなので変換不要
    return {
      success: true,
      data: events.map(event => {
        const eventData = event.toJSON() as any

        // ステータスを計算
        let status: 'published' | 'unpublished' | 'closed' = 'published'
        if (!eventData.is_displayed) {
          status = 'unpublished'
        } else if (eventData.end_date) {
          const endDate = new Date(eventData.end_date)
          endDate.setHours(0, 0, 0, 0)
          if (endDate < today) {
            status = 'closed'
          }
        }

        // 未回答申し込み数を取得
        const pendingCount = pendingCountMap.get(eventData.id) || 0

        return {
          ...eventData,
          form: eventData.form || null,
          status,
          pending_answers_count: pendingCount,
        }
      }),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'イベントの取得に失敗しました ' + error.message,
    })
  }
})
