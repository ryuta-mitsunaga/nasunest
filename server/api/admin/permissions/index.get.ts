import { AdminPermission } from '~~/server/database'
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

