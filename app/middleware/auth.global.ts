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
        // リダイレクト先をクエリパラメータで渡す
        const redirectTo = `/admin/login?redirect=${encodeURIComponent(to.fullPath)}`
        return navigateTo(redirectTo)
      }
      // クッキーが存在する場合でも、有効性を確認
      try {
        const adminId = decryptId(encryptedAdminId)
        if (!adminId) {
          const redirectTo = `/admin/login?redirect=${encodeURIComponent(to.fullPath)}`
          return navigateTo(redirectTo)
        }
      } catch (error) {
        const redirectTo = `/admin/login?redirect=${encodeURIComponent(to.fullPath)}`
        return navigateTo(redirectTo)
      }
    }
    return
  }

  // クライアントサイドでの認証チェック
  try {
    const response = await $fetch('/api/admin/me')
    if (!response.success) {
      // リダイレクト先をクエリパラメータで渡す
      const redirectTo = `/admin/login?redirect=${encodeURIComponent(to.fullPath)}`
      return navigateTo(redirectTo)
    }
  } catch (error) {
    // リダイレクト先をクエリパラメータで渡す
    const redirectTo = `/admin/login?redirect=${encodeURIComponent(to.fullPath)}`
    return navigateTo(redirectTo)
  }
})

