import { Event, EventCategory, Admin } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // マスターユーザーかどうかを確認
    const admin = await Admin.findByPk(adminId)
    const isMaster = admin?.isMaster || false

    const id = getRouterParam(event, 'id')
    const whereCondition: any = { id }
    if (!isMaster) {
      whereCondition.admin_id = adminId
    }

    const eventData = await Event.findOne({
      where: whereCondition,
      include: [
        {
          model: EventCategory,
          as: 'categories',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
    })

    if (!eventData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'イベントが見つかりません',
      })
    }

    // thumbnailは既にURLなので変換不要
    return {
      success: true,
      data: eventData.toJSON(),
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'イベントの取得に失敗しました',
    })
  }
})
