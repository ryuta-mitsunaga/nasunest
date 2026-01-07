import { PickupEvent, Admin } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // マスターユーザーかどうかを確認
    const admin = await Admin.findByPk(adminId)
    const isMaster = admin?.isMaster || false

    if (!isMaster) {
      throw createError({
        statusCode: 403,
        statusMessage: 'ピックアップイベントの削除はマスターユーザーのみ可能です',
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

