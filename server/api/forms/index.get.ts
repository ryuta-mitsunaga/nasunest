import { Form } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const forms = await Form.findAll({
      where: {
        admin_id: adminId,
      },
      order: [['createdAt', 'DESC']],
    })

    return {
      success: true,
      data: forms.map((form) => form.toJSON()),
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch forms',
    })
  }
})

