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

    const id = getRouterParam(event, 'id')
    const originalEvent = await Event.findByPk(id)

    if (!originalEvent) {
      throw createError({
        statusCode: 404,
        statusMessage: 'イベントが見つかりません',
      })
    }

    // 元のイベントデータを取得
    const originalData = originalEvent.toJSON()

    // サムネイルをコピー（Bufferの場合はそのまま、Base64の場合は変換）
    let thumbnailBuffer = null
    if (originalData.thumbnail) {
      if (Buffer.isBuffer(originalData.thumbnail)) {
        // Bufferの場合はそのままコピー
        thumbnailBuffer = Buffer.from(originalData.thumbnail)
      } else if (typeof originalData.thumbnail === 'string' && originalData.thumbnail.startsWith('data:image')) {
        // Base64文字列の場合はBufferに変換
        const base64Data = originalData.thumbnail.replace(/^data:image\/\w+;base64,/, '')
        thumbnailBuffer = Buffer.from(base64Data, 'base64')
      }
    }

    // 新しいイベントを作成（タイトルに「コピー」を追加）
    const newEvent = await Event.create({
      title: `${originalData.title} (コピー)`,
      form_id: originalData.form_id,
      start_date: originalData.start_date,
      end_date: originalData.end_date,
      description: originalData.description,
      location_name: originalData.location_name,
      location_address: originalData.location_address,
      location_url: originalData.location_url,
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
      statusMessage: 'イベントのコピーに失敗しました',
    })
  }
})

