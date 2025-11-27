import { AdminInvitation } from '~~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const token = query.token as string

    if (!token) {
      throw createError({
        statusCode: 400,
        statusMessage: 'トークンが指定されていません',
      })
    }

    // トークンで招待を検索
    const invitation = await AdminInvitation.findOne({
      where: { token },
    })

    if (!invitation) {
      throw createError({
        statusCode: 400,
        statusMessage: '無効な招待トークンです',
      })
    }

    // 有効期限をチェック
    const now = new Date()
    if (new Date(invitation.expiry_date) < now) {
      throw createError({
        statusCode: 400,
        statusMessage: '招待トークンの有効期限が切れています',
      })
    }

    return {
      success: true,
      data: {
        valid: true,
        invitation: invitation.toJSON(),
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('トークン検証エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'トークンの検証に失敗しました',
    })
  }
})

