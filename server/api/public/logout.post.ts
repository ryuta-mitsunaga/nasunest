import { deleteCookie } from 'h3'

export default defineEventHandler(async event => {
  try {
    // Cookieを削除
    deleteCookie(event, 'loginId', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })

    return {
      success: true,
      message: 'ログアウトしました',
    }
  } catch (error: any) {
    console.error(error)
    throw createError({
      statusCode: 500,
      message: 'ログアウトに失敗しました',
    })
  }
})

