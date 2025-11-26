<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">イベント管理</h1>
      <UButton to="/admin/events/create">新規作成</UButton>
    </div>

    <UCard>
      <div v-if="loading" class="text-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
      </div>

      <UTable v-else :data="events" :columns="columns" class="w-full">
        <template #title-cell="{ row }">
          {{ row.original.title }}
        </template>
        <template #is_published-cell="{ row }">
          <UiStatusBadge :is-published="row.original.is_published" />
        </template>
        <template #published_start-cell="{ row }">
          {{ formatDate(row.original.published_start) }}
        </template>
        <template #published_end-cell="{ row }">
          {{ formatDate(row.original.published_end) }}
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton
              color="primary"
              variant="soft"
              size="sm"
              :to="`/admin/events/${row.original.id}/edit`"
            >
              編集
            </UButton>
            <UButton
              color="secondary"
              variant="soft"
              size="sm"
              @click="handleCopy(row.original.id)"
            >
              コピー
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
  middleware: 'auth',
  layout: 'admin',
})

interface Event {
  id: number
  title: string
  form_id: number | null
  start_date: string
  end_date: string | null
  description: string
  location_name: string | null
  location_address: string | null
  location_url: string | null
  is_published: boolean
  published_start: string | null
  published_end: string | null
  createdAt: string
}

const events = ref<Event[]>([])
const loading = ref(true)

const columns: TableColumn<Event>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'title', header: 'タイトル' },
  {
    accessorKey: 'is_published',
    header: 'ステータス',
  },
  { accessorKey: 'start_date', header: 'イベント開始日' },
  { accessorKey: 'end_date', header: 'イベント終了日' },
  { accessorKey: 'published_start', header: '公開開始日' },
  { accessorKey: 'published_end', header: '公開終了日' },
  { accessorKey: 'location_name', header: '場所' },
  { accessorKey: 'actions', header: '操作' },
]

const fetchEvents = async () => {
  loading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: Event[] }>(
      '/api/events',
      {
        credentials: 'include',
      }
    )
    events.value = response.data || []
  } catch (error) {
    console.error('イベント取得エラー:', error)
  } finally {
    loading.value = false
  }
}

const handleCopy = async (id: number) => {
  try {
    await $fetch(`/api/events/${id}/copy`, {
      method: 'POST',
      credentials: 'include',
    })
    await fetchEvents()
    alert('イベントをコピーしました')
  } catch (error) {
    console.error('コピーエラー:', error)
    alert('コピーに失敗しました')
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('本当に削除しますか？')) return

  try {
    await $fetch(`/api/events/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await fetchEvents()
  } catch (error) {
    console.error('削除エラー:', error)
    alert('削除に失敗しました')
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

onMounted(() => {
  fetchEvents()
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
