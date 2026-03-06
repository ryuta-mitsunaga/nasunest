import { Event, EventCategory, Form } from '~~/server/database'
import {
  uploadImage,
  downloadImageFromUrl,
  getFileExtensionFromUrl,
} from '~~/server/lib/supabase-repository'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

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

    // フォームをコピー（元のイベントにフォームが紐づいている場合）
    let newFormId: number | null = null
    if (originalData.form_id) {
      try {
        const originalForm = await Form.findOne({
          where: {
            id: originalData.form_id,
            admin_id: adminId,
          },
        })

        if (originalForm) {
          const originalFormData = originalForm.toJSON()
          const newForm = await Form.create({
            admin_id: adminId,
            name: `${originalFormData.name} (コピー)`,
            content: originalFormData.content || { fields: [] },
            published_start: originalFormData.published_start || null,
            published_end: originalFormData.published_end || null,
          })
          newFormId = newForm.id
          console.log(`[Event Copy] フォームをコピーしました: ${newForm.id}`)
        }
      } catch (formError: any) {
        console.error('フォームコピーエラー:', formError)
        // フォームのコピーに失敗してもイベントのコピーは続行（form_idはnullになる）
        newFormId = null
      }
    }

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
    // 作成時は非表示にする
    // 承認なしにする
    const newEvent = await Event.create({
      admin_id: adminId,
      title: `${originalData.title} (コピー)`,
      form_id: newFormId,
      start_date: originalData.start_date,
      end_date: originalData.end_date,
      description: originalData.description,
      body: originalData.body,
      location_name: originalData.location_name,
      location_address: originalData.location_address,
      location_url: originalData.location_url,
      thumbnail: thumbnailUrl as any,
      cta_button_text: originalData.cta_button_text || null,
      is_displayed: false,
      published_start: originalData.published_start || null,
      published_end: originalData.published_end || null,
      approval_type: 2,
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
