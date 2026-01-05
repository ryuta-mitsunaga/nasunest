<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <UButton variant="soft" :to="`/admin/eventReports/${id}`" class="mb-4">
        <UIcon name="i-heroicons-arrow-left" />
        詳細に戻る
      </UButton>
      <h1 class="text-xl font-bold">イベントレポート編集</h1>
    </div>

    <UCard v-if="loading" class="p-8">
      <div class="text-center">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
      </div>
    </UCard>

    <UCard v-else>
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
          <UButton variant="soft" :to="`/admin/eventReports/${id}`">
            キャンセル
          </UButton>
          <UButton
            type="submit"
            :loading="submitting"
            :disabled="uploadingThumbnail || uploadingImage"
          >
            更新
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

const route = useRoute()
const id = computed(() => route.params.id as string)

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
const loading = ref(true)
const events = ref<Event[]>([])
const thumbnailPreview = ref<string | null>(null)

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

const fetchEventReport = async () => {
  loading.value = true
  try {
    const response = await $fetch<{
      success: boolean
      data: {
        id: number
        event_id: number
        title: string
        thumbnail: string | null
        body: string | null
      }
    }>(`/api/admin/event-reports/${id.value}`, {
      credentials: 'include',
    })

    form.title = response.data.title
    form.event_id = response.data.event_id ?? undefined
    form.thumbnail = response.data.thumbnail ?? undefined
    if (response.data.body) {
      try {
        form.body =
          typeof response.data.body === 'string'
            ? JSON.parse(response.data.body)
            : response.data.body
      } catch {
        form.body = null
      }
    }
  } catch (error) {
    console.error('イベントレポート取得エラー:', error)
    toastError('イベントレポートの取得に失敗しました')
  } finally {
    loading.value = false
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
  if (!form.title.trim() || !form.event_id) {
    toastError('タイトルと対象のイベントは必須項目です')
    return
  }

  submitting.value = true
  try {
    await $fetch(`/api/admin/event-reports/${id.value}`, {
      method: 'PUT',
      credentials: 'include',
      body: {
        event_id: form.event_id,
        title: form.title,
        body: form.body ? JSON.stringify(form.body) : null,
        thumbnail: form.thumbnail || null,
      },
    })

    await navigateTo(`/admin/eventReports/${id.value}`)
    toastSuccess('イベントレポートを更新しました')
  } catch (error) {
    console.error('更新エラー:', error)
    toastError('更新に失敗しました')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchEvents(), fetchEventReport()])
})
</script>
