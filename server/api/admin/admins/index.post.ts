import { Admin, AdminPermission } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // マスターユーザーまたはadmin_management権限があるかチェック
    const currentAdmin = await Admin.findByPk(adminId, {
      include: [
        {
          model: AdminPermission,
          as: 'permissions',
          attributes: ['code'],
          through: { attributes: [] },
        },
      ],
    })

    if (!currentAdmin) {
      throw createError({
        statusCode: 404,
        statusMessage: '管理者が見つかりません',
      })
    }

    const adminData = currentAdmin.toJSON() as any
    const hasAdminManagementPermission = adminData.permissions?.some(
      (p: any) => p.code === 'admin_management'
    )

    if (!adminData.isMaster && !hasAdminManagementPermission) {
      throw createError({
        statusCode: 403,
        statusMessage: '管理者管理の権限がありません',
      })
    }

    const body = await readBody(event)
    const { login_id, password, permission_ids } = body as {
      login_id: string
      password: string
      permission_ids: number[]
    }

    if (!login_id || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'IDとパスワードを入力してください',
      })
    }

    if (password.length < 8) {
      throw createError({
        statusCode: 400,
        statusMessage: 'パスワードは8文字以上で入力してください',
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
    })

    // 権限を設定
    if (permission_ids && permission_ids.length > 0) {
      const permissions = await AdminPermission.findAll({
        where: { id: permission_ids },
      })
      await (admin as any).setPermissions(permissions)
    }

    // 権限を含めて取得
    const adminWithPermissions = await Admin.findByPk(admin.id, {
      include: [
        {
          model: AdminPermission,
          as: 'permissions',
          attributes: ['id', 'code', 'name'],
          through: { attributes: [] },
        },
      ],
    })

    return {
      success: true,
      message: '管理者を作成しました',
      data: {
        ...adminWithPermissions?.toJSON(),
        password: undefined,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('管理者作成エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '管理者の作成に失敗しました',
    })
  }
})

