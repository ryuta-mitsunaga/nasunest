<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <UButton variant="soft" to="/admin/eventReports" class="mb-4">
        <UIcon name="i-heroicons-arrow-left" />
        一覧に戻る
      </UButton>
      <h1 class="text-xl font-bold">新規イベントレポート作成</h1>
    </div>

    <UCard>
      <AdminEventReportsEventReportForm
        :form="form"
        :events="events"
        :thumbnail-preview="thumbnailPreview"
        @submit="handleSubmit"
        @thumbnail-upload="handleThumbnailUpload"
        @clear-thumbnail="clearThumbnail"
        @uploading="uploadingImage = $event"
      >
        <div class="flex gap-2 justify-end pt-4">
          <UButton variant="soft" to="/admin/eventReports">キャンセル</UButton>
          <UButton
            type="submit"
            :loading="submitting"
            :disabled="uploadingThumbnail || uploadingImage"
          >
            作成
          </UButton>
        </div>
      </AdminEventReportsEventReportForm>
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
  start_date: string
}

const form = reactive<{
  title: string
  event_id: number | undefined
  body: any | undefined
  thumbnail: string | undefined
}>({
  title: '',
  event_id: undefined,
  body: undefined,
  thumbnail: undefined,
})

const submitting = ref(false)
const uploadingThumbnail = ref(false)
const uploadingImage = ref(false)
const events = ref<Event[]>([])
const thumbnailPreview = ref<string | undefined>(undefined)

const fetchEvents = async () => {
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
      thumbnailPreview.value = undefined
      form.thumbnail = undefined
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
  form.thumbnail = undefined
}

const handleSubmit = async () => {
  if (!form.title.trim() || !form.event_id) {
    toastError('タイトルと対象のイベントは必須項目です')
    return
  }

  submitting.value = true
  try {
    await $fetch('/api/admin/event-reports', {
      method: 'POST',
      credentials: 'include',
      body: {
        event_id: form.event_id,
        title: form.title,
        body: form.body ? JSON.stringify(form.body) : null,
        thumbnail: form.thumbnail || null,
      },
    })

    await navigateTo('/admin/eventReports')
    toastSuccess('イベントレポートを作成しました')
  } catch (error) {
    console.error('保存エラー:', error)
    toastError('保存に失敗しました')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchEvents()
})
</script>
