<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-bold">イベントレポート管理</h1>
      <UButton to="/admin/eventReports/create">新規作成</UButton>
    </div>

    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">イベントレポート一覧</h2>
      </template>
      <div v-if="loading" class="text-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
      </div>

      <UTable v-else :data="eventReports" :columns="columns" class="w-full">
        <template #id-cell="{ row }">
          {{ eventReports.indexOf(row.original) + 1 }}
        </template>
        <template #title-cell="{ row }">
          <NuxtLink
            :to="`/admin/eventReports/${row.original.id}`"
            class="text-primary hover:underline"
          >
            {{ row.original.title }}
          </NuxtLink>
        </template>
        <template #event-cell="{ row }">
          <span v-if="row.original.event">
            {{ row.original.event.title }}
          </span>
          <span v-else class="text-gray-400">-</span>
        </template>
        <template #createdAt-cell="{ row }">
          {{ formatDate(row.original.createdAt) }}
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton
              color="primary"
              variant="soft"
              size="sm"
              :to="`/admin/eventReports/${row.original.id}/edit`"
            >
              編集
            </UButton>
            <UButton
              color="secondary"
              variant="soft"
              size="sm"
              @click="handleGenerateCommentLink(row.original.id)"
            >
              コメントリンク発行
            </UButton>
            <UButton
              color="error"
              variant="soft"
              size="sm"
              @click="handleDelete(row.original.id)"
            >
              削除
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  layout: 'admin',
})

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

const eventReports = ref<EventReport[]>([])
const loading = ref(true)

const columns: TableColumn<EventReport>[] = [
  { accessorKey: 'id', header: 'No.' },
  { accessorKey: 'title', header: 'タイトル' },
  { accessorKey: 'event', header: '対象イベント' },
  { accessorKey: 'createdAt', header: '作成日' },
  { accessorKey: 'actions', header: '操作' },
]

const fetchEventReports = async () => {
  loading.value = true
  try {
    const response = await $fetch<{
      success: boolean
      data: EventReport[]
    }>('/api/admin/event-reports', {
      credentials: 'include',
    })
    eventReports.value = response.data || []
  } catch (error) {
    console.error('イベントレポート取得エラー:', error)
  } finally {
    loading.value = false
  }
}

const handleGenerateCommentLink = async (id: number) => {
  try {
    const response = await $fetch<{
      success: boolean
      data: { token: string; commentUrl: string }
    }>(`/api/admin/event-reports/${id}/comment-token`, {
      method: 'POST',
      credentials: 'include',
    })

    if (response.success && response.data.commentUrl) {
      // クリップボードにコピー
      await navigator.clipboard.writeText(response.data.commentUrl)
      toastSuccess('コメントフォームのリンクをコピーしました')
    }
  } catch (error) {
    console.error('コメントリンク発行エラー:', error)
    toastError('コメントリンクの発行に失敗しました')
  }
}

const handleDelete = async (id: number) => {
  const confirmed = await confirm({
    message: '本当に削除しますか？',
    type: 'danger',
    confirmText: '削除',
    cancelText: 'キャンセル',
  })
  if (!confirmed) return

  try {
    await $fetch(`/api/admin/event-reports/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await fetchEventReports()
    toastSuccess('イベントレポートを削除しました')
  } catch (error) {
    console.error('削除エラー:', error)
    toastError('削除に失敗しました')
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const { success: toastSuccess, error: toastError } = useCustomToast()
const { confirm } = useConfirm()

onMounted(() => {
  fetchEventReports()
})
</script>

<style scoped>
:deep(tr td:nth-child(2)) {
  max-width: 300px;
  min-width: 300px;
  word-break: break-word;
  overflow-wrap: anywhere;
  white-space: normal;
}
</style>
