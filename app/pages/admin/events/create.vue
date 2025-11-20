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

        <UFormField label="開始日" name="start_date" required>
          <UInput v-model="form.start_date" type="date" />
        </UFormField>

        <UFormField label="終了日" name="end_date">
          <UInput v-model="form.end_date" type="date" />
        </UFormField>

        <UFormField label="説明" name="description" required>
          <UTextarea
            v-model="form.description"
            placeholder="イベントの説明"
            :rows="5"
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
          <UButton type="submit" :loading="submitting">作成</UButton>
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

interface Form {
  id: number
  name: string
}

const form = reactive({
  title: '',
  form_id: null as number | null,
  start_date: '',
  end_date: '',
  description: '',
  location_name: '',
  location_address: '',
  location_url: '',
  thumbnail: null as string | null,
})

const formState = computed(() => form)
const submitting = ref(false)
const forms = ref<Form[]>([])
const thumbnailPreview = ref<string | null>(null)
const formOptions = computed(() => {
  return [
    { label: 'フォームを選択しない', value: null },
    ...forms.value.map(f => ({ label: f.name, value: f.id })),
  ]
})

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

const handleThumbnailUpload = (event: Event) => {
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
    alert('タイトル、開始日、説明は必須項目です')
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
        start_date: form.start_date,
        end_date: form.end_date || null,
        description: form.description,
        location_name: form.location_name || null,
        location_address: form.location_address || null,
        location_url: form.location_url || null,
        thumbnail: form.thumbnail || null,
      },
    })

    await navigateTo('/admin/events')
  } catch (error) {
    console.error('保存エラー:', error)
    alert('保存に失敗しました')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchForms()
})
</script>
