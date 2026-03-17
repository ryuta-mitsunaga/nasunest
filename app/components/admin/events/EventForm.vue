<template>
  <UForm :state="formState" @submit="$emit('submit')" class="space-y-6 p-6">
    <UFormField label="タイトル" name="title" required>
      <UInput v-model="form.title" placeholder="イベントタイトル" />
    </UFormField>

    <UFormField label="フォーム" name="form_id">
      <div class="space-y-3">
        <USwitch v-model="useExternalForm" label="外部フォームを使う" />
        <template v-if="!useExternalForm">
          <div class="flex items-center gap-2 flex-wrap">
            <USelect
              v-model="form.form_id"
              v-model:open="isFormSelectOpen"
              :items="formOptions"
              placeholder="フォームを選択（任意）"
              class="flex-1 min-w-32"
            />
            <UButton
              :to="'/admin/forms/create?returnTo=event'"
              target="_blank"
              variant="soft"
              color="primary"
              size="sm"
              icon="i-heroicons-plus-circle"
            >
              フォーム作成
            </UButton>
          </div>
        </template>

        <div v-else class="space-y-1">
          <UInput
            v-model="form.form_link"
            placeholder="https://example.com/form（任意）"
            type="url"
          />
          <p class="text-xs text-gray-500">
            イベント詳細の「参加申し込み」ボタンが外部リンクを開きます。
          </p>
        </div>
      </div>
    </UFormField>

    <UFormField name="category_ids">
      <LabelWithHelp
        label="カテゴリ"
        help-text="カテゴリを選択すると、イベントに関連するカテゴリを設定できます。存在しないカテゴリはテキスト入力で追加できます。"
      ></LabelWithHelp>
      <AdminCategorySelector
        class="mt-1"
        :categories="categories"
        :selected-category-ids="form.category_ids"
        @update:selected-category-ids="form.category_ids = $event"
        @add-category="$emit('add-category', $event)"
      />
    </UFormField>

    <UFormField label="CTAボタンのテキスト" name="cta_button_text">
      <UInput
        v-model="form.cta_button_text"
        placeholder="参加申し込み（空欄の場合は「参加申し込み」が表示されます）"
      />
    </UFormField>

    <UFormField label="定員" name="capacity">
      <UInput
        v-model="form.capacity"
        type="number"
        placeholder="定員数（空欄の場合は無制限）"
        :min="1"
      />
    </UFormField>

    <UFormField label="イベント作成者も参加" name="creator_participates">
      <UCheckbox
        v-model="form.creator_participates"
        label="イベント作成者も参加者に含める（参加人数に+1されます）"
      />
    </UFormField>

    <UFormField label="イベント表示設定" name="is_displayed">
      <URadioGroup v-model="form.is_displayed" :items="displayOptions" />
    </UFormField>

    <UFormField label="イベント開始日時" name="start_date" required>
      <UInput v-model="form.start_date" type="datetime-local" />
    </UFormField>

    <UFormField label="イベント終了日時" name="end_date" required>
      <template #default>
        <div class="space-y-2">
          <div class="flex flex-wrap gap-2 sm:flex-nowrap">
            <UButton
              variant="soft"
              size="sm"
              class="flex-1 sm:flex-none"
              @click="addTimeToEndDate(30, 'minutes')"
              :disabled="!form.start_date"
            >
              +30分
            </UButton>
            <UButton
              variant="soft"
              size="sm"
              class="flex-1 sm:flex-none"
              @click="addTimeToEndDate(1, 'hours')"
              :disabled="!form.start_date"
            >
              +1時間
            </UButton>
            <UButton
              variant="soft"
              size="sm"
              class="flex-1 sm:flex-none"
              @click="addTimeToEndDate(1, 'days')"
              :disabled="!form.start_date"
            >
              +1日
            </UButton>
          </div>
          <UInput v-model="form.end_date" type="datetime-local" />
        </div>
      </template>
    </UFormField>

    <UFormField label="イベント公開開始日時" name="published_start">
      <UInput v-model="form.published_start" type="datetime-local" />
    </UFormField>

    <UFormField label="イベント公開終了日時" name="published_end">
      <UInput v-model="form.published_end" type="datetime-local" />
    </UFormField>

    <UFormField name="body">
      <AdminEditorJsEditor
        v-model="form.body"
        @uploading="$emit('uploading', $event)"
      />
    </UFormField>

    <UFormField label="場所名" name="location_name">
      <UInput v-model="form.location_name" placeholder="場所名（任意）" />
    </UFormField>

    <UFormField label="住所" name="location_address">
      <UInput v-model="form.location_address" placeholder="住所（任意）" />
    </UFormField>

    <UFormField label="場所URL" name="location_url">
      <UInput
        v-model="form.location_url"
        placeholder="https://example.com（任意）"
        type="url"
      />
    </UFormField>

    <UFormField label="サムネイル画像" name="thumbnail">
      <div class="space-y-2">
        <div v-if="thumbnailPreview" class="relative">
          <img
            :src="thumbnailPreview"
            alt="サムネイルプレビュー"
            class="w-full max-w-md h-48 object-cover rounded-lg border"
          />
          <UButton
            color="error"
            variant="soft"
            size="sm"
            class="absolute top-2 right-2"
            @click="$emit('clear-thumbnail')"
          >
            削除
          </UButton>
        </div>
        <UInput
          type="file"
          accept="image/*"
          @change="$emit('thumbnail-upload', $event)"
        />
      </div>
    </UFormField>

    <slot />
  </UForm>
</template>

<script setup lang="ts">
import LabelWithHelp from '~/components/ui/LabelWithHelp.vue'
import { useDayjs } from '~/composables/useDayjs'

const { dayjs } = useDayjs()

interface Form {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
}

interface EventFormData {
  title: string
  form_id: number | null
  form_link: string
  start_date: string
  end_date: string
  description: string
  body: any
  location_name: string
  location_address: string
  location_url: string
  thumbnail: string | null
  cta_button_text: string
  is_displayed: boolean
  published_start: string
  published_end: string
  capacity: number | null
  approval_type: number
  creator_participates: boolean
  category_ids: number[]
}

const props = defineProps<{
  form: EventFormData
  forms: Form[]
  categories: Category[]
  thumbnailPreview: string | null
}>()

const emit = defineEmits<{
  submit: []
  'add-category': [name: string]
  'clear-thumbnail': []
  'thumbnail-upload': [event: globalThis.Event]
  uploading: [isUploading: boolean]
  'get-form-options': []
}>()

const formState = computed(() => props.form)

const useExternalForm = ref(!!props.form.form_link?.trim())

const isFormSelectOpen = ref(false)

watch(isFormSelectOpen, val => {
  if (!val) return

  emit('get-form-options')
})

const displayOptions = [
  { label: '表示', value: true },
  { label: '非表示', value: false },
]

const approvalTypeOptions = [
  { label: '自動承認', value: 0 },
  { label: '手動承認', value: 1 },
  { label: '承認なし', value: 2 },
]

const formOptions = computed(() => {
  return [
    { label: 'フォームを選択しない', value: null },
    ...props.forms.map(f => ({ label: f.name, value: f.id })),
  ]
})

watch(useExternalForm, val => {
  if (val) {
    props.form.form_id = null
  } else {
    props.form.form_link = ''
  }
})

const addTimeToEndDate = (amount: number, unit: 'minutes' | 'hours' | 'days') => {
  if (!props.form.start_date) return
  
  // 基準日時を決定（終了日時が入力されている場合はそれを基準、なければ開始日時を基準）
  const baseDate = props.form.end_date && props.form.end_date.trim()
    ? dayjs.tz(props.form.end_date, 'Asia/Tokyo')
    : dayjs.tz(props.form.start_date, 'Asia/Tokyo')
  
  if (!baseDate.isValid()) return
  
  // 指定した時間を加算
  const endDate = baseDate.add(amount, unit)
  
  // datetime-local形式に変換
  props.form.end_date = endDate.format('YYYY-MM-DDTHH:mm')
}
</script>
