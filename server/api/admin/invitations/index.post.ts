import { AdminInvitation, Admin } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // 管理者が存在するか確認
    const admin = await Admin.findByPk(adminId)
    if (!admin) {
      throw createError({
        statusCode: 404,
        statusMessage: '管理者が見つかりません',
      })
    }

    // トークンを生成（32バイトのランダム文字列をBase64エンコード）
    const token = crypto.randomBytes(32).toString('base64url')

    // 有効期限を7日後に設定
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 7)

    // 招待レコードを作成
    const invitation = await AdminInvitation.create({
      admin_id: adminId,
      token,
      expiry_date: expiryDate,
    })

    // 招待URLを生成
    const baseUrl =
      process.env.NUXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://www.nasunest.com'
        : 'http://localhost:3000')
    const invitationUrl = `${baseUrl}/admin/register?token=${token}`

    return {
      success: true,
      data: {
        invitation: invitation.toJSON(),
        invitationUrl,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('招待トークン生成エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '招待トークンの生成に失敗しました',
    })
  }
})

