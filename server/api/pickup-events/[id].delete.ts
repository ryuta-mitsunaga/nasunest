import { PickupEvent } from '~~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const adminIdStr = getCookie(event, 'adminId')
    if (!adminIdStr) {
      throw createError({
        statusCode: 401,
        statusMessage: '認証が必要です',
      })
    }

    const id = getRouterParam(event, 'id')
    const pickupEvent = await PickupEvent.findByPk(id)

    if (!pickupEvent) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ピックアップイベントが見つかりません',
      })
    }

    await pickupEvent.destroy()

    return {
      success: true,
      message: 'ピックアップイベントを削除しました',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'ピックアップイベントの削除に失敗しました',
    })
  }
})

