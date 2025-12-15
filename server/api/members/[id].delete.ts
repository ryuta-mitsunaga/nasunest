import { Member } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    requireAdminId(event)

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

