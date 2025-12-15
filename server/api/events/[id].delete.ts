import { Event } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const id = getRouterParam(event, 'id')
    const eventData = await Event.findOne({
      where: {
        id,
        admin_id: adminId,
      },
    })

    if (!eventData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'イベントが見つかりません',
      })
    }

    await eventData.destroy()

    return {
      success: true,
      message: 'イベントを削除しました',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'イベントの削除に失敗しました',
    })
  }
})

