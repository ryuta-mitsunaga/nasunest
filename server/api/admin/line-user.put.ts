import { Admin } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async (event) => {
  try {
    const adminId = requireAdminId(event)
    const body = await readBody<{ line_user_id?: string | null }>(event)

    const lineUserId =
      body?.line_user_id && typeof body.line_user_id === 'string'
        ? body.line_user_id.trim()
        : null

    const admin = await Admin.findByPk(adminId)
    if (!admin) {
      throw createError({
        statusCode: 404,
        statusMessage: '管理者が見つかりません',
      })
    }

    admin.line_user_id = lineUserId || null
    await admin.save()

    return {
      success: true,
      data: {
        id: admin.id,
        line_user_id: admin.line_user_id,
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'LINE連携情報の更新に失敗しました',
    })
  }
})


