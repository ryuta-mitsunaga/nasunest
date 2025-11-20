import { Form } from '~~/server/database'

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

    const adminId = parseInt(adminIdStr, 10)
    if (isNaN(adminId)) {
      throw createError({
        statusCode: 401,
        statusMessage: '認証情報が無効です',
      })
    }

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

