import { Admin } from '~~/server/database'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async event => {
  try {
    const { id, password } = (await readBody(event)) as {
      id: string
      password: string
    }

    // デバッグようにハッシュ化されたパスワードを表示
    console.log('ハッシュ化されたパスワード:', bcrypt.hashSync(password, 10))

    if (!id || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'IDとパスワードを入力してください',
      })
    }

    const admin = await Admin.findOne({ where: { login_id: id } })

    if (!admin) {
      throw createError({
        statusCode: 401,
        statusMessage: 'IDまたはパスワードが正しくありません',
      })
    }

    const isValid = await bcrypt.compare(password, admin.dataValues.password)
    if (!isValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'IDまたはパスワードが正しくありません',
      })
    }

    // Cookieに管理者ID（数値）を保存
    setCookie(event, 'adminId', String(admin.dataValues.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7日間
      path: '/',
    })

    return {
      success: true,
      message: 'ログインに成功しました',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'ログインに失敗しました',
    })
  }
})
