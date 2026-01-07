import { EventReport, Event, Admin } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // マスターユーザーかどうかを確認
    const admin = await Admin.findByPk(adminId)
    const isMaster = admin?.isMaster || false

    const whereCondition: any = isMaster ? {} : { admin_id: adminId }

    const eventReports = await EventReport.findAll({
      where: whereCondition,
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'start_date'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    return {
      success: true,
      data: eventReports.map(report => report.toJSON()),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'イベントレポートの取得に失敗しました ' + error.message,
    })
  }
})

