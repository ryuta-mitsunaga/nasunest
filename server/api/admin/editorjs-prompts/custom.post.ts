import { EditorJsPromptCustom } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

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

    // カスタムプロンプトを作成
    const customPrompt = await EditorJsPromptCustom.create({
      admin_id: adminId,
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
    console.error('カスタムプロンプト作成エラー:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'カスタムプロンプトの作成に失敗しました',
    })
  }
})
