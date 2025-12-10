import { Event, EventCategory } from '~~/server/database'
import {
  uploadImage,
  base64ToBuffer,
  getFileExtensionFromBase64,
} from '~~/server/lib/supabase-repository'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const body = await readBody(event)

    // Base64文字列をSupabaseにアップロード
    let thumbnailUrl = null
    if (body.thumbnail && typeof body.thumbnail === 'string') {
      // URLかBase64かを判定
      const isUrl =
        body.thumbnail.startsWith('http://') ||
        body.thumbnail.startsWith('https://')

      if (isUrl) {
        // 既にURLの場合はそのまま使用（画像を変更しない場合）
        thumbnailUrl = body.thumbnail
      } else {
        // Base64文字列の場合はSupabaseにアップロード
        try {
          // Base64文字列をBufferに変換
          const buffer = base64ToBuffer(body.thumbnail)
          const extension = getFileExtensionFromBase64(body.thumbnail)
          const fileName = `thumbnail.${extension}`

          // Supabaseにアップロード
          const result = await uploadImage({
            file: buffer,
            fileName,
            folder: 'events',
            contentType: `image/${extension}`,
          })

          thumbnailUrl = result.url
        } catch (uploadError: any) {
          console.error('画像アップロードエラー:', uploadError)
          throw createError({
            statusCode: 500,
            statusMessage: `画像のアップロードに失敗しました: ${uploadError.message}`,
          })
        }
      }
    }

    const newEvent = await Event.create({
      admin_id: adminId,
      title: body.title,
      form_id: body.form_id || null,
      start_date: body.start_date,
      end_date: body.end_date || null,
      description: body.description,
      body: body.body || null,
      location_name: body.location_name || null,
      location_address: body.location_address || null,
      location_url: body.location_url || null,
      thumbnail: thumbnailUrl,
      cta_button_text: body.cta_button_text || null,
      is_displayed: body.is_displayed,
      published_start: body.published_start || null,
      published_end: body.published_end || null,
      capacity: body.capacity ? parseInt(body.capacity, 10) : null,
      approval_type:
        body.approval_type !== undefined ? parseInt(body.approval_type, 10) : 0,
    })

    // カテゴリの関連付け
    if (
      body.category_ids &&
      Array.isArray(body.category_ids) &&
      body.category_ids.length > 0
    ) {
      const categories = await EventCategory.findAll({
        where: {
          id: body.category_ids,
        },
      })
      await (newEvent as any).setCategories(categories)
    }

    // カテゴリ情報を含めてリロード
    await newEvent.reload({
      include: [
        {
          model: EventCategory,
          as: 'categories',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
    })

    return {
      success: true,
      data: newEvent.toJSON(),
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
