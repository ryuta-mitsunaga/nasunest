import { decryptId } from '~~/server/lib/crypto-utils'
import { getCookie } from 'h3'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // /adminが含まれている場合のみ認証チェック
  if (!to.path.startsWith('/admin')) {
    return
  }

  // ログインページは除外
  if (to.path === '/admin/login') {
    return
  }

  // サーバーサイドでの認証チェック
  if (process.server) {
    const event = useRequestEvent()
    if (event) {
      const encryptedAdminId = getCookie(event, 'adminId')
      if (!encryptedAdminId) {
        return navigateTo('/admin/login')
      }
      // クッキーが存在する場合でも、有効性を確認
      try {
        const adminId = decryptId(encryptedAdminId)
        if (!adminId) {
          return navigateTo('/admin/login')
        }
      } catch (error) {
        return navigateTo('/admin/login')
      }
    }
    return
  }

  // クライアントサイドでの認証チェック
  try {
    const response = await $fetch('/api/admin/me')
    if (!response.success) {
      return navigateTo('/admin/login')
    }
  } catch (error) {
    return navigateTo('/admin/login')
  }
})

