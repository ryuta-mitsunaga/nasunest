import { Admin, AdminPermission } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    requireAdminId(event)

    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'IDが指定されていません',
      })
    }

    const body = await readBody(event)
    const { permission_ids } = body as {
      permission_ids?: number[]
    }

    const admin = await Admin.findByPk(id)
    if (!admin) {
      throw createError({
        statusCode: 404,
        statusMessage: '管理者が見つかりません',
      })
    }

    // 権限の更新
    if (permission_ids !== undefined) {
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
      message: '管理者を更新しました',
      data: {
        ...adminWithPermissions?.toJSON(),
        password: undefined,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('管理者更新エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '管理者の更新に失敗しました',
    })
  }
})
