import { User } from '~~/server/database'
import { requireUserId } from '~~/server/lib/user-auth'

export default defineEventHandler(async event => {
  try {
    const userId = requireUserId(event)

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ['password'],
      },
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'ユーザーが見つかりません',
      })
    }

    return {
      success: true,
      data: user.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error(error)
    throw createError({
      statusCode: 500,
      message: 'ユーザー情報の取得に失敗しました',
    })
  }
})
