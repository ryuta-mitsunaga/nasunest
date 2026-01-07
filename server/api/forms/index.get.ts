import { Form, FormAnswer, Admin } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // マスターユーザーかどうかを確認
    const admin = await Admin.findByPk(adminId)
    const isMaster = admin?.isMaster || false

    const whereCondition: any = isMaster ? {} : { admin_id: adminId }

    const forms = await Form.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
    })

    // 応募数（form_answers件数）をまとめて取得
    const formIds = forms.map(f => (f as any).id as number)
    const answersCountMap = new Map<number, number>()

    if (formIds.length > 0) {
      const { Op, fn, col } = await import('sequelize')
      const rows = await FormAnswer.findAll({
        where: {
          form_id: { [Op.in]: formIds },
        },
        attributes: ['form_id', [fn('COUNT', col('id')), 'count']],
        group: ['form_id'],
        raw: true,
      })

      for (const r of rows as any[]) {
        const id = Number((r as any).form_id)
        const count = parseInt((r as any).count as string, 10) || 0

        answersCountMap.set(id, count)
      }
    }

    return {
      success: true,
      data: forms.map(form => {
        const json = form.toJSON() as any
        const id = Number(json.id)
        json.answers_count = answersCountMap.get(id) || 0
        return json
      }),
    }
  } catch (error) {
    console.error(error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch forms',
    })
  }
})
