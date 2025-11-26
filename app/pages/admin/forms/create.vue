<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <UButton variant="soft" to="/admin/forms" class="mb-4">
        <UIcon name="i-heroicons-arrow-left" />
        一覧に戻る
      </UButton>
      <h1 class="text-3xl font-bold">新規フォーム作成</h1>
    </div>

    <AdminFormEditor
      submit-label="作成"
      :submitting="submitting"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import type { FormField } from '~/components/admin/FormEditor.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'admin',
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

    await $fetch('/api/forms', {
      method: 'POST',
      credentials: 'include',
      body: {
        name: data.name,
        content,
        published_start: data.published_start || null,
        published_end: data.published_end || null,
      },
    })

    await navigateTo('/admin/forms')
    toastSuccess('保存しました')
  } catch (error) {
    console.error('保存エラー:', error)
    toastError('保存に失敗しました')
  } finally {
    submitting.value = false
  }
}
</script>
