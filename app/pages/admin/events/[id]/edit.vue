<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <UButton variant="soft" to="/admin/events" class="mb-4">
        <UIcon name="i-heroicons-arrow-left" />
        一覧に戻る
      </UButton>
      <h1 class="text-3xl font-bold">イベント編集</h1>
    </div>

    <div v-if="loading" class="text-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
    </div>

    <UCard v-else>
      <UForm :state="formState" @submit="handleSubmit" class="space-y-6 p-6">
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

        <UFormField label="CTAボタンのテキスト" name="cta_button_text">
          <UInput
            v-model="form.cta_button_text"
            placeholder="参加申し込み（空欄の場合は「参加申し込み」が表示されます）"
          />
        </UFormField>

        <UFormField label="公開設定" name="is_published">
          <URadioGroup v-model="form.is_published" :items="publishOptions" />
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
                @click="clearThumbnail"
              >
                削除
              </UButton>
            </div>
            <UInput
              type="file"
              accept="image/*"
              @change="handleThumbnailUpload"
            />
          </div>
        </UFormField>

        <div class="flex gap-2 justify-end pt-4">
          <UButton variant="soft" to="/admin/events">キャンセル</UButton>
          <UButton type="submit" :loading="submitting">更新</UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

const { success: toastSuccess, error: toastError } = useCustomToast()

interface Event {
  id: number
  title: string
  form_id: number | null
  start_date: string
  end_date: string | null
  description: string
  body: string | null
  location_name: string | null
  location_address: string | null
  location_url: string | null
  thumbnail: string | null
  cta_button_text: string | null
  is_published: boolean
  published_start: string | null
  published_end: string | null
}

interface Form {
  id: number
  name: string
}

const route = useRoute()
const eventId = computed(() => {
  const id = route.params.id
  if (Array.isArray(id)) {
    return id[0] || ''
  }
  return id || ''
})

const loading = ref(true)
const submitting = ref(false)
const forms = ref<Form[]>([])
const thumbnailPreview = ref<string | null>(null)

const form = reactive({
  title: '',
  form_id: null as number | null,
  start_date: '',
  end_date: '',
  description: '',
  body: null as any,
  location_name: '',
  location_address: '',
  location_url: '',
  thumbnail: null as string | null,
  cta_button_text: '',
  is_published: true,
  published_start: '',
  published_end: '',
})

const publishOptions = [
  { label: '公開', value: true },
  { label: '非公開', value: false },
]

const formState = computed(() => form)
const formOptions = computed(() => {
  return [
    { label: 'フォームを選択しない', value: null },
    ...forms.value.map(f => ({ label: f.name, value: f.id })),
  ]
})

const fetchEvent = async () => {
  loading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: Event }>(
      `/api/events/${eventId.value}`,
      {
        credentials: 'include',
      }
    )
    const eventData = response.data
    form.title = eventData.title
    form.form_id = eventData.form_id
    form.start_date = eventData.start_date
    form.end_date = eventData.end_date || ''
    form.description = eventData.description
    form.body = eventData.body ? JSON.parse(eventData.body) : null
    form.location_name = eventData.location_name || ''
    form.location_address = eventData.location_address || ''
    form.location_url = eventData.location_url || ''
    form.thumbnail = eventData.thumbnail || null
    form.cta_button_text = eventData.cta_button_text || ''
    form.is_published = eventData.is_published ?? true
    form.published_start = eventData.published_start || ''
    form.published_end = eventData.published_end || ''
    thumbnailPreview.value = eventData.thumbnail || null
  } catch (error) {
    console.error('イベント取得エラー:', error)
    toastError('イベントの取得に失敗しました')
    await navigateTo('/admin/events')
  } finally {
    loading.value = false
  }
}

const fetchForms = async () => {
  try {
    const response = await $fetch<{ success: boolean; data: Form[] }>(
      '/api/forms',
      {
        credentials: 'include',
      }
    )
    forms.value = response.data || []
  } catch (error) {
    console.error('フォーム取得エラー:', error)
  }
}

const handleThumbnailUpload = (event: globalThis.Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      thumbnailPreview.value = result
      form.thumbnail = result
    }
    reader.readAsDataURL(file)
  }
}

const clearThumbnail = () => {
  thumbnailPreview.value = null
  form.thumbnail = null
}

const handleSubmit = async () => {
  if (!form.title.trim() || !form.start_date || !form.description.trim()) {
    toastError('タイトル、開始日、説明は必須項目です')
    return
  }

  submitting.value = true
  try {
    await $fetch(`/api/events/${eventId.value}`, {
      method: 'PUT',
      credentials: 'include',
      body: {
        title: form.title,
        form_id: form.form_id || null,
        start_date: form.start_date,
        end_date: form.end_date || null,
        description: form.description,
        body: form.body ? JSON.stringify(form.body) : null,
        location_name: form.location_name || null,
        location_address: form.location_address || null,
        location_url: form.location_url || null,
        thumbnail: form.thumbnail || null,
        cta_button_text: form.cta_button_text || null,
        is_published: form.is_published,
        published_start: form.published_start || null,
        published_end: form.published_end || null,
      },
    })

    await navigateTo('/admin/events')
    toastSuccess('保存しました')
  } catch (error) {
    console.error('保存エラー:', error)
    toastError('保存に失敗しました')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchEvent()
  fetchForms()
})
</script>
