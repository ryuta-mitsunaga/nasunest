import { User } from '~~/server/database'
import bcrypt from 'bcryptjs'
import { setCookie } from 'h3'
import { encryptId } from '~~/server/lib/crypto-utils'

export default defineEventHandler(async event => {
  try {
    const body = (await readBody(event)) as {
      email: string
      password: string
      name_sei: string
      name_mei: string
      display_name: string
      age: number | null
      postal_code: string | null
      address: string
    }

    const {
      email,
      password,
      name_sei,
      name_mei,
      display_name,
      age,
      postal_code,
      address,
    } = body

    // バリデーション
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'メールアドレスとパスワードは必須です',
      })
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        message: '正しいメールアドレスを入力してください',
      })
    }

    // パスワードの長さチェック
    if (password.length < 8) {
      throw createError({
        statusCode: 400,
        message: 'パスワードは8文字以上で入力してください',
      })
    }

    // 既存ユーザーのチェック
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: 'このメールアドレスは既に登録されています',
      })
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // ユーザーを作成
    const user = await User.create({
      email,
      password: hashedPassword,
      name_sei: name_sei || null,
      name_mei: name_mei || null,
      display_name: display_name || null,
      age: age || null,
      postal_code: postal_code || null,
      address: address || null,
    })

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
      message: 'ユーザー登録が完了しました',
      data: {
        id: user.dataValues.id,
        email: user.dataValues.email,
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
      message: 'ユーザー登録に失敗しました',
    })
  }
})

