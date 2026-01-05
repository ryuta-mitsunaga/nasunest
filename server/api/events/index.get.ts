import { Event, Form, FormAnswer } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'
import { Op, literal, fn, col } from 'sequelize'
import dayjs from 'dayjs'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // クエリパラメータを取得
    const query = getQuery(event)
    const includeRecruitmentClosed =
      query.includeRecruitmentClosed === 'true' ||
      query.includeRecruitmentClosed === true
    const includeEventEnded =
      query.includeEventEnded === 'true' || query.includeEventEnded === true

    // 現在日付を取得（dayjsでタイムゾーンに依存しない日付文字列を取得）
    const todayStr = dayjs().format('YYYY-MM-DD')

    // where条件を構築
    const whereConditions: any = {
      admin_id: adminId,
    }

    // 募集終了のイベントを除外する条件（includeRecruitmentClosedがfalseの場合）
    if (!includeRecruitmentClosed) {
      const recruitmentCondition = literal(
        `("form"."published_end" IS NULL OR "form"."published_end" >= :today)`
      )
      whereConditions[Op.and] = whereConditions[Op.and] || []
      whereConditions[Op.and].push(recruitmentCondition)
    }

    // イベント終了のイベントを除外する条件（includeEventEndedがfalseの場合）
    if (!includeEventEnded) {
      const eventEndCondition = {
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: dayjs().startOf('day').toDate() } },
        ],
      }
      whereConditions[Op.and] = whereConditions[Op.and] || []
      whereConditions[Op.and].push(eventEndCondition)
    }

    const events = await Event.findAll({
      where: whereConditions,
      replacements: {
        today: todayStr,
      },
      include: [
        {
          model: Form,
          as: 'form',
          attributes: ['id', 'name', 'published_end'],
          required: false,
        },
      ],
      order: [['start_date', 'DESC']],
    })

    // 各イベントの未回答申し込み数を取得（SQL側でCOUNT集計）
    const eventIds = events.map(e => e.dataValues.id)
    const pendingCountMap = new Map<number, number>()

    if (eventIds.length > 0) {
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
        let status:
          | 'published'
          | 'unpublished'
          | 'closed'
          | 'recruitment_closed' = 'published'

        // イベントが終了しているかどうかを判定（dayjsでタイムゾーンに依存しない比較）
        const isEventEnded = eventData.end_date
          ? dayjs(eventData.end_date).isBefore(dayjs(), 'day') ||
            dayjs(eventData.end_date).isSame(dayjs(), 'day')
          : false

        // 募集が終了しているかどうかを判定（dayjsでタイムゾーンに依存しない比較）
        const isRecruitmentEnded = eventData.form?.published_end
          ? dayjs(eventData.form.published_end).isBefore(dayjs(), 'day') ||
            dayjs(eventData.form.published_end).isSame(dayjs(), 'day')
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
