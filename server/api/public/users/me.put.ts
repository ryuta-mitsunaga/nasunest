import { User } from '~~/server/database'
import bcrypt from 'bcryptjs'
import { requireUserId } from '~~/server/lib/user-auth'

export default defineEventHandler(async event => {
  try {
    const userId = requireUserId(event)

    const body = (await readBody(event)) as {
      name_sei?: string
      name_mei?: string
      display_name?: string
      age?: number | null
      postal_code?: string | null
      address?: string | null
      password?: string
    }

    const user = await User.findByPk(userId)

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'ユーザーが見つかりません',
      })
    }

    // パスワードが提供されている場合は更新
    if (body.password) {
      if (body.password.length < 8) {
        throw createError({
          statusCode: 400,
          message: 'パスワードは8文字以上で入力してください',
        })
      }
      const hashedPassword = await bcrypt.hash(body.password, 10)
      await user.update({
        ...body,
        password: hashedPassword,
      })
    } else {
      // パスワードが提供されていない場合は、パスワード以外を更新
      const { password, ...updateData } = body
      await user.update(updateData)
    }

    // 更新後のユーザー情報を取得（パスワードを除く）
    const updatedUser = await User.findByPk(userId, {
      attributes: {
        exclude: ['password'],
      },
    })

    return {
      success: true,
      message: 'ユーザー情報を更新しました',
      data: updatedUser?.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error(error)
    throw createError({
      statusCode: 500,
      message: 'ユーザー情報の更新に失敗しました',
    })
  }
})

