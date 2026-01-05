import { EventReport } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'
import crypto from 'crypto'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const id = getRouterParam(event, 'id')

    const eventReport = await EventReport.findOne({
      where: {
        id,
        admin_id: adminId,
      },
    })

    if (!eventReport) {
      throw createError({
        statusCode: 404,
        statusMessage: 'イベントレポートが見つかりません',
      })
    }

    // トークンを生成（32バイトのランダム文字列をBase64URLエンコード）
    const token = crypto.randomBytes(32).toString('base64url')

    // トークンを保存
    await eventReport.update({
      comment_token: token,
    })

    // コメントフォームURLを生成
    const baseUrl =
      process.env.NUXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://www.nasunest.com'
        : 'http://localhost:3000')
    const commentUrl = `${baseUrl}/eventReports/${id}/comment?token=${token}`

    return {
      success: true,
      data: {
        token,
        commentUrl,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'コメントトークンの生成に失敗しました ' + error.message,
    })
  }
})
