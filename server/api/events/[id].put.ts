import { Event, EventCategory } from '~~/server/database'
import {
  uploadImage,
  deleteImage,
  base64ToBuffer,
  getFileExtensionFromBase64,
} from '~~/server/lib/supabase-repository'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const id = getRouterParam(event, 'id')
    const eventData = await Event.findOne({
      where: {
        id,
        admin_id: adminId,
      },
      include: [
        {
          model: EventCategory,
          as: 'categories',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
    })

    if (!eventData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'イベントが見つかりません',
      })
    }

    const body = await readBody(event)

    // 既存のthumbnail URLを取得（削除用）
    const existingThumbnailUrl = eventData.thumbnail as string | null
    let thumbnailUrl: string | null | undefined = undefined

    if (body.thumbnail && typeof body.thumbnail === 'string') {
      // Base64文字列の場合はSupabaseにアップロード
      try {
        const buffer = base64ToBuffer(body.thumbnail)
        const extension = getFileExtensionFromBase64(body.thumbnail)
        const fileName = `thumbnail.${extension}`

        const result = await uploadImage({
          file: buffer,
          fileName,
          folder: 'events',
          contentType: `image/${extension}`,
        })

        thumbnailUrl = result.url

        // 既存の画像を削除（新しい画像がアップロード成功した場合のみ）
        if (existingThumbnailUrl) {
          try {
            // URLからパスを抽出（例: https://xxx.supabase.co/storage/v1/object/public/event-thumbnail/events/xxx.png）
            const urlParts = existingThumbnailUrl.split('/event-thumbnail/')
            if (urlParts.length > 1) {
              // deleteImageはバケット名を含まないパスを期待する
              const filePath = urlParts[1]
              await deleteImage(filePath)
            }
          } catch (deleteError) {
            console.error('既存画像の削除エラー（無視）:', deleteError)
            // 削除エラーは無視（新しい画像はアップロード済み）
          }
        }
      } catch (uploadError: any) {
        console.error('画像アップロードエラー:', uploadError)
        throw createError({
          statusCode: 500,
          statusMessage: `画像のアップロードに失敗しました: ${uploadError.message}`,
        })
      }
    } else if (body.thumbnail === null) {
      // 明示的にnullが送信された場合はnullを設定（削除）
      thumbnailUrl = null

      // 既存の画像を削除
      if (existingThumbnailUrl) {
        try {
          const urlParts = existingThumbnailUrl.split('/event-thumbnail/')
          if (urlParts.length > 1) {
            const filePath = `event-thumbnail/${urlParts[1]}`
            await deleteImage(filePath)
          }
        } catch (deleteError) {
          console.error('既存画像の削除エラー（無視）:', deleteError)
        }
      }
    }
    // body.thumbnailがundefinedの場合は、thumbnailUrlもundefinedのまま（既存のthumbnailを保持）

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
      is_displayed: body.is_displayed,
      published_start: body.published_start || null,
      published_end: body.published_end || null,
      is_login_required: body.is_login_required !== undefined ? body.is_login_required : false,
    }

    if (thumbnailUrl !== undefined) {
      updateData.thumbnail = thumbnailUrl
    }

    await eventData.update(updateData)

    // カテゴリの関連付けを更新
    if (body.category_ids !== undefined) {
      if (Array.isArray(body.category_ids) && body.category_ids.length > 0) {
        const categories = await EventCategory.findAll({
          where: {
            id: body.category_ids,
          },
        })
        await eventData.setCategories(categories)
      } else {
        // 空配列の場合はすべてのカテゴリを削除
        await eventData.setCategories([])
      }
    }

    // カテゴリ情報を含めてリロード
    await eventData.reload({
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
      data: eventData.toJSON(),
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
