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

    const body = await readBody(event)
    const { name, prompt } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      throw createError({
        statusCode: 400,
        message: 'プロンプト名が必要です',
      })
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      throw createError({
        statusCode: 400,
        message: 'プロンプト内容が必要です',
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

    // カスタムプロンプトを更新
    await customPrompt.update({
      name: name.trim(),
      prompt: prompt.trim(),
    })

    return {
      success: true,
      data: customPrompt.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('カスタムプロンプト更新エラー:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'カスタムプロンプトの更新に失敗しました',
    })
  }
})
