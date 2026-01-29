<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <UButton variant="soft" to="/admin/events" class="mb-4">
        <UIcon name="i-heroicons-arrow-left" />
        一覧に戻る
      </UButton>
      <h1 class="text-xl font-bold">新規イベント作成</h1>
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
        @uploading="uploadingImage = $event"
        @get-form-options="fetchForms"
      >
        <div class="flex gap-2 justify-end pt-4">
          <UButton variant="soft" to="/admin/events">キャンセル</UButton>
          <UButton
            type="submit"
            :loading="submitting"
            :disabled="uploadingThumbnail || uploadingImage"
          >
            作成
          </UButton>
        </div>
      </AdminEventsEventForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useDayjs } from '~/composables/useDayjs'

const { toUTC } = useDayjs()

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
  approval_type: 2,
  category_ids: [] as number[],
})

const submitting = ref(false)
const uploadingThumbnail = ref(false)
const uploadingImage = ref(false)
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

const handleThumbnailUpload = async (event: globalThis.Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    uploadingThumbnail.value = true
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
    } finally {
      uploadingThumbnail.value = false
    }
  }
}

const clearThumbnail = () => {
  thumbnailPreview.value = null
  form.thumbnail = null
}

const handleSubmit = async () => {
  if (!form.title.trim() || !form.start_date || !form.end_date) {
    toastError('タイトル、開始日、終了日は必須項目です')
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
        start_date: toUTC(form.start_date),
        end_date: toUTC(form.end_date),
        description: form.description,
        body: form.body ? JSON.stringify(form.body) : null,
        location_name: form.location_name || null,
        location_address: form.location_address || null,
        location_url: form.location_url || null,
        thumbnail: form.thumbnail || null,
        cta_button_text: form.cta_button_text || null,
        is_displayed: form.is_displayed,
        published_start: toUTC(form.published_start),
        published_end: toUTC(form.published_end),
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

// フォーム作成画面からのメッセージを受け取る
onMounted(() => {
  fetchForms()
  fetchCategories()

  // フォーム作成完了時のメッセージリスナー
  if (typeof window !== 'undefined') {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data?.type === 'formCreated') {
        // フォームリストを更新
        fetchForms()
        // 作成されたフォームを自動選択
        if (event.data.formId) {
          form.form_id = event.data.formId
        }
        toastSuccess('フォームを作成しました')
      }
    }

    window.addEventListener('message', handleMessage)

    onBeforeUnmount(() => {
      window.removeEventListener('message', handleMessage)
    })
  }
})
</script>
