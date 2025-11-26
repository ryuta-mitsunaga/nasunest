import { getCookie } from 'h3'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // サーバーサイドでの認証チェック
  if (process.server) {
    const event = useRequestEvent()
    if (event) {
      const adminIdStr = getCookie(event, 'adminId')
      if (!adminIdStr) {
        return navigateTo('/admin/login')
      }
      // クッキーが存在する場合でも、有効性を確認
      try {
        const adminId = parseInt(adminIdStr, 10)
        if (isNaN(adminId)) {
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
