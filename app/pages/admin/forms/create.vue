<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <UButton
        v-if="!isFromEventForm"
        variant="soft"
        to="/admin/forms"
        class="mb-4"
      >
        <UIcon name="i-heroicons-arrow-left" />
        一覧に戻る
      </UButton>
      <h1 class="text-xl font-bold">新規フォーム作成</h1>
    </div>

    <AdminFormEditor
      @cancel="cancelForm"
      submit-label="作成"
      :submitting="submitting"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import type { FormField } from '~/components/admin/FormEditor.vue'
import { useDayjs } from '~/composables/useDayjs'

const { toUTC } = useDayjs()

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const isFromEventForm = computed(() => {
  return route.query.returnTo === 'event'
})

const { success: toastSuccess, error: toastError } = useCustomToast()
const submitting = ref(false)

const handleSubmit = async (data: {
  name: string
  description?: string
  fields: FormField[]
  published_start?: string | null
  published_end?: string | null
}) => {
  submitting.value = true
  try {
    const content = {
      description: data.description,
      fields: data.fields,
    }

    const response = await $fetch<{ success: boolean; data: { id: number } }>(
      '/api/forms',
      {
        method: 'POST',
        credentials: 'include',
        body: {
          name: data.name,
          content,
          published_start: toUTC(data.published_start),
          published_end: toUTC(data.published_end),
        },
      }
    )

    if (isFromEventForm.value) {
      window.close()
    } else {
      await navigateTo('/admin/forms')
    }
    toastSuccess('保存しました')
  } catch (error) {
    console.error('保存エラー:', error)
    toastError('保存に失敗しました')
  } finally {
    submitting.value = false
  }
}

const cancelForm = () => {
  if (isFromEventForm.value) {
    window.close()
  } else {
    navigateTo('/admin/forms')
  }
}
</script>
