import { FormAnswer, Event } from '~~/server/database'
import { requireUserId } from '~~/server/lib/user-auth'
import { Op } from 'sequelize'
import dayjs from '~~/server/lib/dayjs'

export default defineEventHandler(async event => {
  try {
    const userId = requireUserId(event)

    // UTCの現在時刻を取得（DBにUTCで保存されているため、分まで考慮）
    const now = dayjs.utc().toDate()

    // ユーザーが申し込みしたイベントを取得（開催期間を過ぎていないもののみ）
    const formAnswers = await FormAnswer.findAll({
      where: {
        user_id: userId,
        event_id: { [Op.ne]: null }, // event_idがnullでないもの
      },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'start_date', 'end_date'],
          required: true,
          where: {
            // 終了していないイベントのみ（分まで考慮）
            [Op.or]: [
              // start_date <= now && end_date >= now
              {
                [Op.and]: [
                  { start_date: { [Op.lte]: now } },
                  { end_date: { [Op.gte]: now } },
                ],
              },
              // start_date >= now && end_date IS NULL
              {
                [Op.and]: [
                  { start_date: { [Op.gte]: now } },
                  { end_date: null },
                ],
              },
            ],
          },
        },
      ],
      attributes: ['id', 'event_id', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
    })

    // データを整形
    const applications = formAnswers
      .map(answer => {
        const eventData = (answer as any).event.dataValues as Event
        if (!eventData) {
          // eventが取得できなかった場合はスキップ（通常は発生しない）
          return null
        }

        const answerData = answer.dataValues

        return {
          id: answerData.id,
          event_id: eventData.id,
          event_title: eventData.title,
          start_date: eventData.start_date,
          end_date: eventData.end_date,
          status: answerData.status ?? 0, // 0: 回答待ち, 1: OK, 2: NG
          applied_at: answerData.createdAt,
        }
      })
      .filter((app): app is NonNullable<typeof app> => app !== null)

    return {
      success: true,
      data: applications,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: '申し込み中のイベントの取得に失敗しました',
    })
  }
})
