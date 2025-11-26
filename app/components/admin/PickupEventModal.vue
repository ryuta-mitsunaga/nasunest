<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <h3 class="text-xl font-semibold">ピックアップ設定</h3>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- イベント選択 -->
        <UFormField label="イベント" name="event_id" required>
          <USelect
            v-model="formData.event_id"
            :items="eventOptions"
            placeholder="イベントを選択"
            @update:model-value="handleEventChange"
          />
        </UFormField>

        <!-- イベント情報（読み取り専用） -->
        <div v-if="selectedEvent" class="p-4 bg-gray-50 rounded-lg space-y-2">
          <div>
            <span class="text-sm font-medium text-gray-600">開催日:</span>
            <span class="ml-2">{{ formatDate(selectedEvent.start_date) }}</span>
          </div>
          <div v-if="selectedEvent.location_name">
            <span class="text-sm font-medium text-gray-600">場所:</span>
            <span class="ml-2">{{ selectedEvent.location_name }}</span>
          </div>
        </div>

        <!-- 左側テキスト入力 -->
        <UFormField label="CTAボタン左側テキスト" name="left_text" required>
          <UTextarea
            v-model="formData.left_text"
            placeholder="例: 令和7年度 活動報告会&#10;（改行も可能です）"
            :rows="3"
          />
        </UFormField>

        <!-- ピックアップ期間 -->
        <UFormField label="ピックアップ開始日時" name="pickup_datetime_start" required>
          <UInput
            v-model="formData.pickup_datetime_start"
            type="datetime-local"
          />
        </UFormField>

        <UFormField label="ピックアップ終了日時" name="pickup_datetime_end" required>
          <UInput
            v-model="formData.pickup_datetime_end"
            type="datetime-local"
          />
        </UFormField>

        <!-- プレビュー -->
        <div class="border-t pt-4">
          <h4 class="text-sm font-medium mb-3">プレビュー</h4>
          <AdminPickupEventPreview
            :event="selectedEvent"
            :left-text="formData.left_text"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <UButton variant="soft" @click="handleCancel">キャンセル</UButton>
        <UButton @click="handleSubmit" :loading="submitting">
          {{ editingId ? '更新' : '作成' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface Event {
  id: number
  title: string
  start_date: string
  end_date: string | null
  location_name: string | null
}

interface Props {
  open: boolean
  events: Event[]
  editingId?: number | null
  initialData?: {
    event_id: number
    left_text: string
    pickup_datetime_start: string
    pickup_datetime_end: string
  } | null
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  events: () => [],
  editingId: null,
  initialData: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: {
    event_id: number
    left_text: string
    pickup_datetime_start: string
    pickup_datetime_end: string
  }]
  cancel: []
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const formData = reactive({
  event_id: null as number | null,
  left_text: '',
  pickup_datetime_start: '',
  pickup_datetime_end: '',
})

const submitting = ref(false)
const selectedEvent = computed(() => {
  if (!formData.event_id) return null
  return props.events.find(e => e.id === formData.event_id) || null
})

const eventOptions = computed(() => {
  return props.events.map(e => ({
    label: e.title,
    value: e.id,
  }))
})

const handleEventChange = () => {
  // イベントが変更されたときの処理（必要に応じて）
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const { error: toastError } = useCustomToast()

const handleSubmit = () => {
  if (!formData.event_id || !formData.left_text || !formData.pickup_datetime_start || !formData.pickup_datetime_end) {
    toastError('すべての項目を入力してください')
    return
  }

  emit('submit', {
    event_id: formData.event_id,
    left_text: formData.left_text,
    pickup_datetime_start: formData.pickup_datetime_start,
    pickup_datetime_end: formData.pickup_datetime_end,
  })
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}

watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.event_id = newData.event_id
    formData.left_text = newData.left_text
    formData.pickup_datetime_start = newData.pickup_datetime_start
    formData.pickup_datetime_end = newData.pickup_datetime_end
  }
}, { immediate: true })

watch(() => props.open, (newValue) => {
  if (newValue && props.initialData) {
    // モーダルが開かれたとき、initialDataがある場合はフォームを初期化
    formData.event_id = props.initialData.event_id
    formData.left_text = props.initialData.left_text
    formData.pickup_datetime_start = props.initialData.pickup_datetime_start
    formData.pickup_datetime_end = props.initialData.pickup_datetime_end
  } else if (!newValue) {
    // モーダルが閉じられたときにフォームをリセット
    formData.event_id = null
    formData.left_text = ''
    formData.pickup_datetime_start = ''
    formData.pickup_datetime_end = ''
  }
})
</script>

