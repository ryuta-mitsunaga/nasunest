import { Form } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const body = await readBody(event)

    const form = await Form.create({
      admin_id: adminId,
      name: body.name,
      content: body.content || { fields: [] },
      published_start: body.published_start || null,
      published_end: body.published_end || null,
    })

    return {
      success: true,
      data: form.toJSON(),
    }
  } catch (error: any) {
    console.error(error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'フォームの作成に失敗しました',
    })
  }
})
