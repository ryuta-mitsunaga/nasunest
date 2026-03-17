<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-xl font-bold">設定</h1>
      <p class="text-gray-600 mt-2">管理画面の設定を行います。</p>
    </div>

    <UCard class="mb-6">
      <template #header>
        <h2 class="text-xl font-semibold">LINE連携</h2>
      </template>

      <div class="p-6">
        <div class="mb-6">
          <p class="font-medium text-gray-900 mb-2">LINE連携について</p>
          <p class="text-sm text-gray-600 mb-4">
            フォーム申込みがあった際に、連携したLINEアカウントへ通知を送信します。
          </p>
          <div class="bg-gray-50 rounded-lg p-4 space-y-2">
            <p class="text-sm font-medium text-gray-900">連携手順</p>
            <ol
              class="text-sm text-gray-600 space-y-1 list-decimal list-inside"
            >
              <li>「LINE連携」ボタンをクリック</li>
              <li>LINEアプリでログイン（必要に応じて）</li>
              <li>公式アカウントを友達追加</li>
              <li>連携完了後、通知が届くようになります</li>
            </ol>
          </div>
        </div>

        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p class="font-medium text-gray-900">通知先（LINEユーザー）</p>
            <p class="text-sm text-gray-600 mt-1">
              現在の連携:
              <span class="text-xs">{{ lineUserId || '未連携' }}</span>
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

    <UCard class="mb-6">
      <template #header>
        <h2 class="text-xl font-semibold">プロフィール画像</h2>
      </template>

      <div class="p-6">
        <div class="flex items-start gap-6">
          <div class="shrink-0">
            <div
              class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200"
            >
              <img
                v-if="iconUrl"
                :src="iconUrl"
                alt="プロフィール画像"
                class="w-full h-full object-cover"
              />
              <UIcon
                v-else
                name="i-heroicons-user-circle"
                class="w-16 h-16 text-gray-400"
              />
            </div>
          </div>
          <div class="flex-1 space-y-4">
            <p class="text-sm text-gray-600">
              管理画面で表示するアイコン画像を設定できます。（最大2MB）
            </p>
            <div class="flex flex-wrap gap-2">
              <input
                ref="iconInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleIconUpload"
              />
              <UButton
                variant="soft"
                color="primary"
                :loading="uploadingIcon"
                @click="iconInputRef?.click()"
              >
                画像を選択
              </UButton>
              <UButton
                v-if="iconUrl"
                variant="soft"
                color="error"
                :disabled="uploadingIcon"
                @click="handleClearIcon"
              >
                削除
              </UButton>
            </div>
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

const iconInputRef = ref<HTMLInputElement | null>(null)
const iconUrl = ref<string | null>(null)
const uploadingIcon = ref(false)

const loadAdminMe = async () => {
  try {
    const res = await $fetch<{
      success: boolean
      data: { line_user_id: string | null; icon_url: string | null }
    }>('/api/admin/me', { credentials: 'include' })
    lineUserId.value = res.data?.line_user_id || null
    iconUrl.value = res.data?.icon_url || null
  } catch (e) {
    console.error('管理者情報取得エラー:', e)
  }
}

const handleIconUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingIcon.value = true
  try {
    const formData = new FormData()
    formData.append('icon', file)

    const res = await $fetch<{ success: boolean; data: { url: string } }>(
      '/api/admin/upload-icon',
      {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }
    )

    if (res.success && res.data.url) {
      await $fetch('/api/admin/icon', {
        method: 'PUT',
        credentials: 'include',
        body: { icon_url: res.data.url },
      })
      iconUrl.value = res.data.url
      toastSuccess('アイコンを更新しました')
    }
  } catch (e) {
    console.error('アイコンアップロードエラー:', e)
    alert('アイコンのアップロードに失敗しました')
  } finally {
    uploadingIcon.value = false
    target.value = ''
  }
}

const handleClearIcon = async () => {
  if (!confirm('アイコンを削除しますか？')) return
  try {
    await $fetch('/api/admin/icon', {
      method: 'PUT',
      credentials: 'include',
      body: { icon_url: null },
    })
    iconUrl.value = null
    toastSuccess('アイコンを削除しました')
  } catch (e) {
    console.error('アイコン削除エラー:', e)
    alert('アイコンの削除に失敗しました')
  }
}

type Liff = {
  init: (p: { liffId: string }) => Promise<void>
  isLoggedIn: () => boolean
  login: (p?: { redirectUri?: string }) => void
  getProfile: () => Promise<{ userId: string }>
  openWindow: (p: { url: string; external?: boolean }) => void
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
    // 公式アカウントの友達追加ページを開く
    liff.openWindow({ url: 'https://lin.ee/0myGCTz1', external: true })
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
      // 公式アカウントの友達追加ページを開く
      liff.openWindow({ url: 'https://lin.ee/0myGCTz1', external: true })
    }
  } catch (e) {
    // エラーは無視（手動連携ボタンで再試行可能）
    console.error('LINE自動連携エラー:', e)
  } finally {
    linking.value = false
  }
})
</script>
