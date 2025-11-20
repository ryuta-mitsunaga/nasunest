export default defineEventHandler(async (event) => {
  try {
    const adminId = getCookie(event, 'adminId')

    if (!adminId) {
      throw createError({
        statusCode: 401,
        statusMessage: '認証が必要です',
      })
    }

    return {
      success: true,
      data: { adminId },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '認証情報の取得に失敗しました',
    })
  }
})

