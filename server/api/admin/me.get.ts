import { Admin, AdminPermission } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async (event) => {
  try {
    const adminId = requireAdminId(event)
    const admin = await Admin.findByPk(adminId, {
      include: [
        {
          model: AdminPermission,
          as: 'permissions',
          attributes: ['id', 'code', 'name'],
          through: { attributes: [] },
        },
      ],
    })

    if (!admin) {
      throw createError({
        statusCode: 404,
        statusMessage: '管理者が見つかりません',
      })
    }

    const adminData = admin.toJSON()

    return {
      success: true,
      data: {
        id: adminData.id,
        login_id: adminData.login_id,
        permissions: adminData.permissions || [],
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '認証情報の取得に失敗しました',
    })
  }
})

