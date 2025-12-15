import { getCookie } from 'h3'
import { decryptId } from '~~/server/lib/crypto-utils'

/**
 * 管理者認証をチェックし、管理者IDを返す
 * 認証に失敗した場合はエラーをthrowする
 */
export const requireAdminId = (event: any): number => {
  const encryptedAdminId = getCookie(event, 'adminId')
  
  if (!encryptedAdminId) {
    throw createError({
      statusCode: 401,
      message: '認証が必要です',
    })
  }

  const adminId = decryptId(encryptedAdminId)
  
  if (!adminId) {
    throw createError({
      statusCode: 401,
      message: '認証情報が無効です',
    })
  }

  return adminId
}

