import { Admin } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    const adminId = requireAdminId(event)

    const body = await readBody<{ icon_url: string | null }>(event)

    const admin = await Admin.findByPk(adminId)
    if (!admin) {
      throw createError({
        statusCode: 404,
        statusMessage: '管理者が見つかりません',
      })
    }

    const iconUrl =
      body.icon_url !== undefined
        ? body.icon_url && typeof body.icon_url === 'string'
          ? body.icon_url
          : null
        : undefined

    if (iconUrl !== undefined) {
      await admin.update({ icon_url: iconUrl })
    }

    return {
      success: true,
      data: { icon_url: admin.icon_url },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'アイコンの更新に失敗しました',
    })
  }
})
