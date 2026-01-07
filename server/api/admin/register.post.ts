import { Admin, AdminInvitation, AdminPermission } from '~~/server/database'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { token, login_id, password } = body as {
      token: string
      login_id: string
      password: string
    }

    if (!token || !login_id || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'トークン、ID、パスワードを入力してください',
      })
    }

    // トークンを検証
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

    // 既存の管理者IDが存在するかチェック
    const existingAdmin = await Admin.findOne({
      where: { login_id },
    })

    if (existingAdmin) {
      throw createError({
        statusCode: 400,
        statusMessage: 'このIDは既に使用されています',
      })
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // 管理者を作成
    const admin = await Admin.create({
      login_id,
      password: hashedPassword,
      isMaster: false,
    })

    // 初期権限を付与（form_management, event_management, invitation_management）
    const initialPermissions = await AdminPermission.findAll({
      where: {
        code: ['form_management', 'event_management', 'invitation_management'],
      },
    })

    if (initialPermissions.length > 0) {
      await (admin as any).setPermissions(initialPermissions)
    }

    // 使用済みの招待トークンを削除
    await AdminInvitation.destroy({
      where: { id: invitation.id },
    })

    return {
      success: true,
      message: '管理者登録が完了しました',
      data: {
        admin: {
          id: admin.id,
          login_id: admin.login_id,
        },
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('管理者登録エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '管理者登録に失敗しました',
    })
  }
})
