import {
  Event,
  EventCategory,
  Form,
  FormAnswer,
  Admin,
} from '~~/server/database'
import { Op, fn, col } from 'sequelize'
import dayjs from '~~/server/lib/dayjs'

export default defineEventHandler(async event => {
  try {
    // 公開用なので認証不要でイベントを取得（公開されているもののみ）
    // 公開期間を考慮（分まで考慮）
    // UTCの現在時刻を取得（DBにUTCで保存されているため）
    const now = dayjs.utc().toDate()

    // クエリパラメータからページネーション情報と検索条件を取得
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 12
    const offset = (page - 1) * limit
    const keyword = (query.keyword as string) || ''
    const categoryIds = query.categoryIds
      ? Array.isArray(query.categoryIds)
        ? query.categoryIds.map(id => parseInt(id as string))
        : [parseInt(query.categoryIds as string)]
      : []
    const startDate = (query.startDate as string) || ''
    const endDate = (query.endDate as string) || ''
    const onlyOpen = query.onlyOpen === 'true' || query.onlyOpen === true

    // 検索条件を構築
    const whereConditions: any[] = [
      {
        is_displayed: true,
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
    ]

    // キーワード検索
    if (keyword.trim()) {
      whereConditions.push({
        [Op.or]: [
          { title: { [Op.iLike]: `%${keyword.trim()}%` } },
          { description: { [Op.iLike]: `%${keyword.trim()}%` } },
          { location_name: { [Op.iLike]: `%${keyword.trim()}%` } },
          { location_address: { [Op.iLike]: `%${keyword.trim()}%` } },
        ],
      })
    }

    // 開催日絞り込み（分まで考慮）
    // クエリパラメータの日付はJSTとして解釈し、UTCに変換して比較
    if (startDate) {
      // JSTとして解釈し、UTCに変換
      const startDateObj = dayjs.tz(startDate, 'Asia/Tokyo').utc().toDate()
      // 指定した開始日時以降に開始する、または指定した開始日時以降に終了するイベント
      whereConditions.push({
        [Op.or]: [
          { start_date: { [Op.gte]: startDateObj } },
          { end_date: { [Op.gte]: startDateObj } },
        ],
      })
    }

    if (endDate) {
      // JSTとして解釈し、UTCに変換
      const endDateObj = dayjs.tz(endDate, 'Asia/Tokyo').utc().toDate()
      // 指定した終了日時以前に開始する、または指定した終了日時以前に終了するイベント
      whereConditions.push({
        [Op.or]: [
          { start_date: { [Op.lte]: endDateObj } },
          { end_date: { [Op.lte]: endDateObj } },
        ],
      })
    }

    // フィルタリング後にページネーションを適用するため、より多くのデータを取得
    // 最大で limit * 3 件取得（募集終了・イベント終了のイベントが多い場合を考慮）
    const fetchLimit = limit * 3
    const allEvents = await Event.findAll({
      where: {
        [Op.and]: whereConditions,
      },
      include: [
        {
          model: EventCategory,
          as: 'categories',
          attributes: ['id', 'name'],
          through: { attributes: [] },
          required: categoryIds.length > 0,
          where:
            categoryIds.length > 0
              ? { id: { [Op.in]: categoryIds } }
              : undefined,
        },
        {
          model: Form,
          as: 'form',
          attributes: ['id', 'name', 'published_end'],
          required: false,
        },
        {
          model: Admin,
          as: 'admin',
          attributes: ['id', 'icon_url'],
          required: false,
        },
      ],
      attributes: {
        exclude: ['body'], // 大きなデータを除外
      },
      order: [['start_date', 'DESC']],
      limit: fetchLimit,
      offset: 0,
    })

    // JavaScriptでフィルタリング
    // - デフォルト: 全件表示（終了/募集終了も含む）
    // - onlyOpen=true: 「募集中のみ」（イベント未終了 かつ 募集未終了）
    const filteredEvents = allEvents.filter(event => {
      if (!onlyOpen) return true

      const eventData = event.toJSON() as any

      // UTCで比較（DBにUTCで保存されているため）
      const now = dayjs.utc()
      const isEventEnded = eventData.end_date
        ? dayjs.utc(eventData.end_date).isBefore(now)
        : false

      const isRecruitmentEnded = eventData.form?.published_end
        ? dayjs.utc(eventData.form.published_end).isBefore(now)
        : false

      return !(isEventEnded || isRecruitmentEnded)
    })

    // 参加人数を取得（event_idで集計）
    const eventIds = filteredEvents.map(e => (e.toJSON() as any).id)
    const participantCountMap = new Map<number, number>()

    if (eventIds.length > 0) {
      const participantCounts = await FormAnswer.findAll({
        where: {
          event_id: { [Op.in]: eventIds },
          status: { [Op.in]: [0, 1] },
          is_cancel: false,
        },
        attributes: ['event_id', [fn('COUNT', col('id')), 'count']],
        group: ['event_id'],
        raw: true,
      })

      for (const count of participantCounts as any[]) {
        const eventId = Number(count.event_id)
        const participantCount = parseInt(count.count as string, 10) || 0
        participantCountMap.set(eventId, participantCount)
      }
    }

    // フィルタリング後のデータをマッピング
    const eventsData = filteredEvents.map(event => {
      const eventData = event.toJSON() as any

      // ステータスを計算
      let status:
        | 'published'
        | 'unpublished'
        | 'closed'
        | 'recruitment_closed' = 'published'

      // UTCの現在時刻を取得（DBにUTCで保存されているため）
      const now = dayjs.utc()
      
      // イベントが終了しているかどうかを判定（UTCで比較、分まで考慮）
      const isEventEnded = eventData.end_date
        ? dayjs.utc(eventData.end_date).isBefore(now)
        : false

      // 募集が終了しているかどうかを判定（UTCで比較、分まで考慮）
      const isRecruitmentEnded = eventData.form?.published_end
        ? dayjs.utc(eventData.form.published_end).isBefore(now)
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

      // 参加人数を取得（イベント作成者も参加の場合は+1）
      let participantCount =
        participantCountMap.get(Number(eventData.id)) || 0
      if (eventData.creator_participates) {
        participantCount += 1
      }

      // 作成者情報（show_creator時のみ）
      const creator =
        eventData.show_creator && eventData.admin
          ? { icon_url: eventData.admin.icon_url }
          : null

      const { admin, ...rest } = eventData
      return {
        ...rest,
        status,
        participant_count: participantCount,
        creator,
      }
    })

    // ページネーションを適用
    const paginatedEvents = eventsData.slice(offset, offset + limit)
    const total = eventsData.length
    const totalPages = Math.ceil(total / limit)
    const hasMore = page < totalPages

    return {
      success: true,
      data: paginatedEvents,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'イベントの取得に失敗しました ' + error.message,
    })
  }
})
