export default defineEventHandler(async (event) => {
  try {
    deleteCookie(event, 'adminId')

    return {
      success: true,
      message: 'ログアウトしました',
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'ログアウトに失敗しました',
    })
  }
})

