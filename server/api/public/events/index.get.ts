import { Event, EventCategory, Form } from '~~/server/database'
import { Op } from 'sequelize'
import dayjs from 'dayjs'

export default defineEventHandler(async event => {
  try {
    // 公開用なので認証不要でイベントを取得（公開されているもののみ）
    // 公開期間を考慮
    const today = dayjs().startOf('day').toDate()

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
              { published_start: { [Op.lte]: today } },
            ],
          },
          {
            [Op.or]: [
              { published_end: null },
              { published_end: { [Op.gte]: today } },
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

    // 開催日絞り込み
    if (startDate) {
      const startDateObj = dayjs(startDate).startOf('day').toDate()
      // 指定した開始日以降に開始する、または指定した開始日以降に終了するイベント
      whereConditions.push({
        [Op.or]: [
          { start_date: { [Op.gte]: startDateObj } },
          { end_date: { [Op.gte]: startDateObj } },
        ],
      })
    }

    if (endDate) {
      const endDateObj = dayjs(endDate).endOf('day').toDate()
      // 指定した終了日以前に開始する、または指定した終了日以前に終了するイベント
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

      const isEventEnded = eventData.end_date
        ? dayjs(eventData.end_date).isBefore(dayjs(), 'day')
        : false

      const isRecruitmentEnded = eventData.form?.published_end
        ? dayjs(eventData.form.published_end).isBefore(dayjs(), 'day')
        : false

      return !(isEventEnded || isRecruitmentEnded)
    })

    // フィルタリング後のデータをマッピング
    const eventsData = filteredEvents.map(event => {
      const eventData = event.toJSON() as any

      // ステータスを計算
      let status:
        | 'published'
        | 'unpublished'
        | 'closed'
        | 'recruitment_closed' = 'published'

      // イベントが終了しているかどうかを判定（dayjsでタイムゾーンに依存しない比較）
      const isEventEnded = eventData.end_date
        ? dayjs(eventData.end_date).isBefore(dayjs(), 'day')
        : false

      // 募集が終了しているかどうかを判定（dayjsでタイムゾーンに依存しない比較）
      const isRecruitmentEnded = eventData.form?.published_end
        ? dayjs(eventData.form.published_end).isBefore(dayjs(), 'day')
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

      return {
        ...eventData,
        status,
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
