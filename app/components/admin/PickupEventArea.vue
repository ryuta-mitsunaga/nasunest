<template>
  <UCard class="mb-6">
    <template #header>
      <h2 class="text-xl font-semibold">設定中のピックアップイベント</h2>
    </template>
    <div v-if="props.loading" class="text-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
    </div>
    <div
      v-else-if="props.pickupEvents.length === 0"
      class="text-center py-8 text-gray-500"
    >
      <p class="mb-4">ピックアップイベントが設定されていません</p>
      <UButton variant="soft" @click="openPickupModal">
        ピックアップ設定
      </UButton>
    </div>
    <UTable
      v-else
      :data="props.pickupEvents"
      :columns="pickupColumns"
      class="w-full"
    >
      <template #event-title-cell="{ row }">
        {{ row.original.event?.title || '-' }}
      </template>
      <template #left_text-cell="{ row }">
        <div class="whitespace-pre-line">{{ row.original.left_text }}</div>
      </template>
      <template #pickup_datetime_start-cell="{ row }">
        {{ formatDateTime(row.original.pickup_datetime_start) }}
      </template>
      <template #pickup_datetime_end-cell="{ row }">
        {{ formatDateTime(row.original.pickup_datetime_end) }}
      </template>
      <template #status-cell="{ row }">
        <span
          :class="[
            'px-2 py-1 rounded text-xs font-medium',
            isActivePickupEvent(row.original)
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800',
          ]"
        >
          {{ isActivePickupEvent(row.original) ? '表示中' : '非表示' }}
        </span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex gap-2">
          <UButton
            color="primary"
            variant="soft"
            size="sm"
            @click="handleEditPickup(row.original)"
          >
            編集
          </UButton>
          <UButton
            color="error"
            variant="soft"
            size="sm"
            @click="handleDeletePickup(row.original.id)"
          >
            削除
          </UButton>
        </div>
      </template>
    </UTable>

    <!-- ピックアップ設定モーダル -->
    <AdminPickupEventModal
      :open="isPickupModalOpen"
      :events="events"
      :editing-id="editingPickupId"
      :initial-data="editingPickupData"
      @update:open="isPickupModalOpen = $event"
      @submit="handlePickupSubmit"
      @cancel="handlePickupCancel"
    />
  </UCard>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface Event {
  id: number
  title: string
  start_date: string
  end_date: string | null
  location_name: string | null
}

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

interface Props {
  events: Event[]
  pickupEvents: PickupEvent[]
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

const pickupColumns: TableColumn<PickupEvent>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'event.title', header: 'イベント' },
  { accessorKey: 'left_text', header: '左側テキスト' },
  { accessorKey: 'pickup_datetime_start', header: '開始日時' },
  { accessorKey: 'pickup_datetime_end', header: '終了日時' },
  { accessorKey: 'status', header: 'ステータス' },
  { accessorKey: 'actions', header: '操作' },
]

const isActivePickupEvent = (pickupEvent: PickupEvent) => {
  const now = new Date()
  const start = new Date(pickupEvent.pickup_datetime_start)
  const end = new Date(pickupEvent.pickup_datetime_end)
  return now >= start && now <= end
}

const formatDateTime = (dateTimeString: string) => {
  if (!dateTimeString) return '-'
  const date = new Date(dateTimeString)
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const isPickupModalOpen = ref(false)
const editingPickupId = ref<number | null>(null)

const openPickupModal = () => {
  editingPickupId.value = null
  isPickupModalOpen.value = true
}

const handleEditPickup = (pickupEvent: PickupEvent) => {
  editingPickupId.value = pickupEvent.id
  isPickupModalOpen.value = true
}

const editingPickupData = computed(() => {
  if (!editingPickupId.value) return null
  const pickupEvent = props.pickupEvents.find(pe => pe.id === editingPickupId.value)
  if (!pickupEvent) return null
  return {
    event_id: pickupEvent.event_id,
    left_text: pickupEvent.left_text,
    pickup_datetime_start: formatDateTimeForInput(pickupEvent.pickup_datetime_start),
    pickup_datetime_end: formatDateTimeForInput(pickupEvent.pickup_datetime_end),
  }
})

const formatDateTimeForInput = (dateTimeString: string) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const { success: toastSuccess, error: toastError } = useCustomToast()
const { confirm } = useConfirm()

const handlePickupSubmit = async (data: {
  event_id: number
  left_text: string
  pickup_datetime_start: string
  pickup_datetime_end: string
}) => {
  try {
    if (editingPickupId.value) {
      await $fetch(`/api/pickup-events/${editingPickupId.value}`, {
        method: 'PUT',
        credentials: 'include',
        body: data,
      })
      toastSuccess('ピックアップイベントを更新しました')
    } else {
      await $fetch('/api/pickup-events', {
        method: 'POST',
        credentials: 'include',
        body: data,
      })
      toastSuccess('ピックアップイベントを設定しました')
    }
    isPickupModalOpen.value = false
    editingPickupId.value = null
    emit('refresh')
  } catch (error) {
    console.error('ピックアップ設定エラー:', error)
    toastError(editingPickupId.value ? 'ピックアップイベントの更新に失敗しました' : 'ピックアップ設定に失敗しました')
  }
}

const handlePickupCancel = () => {
  isPickupModalOpen.value = false
  editingPickupId.value = null
}

const handleDeletePickup = async (id: number) => {
  const confirmed = await confirm({
    message: '本当に削除しますか？',
    type: 'danger',
    confirmText: '削除',
    cancelText: 'キャンセル',
  })
  if (!confirmed) return

  try {
    await $fetch(`/api/pickup-events/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    toastSuccess('ピックアップイベントを削除しました')
    emit('refresh')
  } catch (error) {
    console.error('ピックアップイベント削除エラー:', error)
    toastError('削除に失敗しました')
  }
}

</script>

