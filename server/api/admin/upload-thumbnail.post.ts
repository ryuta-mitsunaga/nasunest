import { uploadImage } from '~~/server/lib/supabase-repository'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    requireAdminId(event)

    // multipart/form-data を読み取る
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '画像ファイルが必要です',
      })
    }

    // ファイルを取得
    const imageFile = formData.find(item => item.name === 'thumbnail')

    if (!imageFile || !imageFile.data) {
      throw createError({
        statusCode: 400,
        statusMessage: '画像ファイルが見つかりません',
      })
    }

    // ファイルサイズをチェック（10MB制限）
    const maxFileSize = 10 * 1024 * 1024 // 10MB
    const fileSize = imageFile.data.length
    if (fileSize > maxFileSize) {
      throw createError({
        statusCode: 413,
        statusMessage: `ファイルサイズが大きすぎます。最大${maxFileSize / 1024 / 1024}MBまでアップロード可能です。`,
      })
    }

    // ファイル名と拡張子を取得
    const originalFileName = imageFile.filename || 'thumbnail'
    const extension = originalFileName.split('.').pop() || 'png'
    const contentType = imageFile.type || `image/${extension}`

    // Buffer に変換
    const buffer = Buffer.from(imageFile.data)

    // Supabase Storage にアップロード
    const result = await uploadImage({
      file: buffer,
      fileName: originalFileName,
      folder: 'events',
      contentType,
    })

    return {
      success: true,
      data: {
        url: result.url,
        path: result.path,
      },
    }
  } catch (error: any) {
    console.error('画像アップロードエラー:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '画像のアップロードに失敗しました',
    })
  }
})

