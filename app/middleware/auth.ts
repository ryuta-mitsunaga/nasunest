export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) {
    return
  }

  try {
    const response = await $fetch('/api/admin/me')
    if (!response.success) {
      return navigateTo('/admin/login')
    }
  } catch (error) {
    return navigateTo('/admin/login')
  }
})

