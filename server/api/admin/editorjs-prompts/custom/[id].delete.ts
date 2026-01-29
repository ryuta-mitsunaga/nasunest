import { EditorJsPromptCustom } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'プロンプトIDが必要です',
      })
    }

    // カスタムプロンプトを取得（admin_idでフィルタリング）
    const customPrompt = await EditorJsPromptCustom.findOne({
      where: {
        id: parseInt(id, 10),
        admin_id: adminId,
      },
    })

    if (!customPrompt) {
      throw createError({
        statusCode: 404,
        message: 'プロンプトが見つかりません',
      })
    }

    // カスタムプロンプトを削除
    await customPrompt.destroy()

    return {
      success: true,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('カスタムプロンプト削除エラー:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'カスタムプロンプトの削除に失敗しました',
    })
  }
})
