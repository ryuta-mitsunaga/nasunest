import { EventReport } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const body = await readBody(event)
    const { event_id, title, thumbnail, body: reportBody } = body

    // バリデーション
    if (!event_id || !title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'event_idとtitleは必須です',
      })
    }

    const eventReport = await EventReport.create({
      event_id: parseInt(event_id),
      admin_id: adminId,
      title,
      thumbnail: thumbnail || null,
      body: reportBody || null,
    })

    return {
      success: true,
      data: eventReport.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'イベントレポートの作成に失敗しました ' + error.message,
    })
  }
})

