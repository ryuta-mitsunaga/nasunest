import { getCookie } from 'h3'
import { decryptId } from '~~/server/lib/crypto-utils'

/**
 * ユーザー認証をチェックし、ユーザーIDを返す
 * 認証に失敗した場合はエラーをthrowする
 */
export const requireUserId = (event: any): number => {
  const encryptedUserId = getCookie(event, 'loginId')
  
  if (!encryptedUserId) {
    throw createError({
      statusCode: 401,
      message: '認証が必要です',
    })
  }

  const userId = decryptId(encryptedUserId)
  
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: '認証情報が無効です',
    })
  }

  return userId
}

