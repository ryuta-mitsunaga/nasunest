import { supabase } from '~~/server/lib/supabase'

export interface UploadImageOptions {
  file: Buffer | ArrayBuffer | Uint8Array
  fileName: string
  folder?: string
  contentType?: string
}

export interface UploadImageResult {
  url: string
  path: string
}

/**
 * Supabase Storageに画像をアップロード
 */
export async function uploadImage(
  options: UploadImageOptions
): Promise<UploadImageResult> {
  const {
    file,
    fileName,
    folder = 'events',
    contentType = 'image/png',
  } = options

  // ファイルパスを生成（フォルダ名/タイムスタンプ-ファイル名）
  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filePath = folder
    ? `${folder}/${timestamp}-${sanitizedFileName}`
    : `${timestamp}-${sanitizedFileName}`

  try {
    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from('event-thumbnail')
      .upload(filePath, file, {
        contentType,
        upsert: false, // 既存ファイルは上書きしない
      })

    // エラーが発生した場合は、エラーレスポンスを返す
    if (error) {
      throw new Error(`画像のアップロードに失敗しました: ${error.message}`)
    }

    // 公開URLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from('event-thumbnail').getPublicUrl(filePath)

    console.log(`[Supabase] 画像アップロード成功: ${filePath}`)
    console.log(`[Supabase] 公開URL: ${publicUrl}`)

    return {
      url: publicUrl,
      path: filePath,
    }
  } catch (error: any) {
    // 予期しないエラーが発生した場合は、エラーを再スロー
    if (error.message) {
      throw error
    }
    throw new Error('画像のアップロード中に予期しないエラーが発生しました')
  }
}

/**
 * Supabase Storageから画像を削除
 */
export async function deleteImage(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('event-thumbnail')
      .remove([filePath])

    // エラーが発生した場合は、ログに記録（削除エラーは致命的ではないため、エラーを投げない）
    if (error) {
      console.error(`画像の削除に失敗しました: ${error.message}`)
    }
  } catch (error: any) {
    // 予期しないエラーが発生した場合は、ログに記録
    console.error('画像の削除中に予期しないエラーが発生しました:', error)
  }
}

/**
 * Base64文字列をBufferに変換
 */
export function base64ToBuffer(base64String: string): Buffer {
  // data:image/png;base64, のプレフィックスを除去
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '')
  return Buffer.from(base64Data, 'base64')
}

/**
 * Base64文字列からファイル名を推測（拡張子を取得）
 */
export function getFileExtensionFromBase64(base64String: string): string {
  const match = base64String.match(/^data:image\/(\w+);base64,/)
  if (match && match[1]) {
    return match[1]
  }
  return 'png' // デフォルトはpng
}

/**
 * URLから画像をダウンロードしてBufferに変換
 */
export async function downloadImageFromUrl(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(
        `画像のダウンロードに失敗しました: ${response.statusText}`
      )
    }
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error: any) {
    throw new Error(
      `画像のダウンロード中にエラーが発生しました: ${error.message}`
    )
  }
}

/**
 * URLからファイル拡張子を取得
 */
export function getFileExtensionFromUrl(url: string): string {
  // URLから拡張子を抽出（例: https://xxx.supabase.co/.../thumbnail.png）
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
  if (match && match[1]) {
    return match[1].toLowerCase()
  }
  return 'png' // デフォルトはpng
}
