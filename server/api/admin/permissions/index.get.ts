import { AdminPermission } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    requireAdminId(event)

    const permissions = await AdminPermission.findAll({
      order: [['id', 'ASC']],
    })

    return {
      success: true,
      data: permissions.map(p => p.toJSON()),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('権限取得エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '権限の取得に失敗しました',
    })
  }
})

