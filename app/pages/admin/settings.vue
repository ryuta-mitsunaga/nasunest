<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">設定</h1>
      <p class="text-gray-600 mt-2">管理画面の設定を行います。</p>
    </div>

    <UCard class="mb-6">
      <template #header>
        <h2 class="text-xl font-semibold">LINE連携</h2>
      </template>

      <div class="p-6">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p class="font-medium text-gray-900">通知先（LINEユーザー）</p>
            <p class="text-sm text-gray-600">
              フォーム申込みがあった際に、このLINEユーザーへ通知します。
            </p>
            <p class="text-xs text-gray-500 mt-2">
              現在の連携: {{ lineUserId || '未連携' }}
            </p>
          </div>

          <div class="flex gap-2">
            <UButton
              color="primary"
              variant="soft"
              :loading="linking"
              @click="handleLinkLine"
            >
              <UIcon name="i-heroicons-link" class="w-4 h-4 mr-2" />
              LINE連携
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              :loading="linking"
              :disabled="!lineUserId"
              @click="handleUnlinkLine"
            >
              解除
            </UButton>
          </div>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">アカウント</h2>
      </template>

      <div class="p-6">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="font-medium text-gray-900">ログアウト</p>
            <p class="text-sm text-gray-600">
              管理者アカウントからログアウトします。
            </p>
          </div>
          <UButton color="error" :loading="loading" @click="handleLogout">
            <UIcon
              name="i-heroicons-arrow-right-on-rectangle"
              class="w-4 h-4 mr-2"
            />
            ログアウト
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const loading = ref(false)
const linking = ref(false)
const lineUserId = ref<string | null>(null)
const { success: toastSuccess } = useCustomToast()

const loadAdminMe = async () => {
  try {
    const res = await $fetch<{
      success: boolean
      data: { line_user_id: string | null }
    }>('/api/admin/me', { credentials: 'include' })
    lineUserId.value = res.data?.line_user_id || null
  } catch (e) {
    console.error('管理者情報取得エラー:', e)
  }
}

type Liff = {
  init: (p: { liffId: string }) => Promise<void>
  isLoggedIn: () => boolean
  login: (p?: { redirectUri?: string }) => void
  getProfile: () => Promise<{ userId: string }>
}

const loadLiffSdk = async () => {
  if ((window as any).liff) return (window as any).liff as Liff
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('LIFF SDK load failed'))
    document.head.appendChild(script)
  })
  return (window as any).liff as Liff
}

/**
 * LINE連携
 */
const handleLinkLine = async () => {
  const liffId = useRuntimeConfig().public.liffId as string | undefined
  if (!liffId) {
    alert('NUXT_PUBLIC_LIFF_ID が未設定です')
    return
  }

  linking.value = true
  try {
    const liff = await loadLiffSdk()
    await liff.init({ liffId })

    if (!liff.isLoggedIn()) {
      liff.login({ redirectUri: `${window.location.origin}/admin/settings` })
      return
    }

    const profile = await liff.getProfile()
    await $fetch('/api/admin/line-user', {
      method: 'PUT',
      credentials: 'include',
      body: { line_user_id: profile.userId },
    })
    await loadAdminMe()
    toastSuccess('LINE連携が完了しました')
  } catch (e) {
    console.error('LINE連携エラー:', e)
    alert('LINE連携に失敗しました')
  } finally {
    linking.value = false
  }
}

const handleUnlinkLine = async () => {
  const ok = confirm('LINE連携を解除しますか？')
  if (!ok) return
  linking.value = true
  try {
    await $fetch('/api/admin/line-user', {
      method: 'PUT',
      credentials: 'include',
      body: { line_user_id: null },
    })
    await loadAdminMe()
  } finally {
    linking.value = false
  }
}

const handleLogout = async () => {
  loading.value = true
  try {
    await $fetch('/api/admin/logout', { method: 'POST' })
    await navigateTo('/admin/login')
  } catch (error) {
    console.error('ログアウトエラー:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadAdminMe()

  // リダイレクト後、LIFFログイン済みなら自動で連携処理
  const liffId = useRuntimeConfig().public.liffId as string | undefined
  if (!liffId || lineUserId.value) return // 既に連携済みならスキップ

  try {
    const liff = await loadLiffSdk()
    await liff.init({ liffId })

    if (liff.isLoggedIn()) {
      // リダイレクト後、ログイン済みなら自動で連携
      linking.value = true
      const profile = await liff.getProfile()
      await $fetch('/api/admin/line-user', {
        method: 'PUT',
        credentials: 'include',
        body: { line_user_id: profile.userId },
      })
      await loadAdminMe()
      toastSuccess('LINE連携が完了しました')
    }
  } catch (e) {
    // エラーは無視（手動連携ボタンで再試行可能）
    console.error('LINE自動連携エラー:', e)
  } finally {
    linking.value = false
  }
})
</script>
