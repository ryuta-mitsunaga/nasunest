import { Admin } from '~~/server/database'
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

    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'IDが指定されていません',
      })
    }

    const adminId = parseInt(adminIdStr, 10)
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

