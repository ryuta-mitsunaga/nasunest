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
      <AdminEventsEventForm
        :form="form"
        :forms="forms"
        :categories="categories"
        :thumbnail-preview="thumbnailPreview"
        @submit="handleSubmit"
        @add-category="handleAddCategory"
        @clear-thumbnail="clearThumbnail"
        @thumbnail-upload="handleThumbnailUpload"
      >
        <div class="flex gap-2 justify-end pt-4">
          <UButton variant="soft" to="/admin/events">キャンセル</UButton>
          <UButton type="submit" :loading="submitting">更新</UButton>
        </div>
      </AdminEventsEventForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { success: toastSuccess, error: toastError } = useCustomToast()

interface Event {
  id: number
  title: string
  form_id: number | null
  form_link?: string | null
  start_date: string
  end_date: string | null
  description: string
  body: string | null
  location_name: string | null
  location_address: string | null
  location_url: string | null
  thumbnail: string | null
  cta_button_text: string | null
  is_displayed: boolean
  published_start: string | null
  published_end: string | null
  capacity: number | null
  approval_type: number | null
  categories?: Array<{
    id: number
    name: string
    description: string | null
    color: string | null
  }>
}

interface Form {
  id: number
  name: string
}

interface Category {
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
const categories = ref<Category[]>([])
const thumbnailPreview = ref<string | null>(null)

const form = reactive({
  title: '',
  form_id: null as number | null,
  form_link: '',
  start_date: '',
  end_date: '',
  description: '',
  body: null as any,
  location_name: '',
  location_address: '',
  location_url: '',
  thumbnail: null as string | null,
  cta_button_text: '',
  is_displayed: true,
  published_start: '',
  published_end: '',
  capacity: null as number | null,
  approval_type: 0 as number | null,
  category_ids: [] as number[],
})

const handleAddCategory = async (name: string): Promise<Category> => {
  try {
    const response = await $fetch<{ success: boolean; data: Category }>(
      '/api/event-categories',
      {
        method: 'POST',
        credentials: 'include',
        body: {
          name: name.trim(),
        },
      }
    )
    // カテゴリリストを更新
    categories.value.push(response.data)
    // 追加したカテゴリを自動的に選択
    if (!form.category_ids.includes(response.data.id)) {
      form.category_ids.push(response.data.id)
    }
    toastSuccess('カテゴリを追加しました')
    return response.data
  } catch (error) {
    console.error('カテゴリ追加エラー:', error)
    toastError('カテゴリの追加に失敗しました')
    throw error
  }
}

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
    form.form_link = eventData.form_link || ''
    form.start_date = eventData.start_date
    form.end_date = eventData.end_date || ''
    form.description = eventData.description
    form.body = eventData.body ? JSON.parse(eventData.body) : null
    form.location_name = eventData.location_name || ''
    form.location_address = eventData.location_address || ''
    form.location_url = eventData.location_url || ''
    form.thumbnail = eventData.thumbnail || null
    form.cta_button_text = eventData.cta_button_text || ''
    form.is_displayed = eventData.is_displayed ?? true
    form.published_start = eventData.published_start || ''
    form.published_end = eventData.published_end || ''
    form.capacity = eventData.capacity || null
    form.approval_type = eventData.approval_type ?? 0
    form.category_ids = eventData.categories?.map(c => c.id) || []
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

const fetchCategories = async () => {
  try {
    const response = await $fetch<{ success: boolean; data: Category[] }>(
      '/api/event-categories',
      {
        credentials: 'include',
      }
    )
    categories.value = response.data || []
  } catch (error) {
    console.error('カテゴリ取得エラー:', error)
  }
}

const handleThumbnailUpload = async (event: globalThis.Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    try {
      // ファイルサイズをチェック（10MB制限）
      const maxFileSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxFileSize) {
        toastError(
          `ファイルサイズが大きすぎます。最大${maxFileSize / 1024 / 1024}MBまでアップロード可能です。`
        )
        if (target) {
          target.value = ''
        }
        return
      }

      // プレビュー用にBase64で読み込む
      const reader = new FileReader()
      reader.onload = e => {
        const result = e.target?.result as string
        thumbnailPreview.value = result
      }
      reader.readAsDataURL(file)

      // Supabase Storageにアップロード
      const formData = new FormData()
      formData.append('thumbnail', file)

      const response = await $fetch<{
        success: boolean
        data: { url: string }
      }>('/api/admin/upload-thumbnail', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (response.success && response.data.url) {
        form.thumbnail = response.data.url
      } else {
        throw new Error('画像のアップロードに失敗しました')
      }
    } catch (error) {
      console.error('画像アップロードエラー:', error)
      toastError('画像のアップロードに失敗しました')
      // エラー時はプレビューとフォームの値をクリア
      thumbnailPreview.value = null
      form.thumbnail = null
      // ファイル入力をリセット
      if (target) {
        target.value = ''
      }
    }
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
        form_link: form.form_link || null,
        start_date: form.start_date,
        end_date: form.end_date || null,
        description: form.description,
        body: form.body ? JSON.stringify(form.body) : null,
        location_name: form.location_name || null,
        location_address: form.location_address || null,
        location_url: form.location_url || null,
        thumbnail: form.thumbnail || null,
        cta_button_text: form.cta_button_text || null,
        is_displayed: form.is_displayed,
        published_start: form.published_start || null,
        published_end: form.published_end || null,
        capacity: form.capacity || null,
        approval_type: form.approval_type ?? 0,
        category_ids: form.category_ids,
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
  fetchCategories()
})
</script>
