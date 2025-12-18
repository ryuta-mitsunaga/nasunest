import { Admin } from '~~/server/database'
import bcrypt from 'bcryptjs'
import { setCookie } from 'h3'
import { encryptId } from '~~/server/lib/crypto-utils'

export default defineEventHandler(async event => {
  try {
    const { id, password } = (await readBody(event)) as {
      id: string
      password: string
    }

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

    // Cookieに暗号化された管理者IDを保存
    const encryptedAdminId = encryptId(admin.dataValues.id)
    setCookie(event, 'adminId', encryptedAdminId, {
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
