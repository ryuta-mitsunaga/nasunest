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
        statusMessage: 'ピックアップイベントの更新はマスターユーザーのみ可能です',
      })
    }

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    const pickupEvent = await PickupEvent.findByPk(id)
    if (!pickupEvent) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ピックアップイベントが見つかりません',
      })
    }

    await pickupEvent.update({
      pickup_datetime_start: body.pickup_datetime_start,
      pickup_datetime_end: body.pickup_datetime_end,
      left_text: body.left_text,
    })

    return {
      success: true,
      data: pickupEvent.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'ピックアップイベントの更新に失敗しました',
    })
  }
})

