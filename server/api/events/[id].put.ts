import { Event } from '~~/server/database'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminIdStr = getCookie(event, 'adminId')

    if (!adminIdStr) {
      throw createError({
        statusCode: 401,
        statusMessage: '認証が必要です',
      })
    }

    const adminId = parseInt(adminIdStr, 10)
    if (isNaN(adminId)) {
      throw createError({
        statusCode: 401,
        statusMessage: '認証情報が無効です',
      })
    }

    const id = getRouterParam(event, 'id')
    const eventData = await Event.findOne({
      where: {
        id,
        admin_id: adminId,
      },
    })

    if (!eventData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'イベントが見つかりません',
      })
    }

    const body = await readBody(event)

    // Base64文字列をBufferに変換
    let thumbnailBuffer: Buffer | null | undefined = undefined
    if (body.thumbnail && typeof body.thumbnail === 'string') {
      // data:image/png;base64, のプレフィックスを除去
      const base64Data = body.thumbnail.replace(/^data:image\/\w+;base64,/, '')
      thumbnailBuffer = Buffer.from(base64Data, 'base64')
    } else if (body.thumbnail === null) {
      // 明示的にnullが送信された場合はnullを設定（削除）
      thumbnailBuffer = null
    }
    // body.thumbnailがundefinedの場合は、thumbnailBufferもundefinedのまま（既存のthumbnailを保持）

    const updateData: any = {
      title: body.title,
      form_id: body.form_id || null,
      start_date: body.start_date,
      end_date: body.end_date || null,
      description: body.description,
      body: body.body || null,
      location_name: body.location_name || null,
      location_address: body.location_address || null,
      location_url: body.location_url || null,
      cta_button_text: body.cta_button_text || null,
      is_published: body.is_published,
      published_start: body.published_start || null,
      published_end: body.published_end || null,
    }

    if (thumbnailBuffer !== undefined) {
      updateData.thumbnail = thumbnailBuffer
    }

    await eventData.update(updateData)

    // レスポンス用にthumbnailをBase64文字列に変換
    await eventData.reload()
    const eventDataJson = eventData.toJSON()
    if (eventDataJson.thumbnail && Buffer.isBuffer(eventDataJson.thumbnail)) {
      eventDataJson.thumbnail = `data:image/png;base64,${eventDataJson.thumbnail.toString('base64')}`
    }

    return {
      success: true,
      data: eventDataJson,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'イベントの更新に失敗しました',
    })
  }
})
