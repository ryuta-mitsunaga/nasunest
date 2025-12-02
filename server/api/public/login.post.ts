import { User } from '~~/server/database'
import bcrypt from 'bcryptjs'
import { setCookie } from 'h3'
import { encryptId } from '~~/server/lib/crypto-utils'

export default defineEventHandler(async event => {
  try {
    const { email, password } = (await readBody(event)) as {
      email: string
      password: string
    }

    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'メールアドレスとパスワードを入力してください',
      })
    }

    const user = await User.findOne({ where: { email } })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'メールアドレスまたはパスワードが正しくありません',
      })
    }

    const isValid = await bcrypt.compare(password, user.dataValues.password)
    if (!isValid) {
      throw createError({
        statusCode: 401,
        message: 'メールアドレスまたはパスワードが正しくありません',
      })
    }

    // Cookieに暗号化されたログインIDを保存（7日間の期限）
    const encryptedUserId = encryptId(user.dataValues.id)
    setCookie(event, 'loginId', encryptedUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7日間
      path: '/',
    })

    return {
      success: true,
      message: 'ログインに成功しました',
      data: {
        id: user.dataValues.id,
        email: user.dataValues.email,
        name: user.dataValues.name,
        name_sei: user.dataValues.name_sei,
        name_mei: user.dataValues.name_mei,
        display_name: user.dataValues.display_name,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error(error)
    throw createError({
      statusCode: 500,
      message: 'ログインに失敗しました',
    })
  }
})

