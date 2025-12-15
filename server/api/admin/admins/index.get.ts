import { Admin, AdminPermission } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    requireAdminId(event)

    const admins = await Admin.findAll({
      include: [
        {
          model: AdminPermission,
          as: 'permissions',
          attributes: ['id', 'code', 'name'],
          through: { attributes: [] },
        },
      ],
      order: [['id', 'ASC']],
    })

    return {
      success: true,
      data: admins.map(admin => {
        const adminData = admin.toJSON()
        return {
          ...adminData,
          password: undefined, // パスワードは返さない
        }
      }),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('管理者取得エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '管理者の取得に失敗しました',
    })
  }
})

