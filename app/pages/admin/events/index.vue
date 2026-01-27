<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-bold">イベント管理</h1>
      <UButton to="/admin/events/create">新規作成</UButton>
    </div>

    <!-- ピックアップイベントエリア（マスターユーザーのみ） -->
    <AdminPickupEventArea
      v-if="isMaster"
      :events="events"
      :pickup-events="pickupEvents"
      :loading="pickupLoading"
      @refresh="fetchPickupEvents"
    />
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">イベント一覧</h2>
          <UButton
            v-if="hasPendingAnswers"
            color="warning"
            variant="soft"
            @click="navigateToPendingAnswers"
          >
            未回答申し込みあり
          </UButton>
        </div>
      </template>
      <div v-if="loading" class="text-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
      </div>

      <UTable v-else :data="events" :columns="columns" class="w-full">
        <template #id-cell="{ row }">
          {{ events.indexOf(row.original) + 1 }}
        </template>
        <template #title-cell="{ row }">
          {{ row.original.title }}
        </template>
        <template #is_displayed-cell="{ row }">
          <UiStatusBadge :status="row.original.status" />
        </template>
        <template #start_date-cell="{ row }">
          {{ formatDateTime(row.original.start_date) }}
        </template>
        <template #end_date-cell="{ row }">
          {{ formatDateTime(row.original.end_date) }}
        </template>
        <template #published_start-cell="{ row }">
          {{ formatDateTime(row.original.published_start) }}
        </template>
        <template #published_end-cell="{ row }">
          {{ formatDateTime(row.original.published_end) }}
        </template>
        <template #form-cell="{ row }">
          <NuxtLink
            v-if="row.original.form"
            :to="`/admin/forms/${row.original.form.id}`"
            class="text-primary hover:underline"
          >
            {{ row.original.form.name }}
          </NuxtLink>
          <span v-else class="text-gray-400">-</span>
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
const { dayjs } = useDayjs()

definePageMeta({
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
  is_displayed: boolean
  published_start: string | null
  published_end: string | null
  createdAt: string
  status: 'published' | 'unpublished' | 'closed' | 'recruitment_closed'
  approval_type: number | null
  pending_answers_count?: number
  form?: {
    id: number
    name: string
  } | null
}

const events = ref<Event[]>([])
const loading = ref(true)

interface PickupEvent {
  id: number
  event_id: number
  left_text: string
  pickup_datetime_start: string
  pickup_datetime_end: string
  event: {
    id: number
    title: string
    start_date: string
    end_date: string | null
    location_name: string | null
  } | null
}

const pickupEvents = ref<PickupEvent[]>([])
const pickupLoading = ref(true)

const columns: TableColumn<Event>[] = [
  { accessorKey: 'id', header: 'No.' },
  { accessorKey: 'title', header: 'タイトル' },
  {
    accessorKey: 'is_displayed',
    header: 'ステータス',
  },
  { accessorKey: 'start_date', header: 'イベント開始日時' },
  { accessorKey: 'end_date', header: 'イベント終了日時' },
  { accessorKey: 'published_start', header: '公開開始日時' },
  { accessorKey: 'published_end', header: '公開終了日時' },
  { accessorKey: 'location_name', header: '場所' },
  { accessorKey: 'form', header: 'フォーム' },
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
    toastSuccess('イベントをコピーしました')
  } catch (error) {
    console.error('コピーエラー:', error)
    toastError('コピーに失敗しました')
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
    await $fetch(`/api/events/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await fetchEvents()
    toastSuccess('イベントを削除しました')
  } catch (error) {
    console.error('削除エラー:', error)
    toastError('削除に失敗しました')
  }
}

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return '-'
  // UTCとして解釈し、JSTに変換して表示
  const date = dayjs.utc(dateString).tz('Asia/Tokyo')
  if (!date.isValid()) return '-'
  return date.format('YYYY年M月D日 HH:mm')
}

const { success: toastSuccess, error: toastError } = useCustomToast()
const { confirm } = useConfirm()

// 管理者情報を取得してisMasterを確認
const { data: adminData } = await useFetch<{
  success: boolean
  data: { id: number; login_id: string; isMaster: boolean; permissions: any[] }
}>('/api/admin/me', {
  default: () => ({
    success: false,
    data: { id: 0, login_id: '', isMaster: false, permissions: [] },
  }),
})

const isMaster = computed(() => adminData.value?.data?.isMaster || false)

const hasPendingAnswers = computed(() => {
  return events.value.some(
    event =>
      event.approval_type === 1 && // 手動承認
      event.form_id &&
      (event.pending_answers_count || 0) > 0
  )
})

const navigateToPendingAnswers = () => {
  // 未回答申し込みがある最初のイベントのフォーム回答画面に遷移
  const eventWithPending = events.value.find(
    event =>
      event.approval_type === 1 && // 手動承認
      event.form_id &&
      (event.pending_answers_count || 0) > 0
  )
  if (eventWithPending?.form_id) {
    navigateTo(`/admin/forms/${eventWithPending.form_id}/answers`)
  }
}

const fetchPickupEvents = async () => {
  pickupLoading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: PickupEvent[] }>(
      '/api/pickup-events',
      {
        credentials: 'include',
      }
    )
    // 最新の1つだけを表示（createdAtでソートして最新を取得）
    const sorted = (response.data || []).sort((a, b) => {
      const dateA = new Date(a.pickup_datetime_start).getTime()
      const dateB = new Date(b.pickup_datetime_start).getTime()
      return dateB - dateA
    })
    pickupEvents.value = sorted.length > 0 && sorted[0] ? [sorted[0]] : []
  } catch (error) {
    console.error('ピックアップイベント取得エラー:', error)
  } finally {
    pickupLoading.value = false
  }
}

onMounted(() => {
  fetchEvents()
  if (isMaster.value) {
    fetchPickupEvents()
  }
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
