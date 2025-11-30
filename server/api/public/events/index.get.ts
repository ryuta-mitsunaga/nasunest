import { Event, EventCategory } from '~~/server/database'
import { Op } from 'sequelize'

export default defineEventHandler(async event => {
  const startTime = Date.now()
  try {
    // 公開用なので認証不要でイベントを取得（公開されているもののみ）
    // 公開期間を考慮
    const today = new Date()
    today.setHours(0, 0, 0, 0)

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

    const queryStartTime = Date.now()

    // 検索条件を構築
    const whereConditions: any[] = [
      {
        is_published: true,
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
        ],
      })
    }

    // 開催日絞り込み
    if (startDate) {
      const startDateObj = new Date(startDate)
      startDateObj.setHours(0, 0, 0, 0)
      // 指定した開始日以降に開始する、または指定した開始日以降に終了するイベント
      whereConditions.push({
        [Op.or]: [
          { start_date: { [Op.gte]: startDateObj } },
          { end_date: { [Op.gte]: startDateObj } },
        ],
      })
    }

    if (endDate) {
      const endDateObj = new Date(endDate)
      endDateObj.setHours(23, 59, 59, 999)
      // 指定した終了日以前に開始する、または指定した終了日以前に終了するイベント
      whereConditions.push({
        [Op.or]: [
          { start_date: { [Op.lte]: endDateObj } },
          { end_date: { [Op.lte]: endDateObj } },
        ],
      })
    }

    // カテゴリフィルタリング用のinclude設定
    const categoryInclude: any = {
      model: EventCategory,
      as: 'categories',
      attributes: ['id', 'name'],
      through: { attributes: [] },
    }

    // カテゴリフィルタがある場合は、required: trueでフィルタリング
    if (categoryIds.length > 0) {
      categoryInclude.where = {
        id: { [Op.in]: categoryIds },
      }
      categoryInclude.required = true
    }

    const dbQueryStartTime = Date.now()

    // カウントクエリ
    const countStart = Date.now()
    const count = await Event.count({
      where: {
        [Op.and]: whereConditions,
      },
      distinct: true,
      include: categoryIds.length > 0 ? [categoryInclude] : [],
    })
    const countTime = Date.now() - countStart
    console.log(`[Events API] Count query time: ${countTime}ms`)

    // データ取得クエリ（カテゴリも一緒に取得）
    const dataStart = Date.now()
    const events = await Event.findAll({
      where: {
        [Op.and]: whereConditions,
      },
      include: [categoryInclude],
      attributes: {
        exclude: ['body'], // 大きなデータを除外
      },
      order: [['start_date', 'DESC']],
      limit,
      offset,
    })
    const dataTime = Date.now() - dataStart
    console.log(`[Events API] Data query time: ${dataTime}ms`)

    const dbQueryEndTime = Date.now()
    console.log(
      `[Events API] DB Query time: ${dbQueryEndTime - dbQueryStartTime}ms (Count: ${countTime}ms, Data: ${dataTime}ms)`
    )

    // thumbnailは既にURLなので変換不要
    const eventsData = events.map(event => event.toJSON())

    const totalPages = Math.ceil(count / limit)
    const hasMore = page < totalPages

    const endTime = Date.now()
    console.log(
      `[Events API] Total time: ${endTime - startTime}ms (Query setup: ${dbQueryStartTime - queryStartTime}ms, DB: ${dbQueryEndTime - dbQueryStartTime}ms)`
    )

    return {
      success: true,
      data: eventsData,
      pagination: {
        page,
        limit,
        total: count,
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
      message: 'イベントの取得に失敗しました',
    })
  }
})
