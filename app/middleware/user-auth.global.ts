import { decryptId } from '~~/server/lib/crypto-utils'
import { getCookie } from 'h3'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { fetchUser, isAuthenticated } = useAuth()
  const event = useRequestEvent()

  if (!event) return

  await useAuth().fetchUser()

  const requiredAuthPaths = ['/mypage']
  if (!requiredAuthPaths.includes(to.path)) return

  // サーバーサイドでの認証チェック
  if (process.server) {
    const event = useRequestEvent()
    if (event) {
      const encryptedUserId = getCookie(event, 'loginId')

      try {
        const userId = encryptedUserId ? decryptId(encryptedUserId) : null
        if (!encryptedUserId || !userId) {
          const redirectTo = `/login?redirect=${encodeURIComponent(to.fullPath)}`
          const { sendRedirect } = await import('h3')
          return sendRedirect(event, redirectTo)
        }
      } catch {
        const redirectTo = `/login?redirect=${encodeURIComponent(to.fullPath)}`
        const { sendRedirect } = await import('h3')
        return sendRedirect(event, redirectTo)
      }
    }
  }

  // クライアントサイドでの認証チェック
  if (!isAuthenticated.value) {
    const redirectTo = `/login?redirect=${encodeURIComponent(to.fullPath)}`
    return navigateTo(redirectTo)
  }

  return
})
