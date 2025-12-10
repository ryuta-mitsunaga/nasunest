import { Member } from '~~/server/database'
import {
  uploadImage,
  deleteImage,
  base64ToBuffer,
  getFileExtensionFromBase64,
} from '~~/server/lib/supabase-repository'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = getCookie(event, 'adminId')

    if (!adminId) {
      throw createError({
        statusCode: 401,
        statusMessage: '認証が必要です',
      })
    }

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    const member = await Member.findByPk(id)
    if (!member) {
      throw createError({
        statusCode: 404,
        statusMessage: 'メンバーが見つかりません',
      })
    }

    const memberData = member.toJSON() as any
    const existingIconUrl = memberData.icon

    // Base64文字列をSupabaseにアップロード
    let iconUrl: string | null | undefined = undefined
    if (body.icon && typeof body.icon === 'string') {
      // URLかBase64かを判定
      const isUrl =
        body.icon.startsWith('http://') || body.icon.startsWith('https://')

      if (isUrl) {
        // 既にURLの場合はそのまま使用（画像を変更しない場合）
        iconUrl = body.icon
      } else {
        // Base64文字列の場合はSupabaseにアップロード
        try {
          const buffer = base64ToBuffer(body.icon)
          const extension = getFileExtensionFromBase64(body.icon)
          const fileName = `icon.${extension}`

          const result = await uploadImage({
            file: buffer,
            fileName,
            folder: 'members',
            contentType: `image/${extension}`,
          })

          iconUrl = result.url

          // 既存の画像を削除（新しい画像がアップロード成功した場合のみ）
          if (
            existingIconUrl &&
            typeof existingIconUrl === 'string' &&
            existingIconUrl.startsWith('http') &&
            existingIconUrl !== result.url
          ) {
            try {
              // URLからパスを抽出（例: https://xxx.supabase.co/storage/v1/object/public/event-thumbnail/members/xxx.png）
              const urlParts = existingIconUrl.split('/event-thumbnail/')
              if (urlParts.length > 1) {
                // deleteImageはバケット名を含まないパスを期待する
                const filePath = urlParts[1]
                await deleteImage(filePath, 'event-thumbnail')
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
      }
    } else if (body.icon === null) {
      // 明示的にnullが送信された場合はnullを設定（削除）
      iconUrl = null

      // 既存の画像を削除
      if (
        existingIconUrl &&
        typeof existingIconUrl === 'string' &&
        existingIconUrl.startsWith('http')
      ) {
        try {
          const urlParts = existingIconUrl.split('/event-thumbnail/')
          if (urlParts.length > 1) {
            const filePath = urlParts[1]
            await deleteImage(filePath, 'event-thumbnail')
          }
        } catch (deleteError) {
          console.error('既存画像の削除エラー（無視）:', deleteError)
        }
      }
    }
    // body.iconがundefinedの場合は、iconUrlもundefinedのまま（既存のiconを保持）

    const updateData: any = {
      name_sei: body.name_sei,
      name_mei: body.name_mei,
      start_date: body.start_date,
      end_date: body.end_date || null,
      mission: body.mission,
      description: body.description,
      x_url: body.x_url || null,
      instagram_url: body.instagram_url || null,
      facebook_url: body.facebook_url || null,
    }

    if (iconUrl !== undefined) {
      updateData.icon = iconUrl
    }

    await member.update(updateData)

    // レスポンス用にiconを返す（既にURLとして保存されている）
    await member.reload()
    const updatedMemberData = member.toJSON()

    return {
      success: true,
      data: updatedMemberData,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'メンバーの更新に失敗しました',
    })
  }
})
