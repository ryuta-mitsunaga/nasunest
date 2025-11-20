import { Member } from '~~/server/database'

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    const adminId = getCookie(event, 'adminId')

    if (!adminId) {
      throw createError({
        statusCode: 401,
        statusMessage: '認証が必要です',
      })
    }

    const id = getRouterParam(event, 'id')
    const member = await Member.findByPk(id)

    if (!member) {
      throw createError({
        statusCode: 404,
        statusMessage: 'メンバーが見つかりません',
      })
    }

    await member.destroy()

    return {
      success: true,
      message: 'メンバーを削除しました',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'メンバーの削除に失敗しました',
    })
  }
})

