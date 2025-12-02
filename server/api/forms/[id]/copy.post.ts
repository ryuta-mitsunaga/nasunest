import { Form } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const id = getRouterParam(event, 'id')
    const originalForm = await Form.findOne({
      where: {
        id,
        admin_id: adminId,
      },
    })

    if (!originalForm) {
      throw createError({
        statusCode: 404,
        statusMessage: 'フォームが見つかりません',
      })
    }

    // 元のフォームデータを取得
    const originalData = originalForm.toJSON()

    // 新しいフォームを作成（名前に「コピー」を追加）
    const newForm = await Form.create({
      admin_id: adminId,
      name: `${originalData.name} (コピー)`,
      content: originalData.content || { fields: [] },
    })

    return {
      success: true,
      data: newForm.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'フォームのコピーに失敗しました',
    })
  }
})

