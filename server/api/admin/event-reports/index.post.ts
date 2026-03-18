import { EventReport } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'
import { editorJsToHtml } from '~~/server/lib/editorjs-to-html'

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

    const bodyHtml = reportBody ? editorJsToHtml(reportBody) : null

    const eventReport = await EventReport.create({
      event_id: parseInt(event_id),
      admin_id: adminId,
      title,
      thumbnail: thumbnail || null,
      body: reportBody || null,
      body_html: bodyHtml,
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

