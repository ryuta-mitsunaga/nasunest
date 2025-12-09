import { FormAnswer, Event } from '~~/server/database'
import { requireUserId } from '~~/server/lib/user-auth'
import { Op } from 'sequelize'

export default defineEventHandler(async event => {
  try {
    const userId = requireUserId(event)

    // 今日の日付を取得（時刻部分を0時0分0秒に設定）
    const today = new Date()
    today.setHours(0, 0, 0, 0)

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
            // 終了していないイベントのみ
            [Op.or]: [
              // start_date <= today && end_date >= today
              {
                [Op.and]: [
                  { start_date: { [Op.lte]: today } },
                  { end_date: { [Op.gte]: today } },
                ],
              },
              // start_date >= today && end_date IS NULL
              {
                [Op.and]: [
                  { start_date: { [Op.gte]: today } },
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
