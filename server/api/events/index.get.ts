import { Event, Form } from '~~/server/database'
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

        return {
          ...eventData,
          form: eventData.form || null,
          status,
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
