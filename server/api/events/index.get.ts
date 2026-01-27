import { Event, Form, FormAnswer, Admin } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'
import { Op, literal, fn, col } from 'sequelize'
import dayjs from 'dayjs'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // マスターユーザーかどうかを確認
    const admin = await Admin.findByPk(adminId)
    const isMaster = admin?.isMaster || false

    // 現在日付を取得（dayjsでタイムゾーンに依存しない日付文字列を取得）
    const todayStr = dayjs().format('YYYY-MM-DD')

    // where条件を構築（マスターユーザーの場合はadmin_idでのフィルタリングをスキップ）
    const whereConditions: any = isMaster ? {} : { admin_id: adminId }

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

        // JSTの現在時刻を取得（DBにJSTで保存されているため）
        const now = dayjs()

        // 非表示の場合は非公開
        if (!eventData.is_displayed) {
          status = 'unpublished'
        } else {
          // イベントが終了しているかどうかを判定（JSTで比較、分まで考慮）
          const isEventEnded = eventData.end_date
            ? dayjs(eventData.end_date).isBefore(now)
            : false

          // 募集が終了しているかどうかを判定（JSTで比較、分まで考慮）
          const isRecruitmentEnded = eventData.form?.published_end
            ? dayjs(eventData.form.published_end).isBefore(now)
            : false

          // ステータス判定
          if (isEventEnded && isRecruitmentEnded) {
            status = 'closed' // イベント終了 && 募集終了 = イベント終了
          } else if (!isEventEnded && isRecruitmentEnded) {
            status = 'recruitment_closed' // !イベント終了 && 募集終了 = 募集終了
          } else {
            status = 'published' // !イベント終了 && !募集終了 = 公開
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
