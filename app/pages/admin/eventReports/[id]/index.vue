<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <UButton variant="soft" to="/admin/eventReports" class="mb-4">
        <UIcon name="i-heroicons-arrow-left" />
        一覧に戻る
      </UButton>
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-bold">イベントレポート詳細</h1>
        <div class="flex gap-2">
          <UButton
            color="primary"
            variant="soft"
            :to="`/admin/eventReports/${id}/edit`"
          >
            編集
          </UButton>
          <UButton color="error" variant="soft" @click="handleDelete">
            削除
          </UButton>
        </div>
      </div>
    </div>

    <UCard v-if="loading" class="p-8">
      <div class="text-center">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
      </div>
    </UCard>

    <div v-else-if="eventReport" class="space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">基本情報</h2>
        </template>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-700">タイトル</label>
            <p class="mt-1 text-lg">{{ eventReport.title }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700"
              >対象イベント</label
            >
            <p class="mt-1">
              <span v-if="eventReport.event">
                {{ eventReport.event.title }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </p>
          </div>
          <div v-if="eventReport.thumbnail">
            <label class="text-sm font-medium text-gray-700">サムネイル</label>
            <div class="mt-2">
              <img
                :src="eventReport.thumbnail"
                alt="サムネイル"
                class="max-w-md h-auto rounded"
              />
            </div>
          </div>
        </div>
      </UCard>

      <UCard v-if="eventReport.body">
        <template #header>
          <h2 class="text-xl font-semibold">内容</h2>
        </template>
        <div class="p-4">
          <AdminEditorJsEditor :data="parsedBody" :read-only="true" />
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const id = computed(() => route.params.id as string)

const { success: toastSuccess, error: toastError } = useCustomToast()
const { confirm } = useConfirm()
const { showFetchErrorPage } = useAdminErrorPage()

interface EventReport {
  id: number
  event_id: number
  admin_id: number
  title: string
  thumbnail: string | null
  body: string | null
  createdAt: string
  event?: {
    id: number
    title: string
    start_date: string
  } | null
}

const eventReport = ref<EventReport | null>(null)
const loading = ref(true)

const parsedBody = computed(() => {
  if (!eventReport.value?.body) return null
  try {
    return typeof eventReport.value.body === 'string'
      ? JSON.parse(eventReport.value.body)
      : eventReport.value.body
  } catch {
    return null
  }
})

const fetchEventReport = async () => {
  loading.value = true
  try {
    const response = await $fetch<{
      success: boolean
      data: EventReport
    }>(`/api/admin/event-reports/${id.value}`, {
      credentials: 'include',
    })
    eventReport.value = response.data
  } catch (error) {
    console.error('イベントレポート取得エラー:', error)
    // 初期表示の取得失敗はエラー画面にする
    showFetchErrorPage(error, 'イベントレポートの取得に失敗しました')
    return
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  const confirmed = await confirm({
    message: '本当に削除しますか？',
    type: 'danger',
    confirmText: '削除',
    cancelText: 'キャンセル',
  })
  if (!confirmed) return

  try {
    await $fetch(`/api/admin/event-reports/${id.value}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await navigateTo('/admin/eventReports')
    toastSuccess('イベントレポートを削除しました')
  } catch (error) {
    console.error('削除エラー:', error)
    toastError('削除に失敗しました')
  }
}

onMounted(() => {
  fetchEventReport()
})
</script>
