import { Admin, AdminPermission } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // マスターユーザーまたはadmin_management権限があるかチェック
    const currentAdmin = await Admin.findByPk(adminId, {
      include: [
        {
          model: AdminPermission,
          as: 'permissions',
          attributes: ['code'],
          through: { attributes: [] },
        },
      ],
    })

    if (!currentAdmin) {
      throw createError({
        statusCode: 404,
        statusMessage: '管理者が見つかりません',
      })
    }

    const adminData = currentAdmin.toJSON() as any
    const hasAdminManagementPermission = adminData.permissions?.some(
      (p: any) => p.code === 'admin_management'
    )

    if (!adminData.isMaster && !hasAdminManagementPermission) {
      throw createError({
        statusCode: 403,
        statusMessage: '管理者管理の権限がありません',
      })
    }

    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'IDが指定されていません',
      })
    }
    const targetId = parseInt(id, 10)

    // 自分自身を削除できないようにする
    if (adminId === targetId) {
      throw createError({
        statusCode: 400,
        statusMessage: '自分自身を削除することはできません',
      })
    }

    const admin = await Admin.findByPk(id)
    if (!admin) {
      throw createError({
        statusCode: 404,
        statusMessage: '管理者が見つかりません',
      })
    }

    await admin.destroy()

    return {
      success: true,
      message: '管理者を削除しました',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('管理者削除エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '管理者の削除に失敗しました',
    })
  }
})

