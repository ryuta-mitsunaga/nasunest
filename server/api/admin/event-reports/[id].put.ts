import { EventReport, Admin } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'
import { editorJsToHtml } from '~~/server/lib/editorjs-to-html'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // マスターユーザーかどうかを確認
    const admin = await Admin.findByPk(adminId)
    const isMaster = admin?.isMaster || false

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { event_id, title, thumbnail, body: reportBody } = body

    // バリデーション
    if (!event_id || !title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'event_idとtitleは必須です',
      })
    }

    const whereCondition: any = { id }
    if (!isMaster) {
      whereCondition.admin_id = adminId
    }

    const eventReport = await EventReport.findOne({
      where: whereCondition,
    })

    if (!eventReport) {
      throw createError({
        statusCode: 404,
        statusMessage: 'イベントレポートが見つかりません',
      })
    }

    const bodyHtml = reportBody !== undefined ? (reportBody ? editorJsToHtml(reportBody) : null) : undefined

    await eventReport.update({
      event_id: parseInt(event_id),
      title,
      thumbnail: thumbnail || null,
      body: reportBody || null,
      ...(bodyHtml !== undefined && { body_html: bodyHtml }),
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
      statusMessage: 'イベントレポートの更新に失敗しました ' + error.message,
    })
  }
})

