import { EditorJsPromptMaster, EditorJsPromptCustom } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // デフォルトプロンプトを取得（display_orderでソート）
    const masterPrompts = await EditorJsPromptMaster.findAll({
      order: [['display_order', 'ASC']],
    })

    // カスタムプロンプトを取得（現在のadminのもののみ）
    const customPrompts = await EditorJsPromptCustom.findAll({
      where: {
        admin_id: adminId,
      },
      order: [['createdAt', 'DESC']],
    })

    return {
      success: true,
      data: {
        master: masterPrompts.map(p => p.toJSON()),
        custom: customPrompts.map(p => p.toJSON()),
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('プロンプト取得エラー:', error)
    throw createError({
      statusCode: 500,
      message: 'プロンプトの取得に失敗しました',
    })
  }
})
