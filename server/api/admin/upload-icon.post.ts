import { uploadImage } from '~~/server/lib/supabase-repository'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    requireAdminId(event)

    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '画像ファイルが必要です',
      })
    }

    const imageFile = formData.find(item => item.name === 'icon')

    if (!imageFile || !imageFile.data) {
      throw createError({
        statusCode: 400,
        statusMessage: '画像ファイルが見つかりません',
      })
    }

    const maxFileSize = 2 * 1024 * 1024 // 2MB
    if (imageFile.data.length > maxFileSize) {
      throw createError({
        statusCode: 413,
        statusMessage: `ファイルサイズが大きすぎます。最大${maxFileSize / 1024 / 1024}MBまでアップロード可能です。`,
      })
    }

    const originalFileName = imageFile.filename || 'icon'
    const extension = originalFileName.split('.').pop() || 'png'
    const contentType = imageFile.type || `image/${extension}`
    const buffer = Buffer.from(imageFile.data)

    const result = await uploadImage({
      file: buffer,
      fileName: originalFileName,
      folder: 'admin-icons',
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
    console.error('アイコンアップロードエラー:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'アイコンのアップロードに失敗しました',
    })
  }
})
