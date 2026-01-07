import { Form, Admin } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async (event) => {
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

    const form = await Form.findOne({
      where: whereCondition,
    })

    if (!form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'フォームが見つかりません',
      })
    }

    await form.destroy()

    return {
      success: true,
      message: 'フォームを削除しました',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'フォームの削除に失敗しました',
    })
  }
})

