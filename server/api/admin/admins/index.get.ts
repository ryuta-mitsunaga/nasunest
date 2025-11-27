import { Admin, AdminPermission } from '~~/server/database'
import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    const adminIdStr = getCookie(event, 'adminId')
    if (!adminIdStr) {
      throw createError({
        statusCode: 401,
        statusMessage: '認証が必要です',
      })
    }

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

