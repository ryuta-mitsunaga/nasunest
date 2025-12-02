export interface User {
  id: number
  email: string
  name_sei: string | null
  name_mei: string | null
  display_name: string | null
  age: number | null
  postal_code: string | null
  address: string | null
}

export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null)
  const loading = useState<boolean>('auth.loading', () => false)
  const requestFetch = useRequestFetch()

  // ユーザー情報を取得
  const fetchUser = async () => {
    loading.value = true
    try {
      const response = await requestFetch<{
        success: boolean
        data: User
      }>('/api/public/me')

      if (response.success && response.data) {
        user.value = response.data
        return response.data
      }
      user.value = null
      return null
    } catch (error) {
      user.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  // ログイン
  const login = async (email: string, password: string) => {
    loading.value = true
    try {
      const response = await $fetch<{
        success: boolean
        data: User
      }>('/api/public/login', {
        method: 'POST',
        body: { email, password },
      })

      if (response.success && response.data) {
        user.value = response.data
        return { success: true, user: response.data }
      }
      return { success: false, error: 'ログインに失敗しました' }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || error.message || 'ログインに失敗しました',
      }
    } finally {
      loading.value = false
    }
  }

  // ログアウト
  const logout = async () => {
    loading.value = true
    try {
      await $fetch('/api/public/logout', {
        method: 'POST',
      })
      user.value = null
      return { success: true }
    } catch (error: any) {
      // エラーが発生してもローカル状態はクリア
      user.value = null
      return {
        success: false,
        error:
          error.data?.message || error.message || 'ログアウトに失敗しました',
      }
    } finally {
      loading.value = false
    }
  }

  // ユーザー情報を更新
  const updateUser = async (updateData: {
    name_sei?: string
    name_mei?: string
    display_name?: string
    age?: number | null
    postal_code?: string | null
    address?: string | null
    password?: string
  }) => {
    loading.value = true
    try {
      const response = await $fetch<{
        success: boolean
        data: User
      }>('/api/public/users/me', {
        method: 'PUT',
        body: updateData,
      })

      if (response.success && response.data) {
        user.value = response.data
        return { success: true, user: response.data }
      }
      return { success: false, error: 'ユーザー情報の更新に失敗しました' }
    } catch (error: any) {
      return {
        success: false,
        error:
          error.data?.message ||
          error.message ||
          'ユーザー情報の更新に失敗しました',
      }
    } finally {
      loading.value = false
    }
  }

  // ログイン状態をチェック
  const isAuthenticated = computed(() => user.value !== null)

  return {
    user: readonly(user),
    loading: readonly(loading),
    isAuthenticated,
    fetchUser,
    login,
    logout,
    updateUser,
  }
}
