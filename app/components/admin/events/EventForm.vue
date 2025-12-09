<template>
  <UForm :state="formState" @submit="$emit('submit')" class="space-y-6 p-6">
    <UFormField label="タイトル" name="title" required>
      <UInput v-model="form.title" placeholder="イベントタイトル" />
    </UFormField>

    <UFormField label="フォーム" name="form_id">
      <USelect
        v-model="form.form_id"
        :items="formOptions"
        placeholder="フォームを選択（任意）"
      />
    </UFormField>

    <UFormField label="カテゴリ" name="category_ids">
      <AdminCategorySelector
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
      <template #help>
        定員数を入力してください。空欄の場合は無制限となります。
      </template>
    </UFormField>

    <UFormField label="参加承認の方式" name="approval_type">
      <URadioGroup
        :model-value="form.approval_type ?? 0"
        :items="approvalTypeOptions"
        @update:model-value="form.approval_type = $event"
      />
    </UFormField>

    <UFormField label="イベント表示設定" name="is_displayed">
      <URadioGroup v-model="form.is_displayed" :items="displayOptions" />
    </UFormField>

    <UFormField label="イベント開始日" name="start_date" required>
      <UInput v-model="form.start_date" type="date" />
    </UFormField>

    <UFormField label="イベント終了日" name="end_date">
      <UInput v-model="form.end_date" type="date" />
    </UFormField>

    <UFormField label="イベント公開開始日" name="published_start">
      <UInput v-model="form.published_start" type="date" />
    </UFormField>

    <UFormField label="イベント公開終了日" name="published_end">
      <UInput v-model="form.published_end" type="date" />
    </UFormField>

    <UFormField label="説明" name="description" required>
      <UTextarea
        v-model="form.description"
        placeholder="イベントの説明"
        :rows="5"
      />
    </UFormField>

    <UFormField label="本文" name="body">
      <AdminEditorJsEditor v-model="form.body" />
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
  approval_type: number | null
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
}>()

const formState = computed(() => props.form)

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
</script>
