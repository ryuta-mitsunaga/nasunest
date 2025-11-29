import { Event, EventCategory } from '~~/server/database'
import {
  uploadImage,
  downloadImageFromUrl,
  getFileExtensionFromUrl,
} from '~~/server/lib/supabase-repository'

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
    const originalEvent = await Event.findOne({
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

    if (!originalEvent) {
      throw createError({
        statusCode: 404,
        statusMessage: 'イベントが見つかりません',
      })
    }

    // 元のイベントデータを取得
    const originalData = originalEvent.toJSON() as any

    // 元のイベントのカテゴリを取得（includeで取得したカテゴリを使用）
    const originalCategories = (originalEvent as any).categories || []

    // サムネイル画像を新しいファイルとしてアップロード
    let thumbnailUrl: string | null = null
    if (originalData.thumbnail && typeof originalData.thumbnail === 'string') {
      try {
        // URLから画像をダウンロード
        const imageBuffer = await downloadImageFromUrl(originalData.thumbnail)
        const extension = getFileExtensionFromUrl(originalData.thumbnail)
        const fileName = `thumbnail.${extension}`

        // 新しいファイルとしてSupabaseにアップロード
        const result = await uploadImage({
          file: imageBuffer,
          fileName,
          folder: 'events',
          contentType: `image/${extension}`,
        })

        thumbnailUrl = result.url
        console.log(`[Event Copy] 画像をコピーしました: ${result.url}`)
      } catch (uploadError: any) {
        console.error('画像コピーエラー:', uploadError)
        // 画像のコピーに失敗してもイベントのコピーは続行（thumbnailはnullになる）
        thumbnailUrl = null
      }
    }

    // 新しいイベントを作成（タイトルに「コピー」を追加）
    const newEvent = await Event.create({
      admin_id: adminId,
      title: `${originalData.title} (コピー)`,
      form_id: originalData.form_id,
      start_date: originalData.start_date,
      end_date: originalData.end_date,
      description: originalData.description,
      body: originalData.body,
      location_name: originalData.location_name,
      location_address: originalData.location_address,
      location_url: originalData.location_url,
      thumbnail: thumbnailUrl as any,
      cta_button_text: originalData.cta_button_text || null,
      is_published: originalData.is_published ?? true,
      published_start: originalData.published_start || null,
      published_end: originalData.published_end || null,
    })

    // カテゴリの関連付け（元のイベントから直接取得したカテゴリを使用）
    if (originalCategories && originalCategories.length > 0) {
      await (newEvent as any).setCategories(originalCategories)
      console.log(
        `[Event Copy] カテゴリをコピーしました: ${originalCategories.length}件`
      )
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
      statusMessage: 'イベントのコピーに失敗しました',
    })
  }
})
