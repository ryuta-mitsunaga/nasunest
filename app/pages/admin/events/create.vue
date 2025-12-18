<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <UButton variant="soft" to="/admin/events" class="mb-4">
        <UIcon name="i-heroicons-arrow-left" />
        一覧に戻る
      </UButton>
      <h1 class="text-3xl font-bold">新規イベント作成</h1>
    </div>

    <UCard>
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
          <UButton type="submit" :loading="submitting">作成</UButton>
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

interface Form {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
}

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

const submitting = ref(false)
const forms = ref<Form[]>([])
const categories = ref<Category[]>([])
const thumbnailPreview = ref<string | null>(null)

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
    await $fetch('/api/events', {
      method: 'POST',
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
  fetchForms()
  fetchCategories()
})
</script>
