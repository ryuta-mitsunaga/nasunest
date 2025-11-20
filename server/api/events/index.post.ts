import { Event } from '~~/server/database'

export default defineEventHandler(async (event) => {
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

    const body = await readBody(event)

    // Base64文字列をBufferに変換
    let thumbnailBuffer = null
    if (body.thumbnail && typeof body.thumbnail === 'string') {
      // data:image/png;base64, のプレフィックスを除去
      const base64Data = body.thumbnail.replace(/^data:image\/\w+;base64,/, '')
      thumbnailBuffer = Buffer.from(base64Data, 'base64')
    }

    const newEvent = await Event.create({
      title: body.title,
      form_id: body.form_id || null,
      start_date: body.start_date,
      end_date: body.end_date || null,
      description: body.description,
      location_name: body.location_name || null,
      location_address: body.location_address || null,
      location_url: body.location_url || null,
      thumbnail: thumbnailBuffer,
    })

    // レスポンス用にthumbnailをBase64文字列に変換
    const eventData = newEvent.toJSON()
    if (eventData.thumbnail && Buffer.isBuffer(eventData.thumbnail)) {
      eventData.thumbnail = `data:image/png;base64,${eventData.thumbnail.toString('base64')}`
    }

    return {
      success: true,
      data: eventData,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'イベントの作成に失敗しました',
    })
  }
})

