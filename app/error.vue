<template>
  <div :class="containerClass">
    <div :class="contentClass">
      <div class="text-center">
        <!-- エラーアイコン -->
        <div class="mb-6">
          <UIcon name="i-heroicons-exclamation-triangle" :class="iconClass" />
        </div>

        <!-- エラータイトル -->
        <h1 :class="titleClass">
          {{ errorTitle }}
        </h1>

        <!-- エラーメッセージ -->
        <p :class="messageClass">
          {{ errorMessage }}
        </p>

        <!-- ステータスコード（開発環境のみ） -->
        <p v-if="isDev && statusCode" class="text-sm text-gray-500 mt-2">
          エラーコード: {{ statusCode }}
        </p>

        <!-- アクションボタン -->
        <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <UButton
            v-if="isAdminPage"
            color="primary"
            size="lg"
            @click="handleGoHome"
          >
            管理画面トップに戻る
          </UButton>
          <UButton v-else color="primary" size="lg" @click="handleGoHome">
            トップページに戻る
          </UButton>

          <UButton color="gray" variant="soft" size="lg" @click="handleRetry">
            再読み込み
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}>()

const route = useRoute()
const isDev = process.env.NODE_ENV === 'development'

// 管理画面かどうかを判定
const isAdminPage = computed(() => {
  return route.path.startsWith('/admin')
})

// エラータイトル
const errorTitle = computed(() => {
  const statusCode = props.error?.statusCode || 500

  switch (statusCode) {
    case 404:
      return 'ページが見つかりません'
    case 403:
      return 'アクセスが拒否されました'
    case 500:
      return 'サーバーエラーが発生しました'
    case 503:
      return 'サービスが一時的に利用できません'
    default:
      return 'エラーが発生しました'
  }
})

// エラーメッセージ
const errorMessage = computed(() => {
  if (props.error?.message) {
    return props.error.message
  }

  const statusCode = props.error?.statusCode || 500

  switch (statusCode) {
    case 404:
      return 'お探しのページは存在しないか、移動された可能性があります。'
    case 403:
      return 'このページにアクセスする権限がありません。'
    case 500:
      return 'サーバーでエラーが発生しました。しばらく時間をおいてから再度お試しください。'
    case 503:
      return 'サービスが一時的に利用できません。しばらく時間をおいてから再度お試しください。'
    default:
      return '予期しないエラーが発生しました。'
  }
})

// ステータスコード
const statusCode = computed(() => props.error?.statusCode)

// スタイルクラス（管理画面用）
const containerClass = computed(() => {
  if (isAdminPage.value) {
    return 'min-h-screen flex items-center justify-center bg-gray-50 p-6'
  }
  return 'min-h-screen flex items-center justify-center bg-white p-6'
})

const contentClass = computed(() => {
  if (isAdminPage.value) {
    return 'max-w-2xl w-full rounded-2xl border border-neutral-200/90 bg-white p-8 shadow-sm md:p-12'
  }
  return 'max-w-2xl w-full rounded-2xl border border-neutral-200/90 bg-white p-8 shadow-sm md:p-12'
})

const iconClass = computed(() => {
  if (isAdminPage.value) {
    return 'w-24 h-24 text-red-500 mx-auto'
  }
  return 'w-24 h-24 text-red-500 mx-auto'
})

const titleClass = computed(() => {
  if (isAdminPage.value) {
    return 'text-4xl font-bold text-gray-900 mb-4'
  }
  return 'mb-4 text-4xl font-bold text-neutral-900'
})

const messageClass = computed(() => {
  if (isAdminPage.value) {
    return 'text-lg text-gray-600 mb-4'
  }
  return 'text-lg text-gray-600 mb-4'
})

// ホームに戻る
const handleGoHome = () => {
  if (isAdminPage.value) {
    navigateTo('/admin')
  } else {
    navigateTo('/')
  }
}

// 再読み込み
const handleRetry = () => {
  window.location.reload()
}
</script>

