import { deleteCookie } from 'h3'

export default defineEventHandler(async event => {
  try {
    deleteCookie(event, 'adminId', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

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
