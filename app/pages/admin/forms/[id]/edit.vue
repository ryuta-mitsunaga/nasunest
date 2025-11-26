<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <UButton variant="soft" to="/admin/forms" class="mb-4">
        <UIcon name="i-heroicons-arrow-left" />
        一覧に戻る
      </UButton>
      <h1 class="text-3xl font-bold">フォーム編集</h1>
    </div>

    <div v-if="loading" class="text-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
    </div>

    <AdminFormEditor
      v-else
      :initial-form-name="formName"
      :initial-form-description="formDescription"
      :initial-fields="formFields"
      :initial-published-start="formPublishedStart"
      :initial-published-end="formPublishedEnd"
      submit-label="更新"
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

interface Form {
  id: number
  name: string
  content: {
    description?: string
    fields: FormField[]
  }
  published_start: string | null
  published_end: string | null
}

const route = useRoute()
const formId = computed(() => {
  const id = route.params.id
  if (Array.isArray(id)) {
    return id[0] || ''
  }
  return id || ''
})

const loading = ref(true)
const submitting = ref(false)
const formName = ref('')
const formDescription = ref('')
const formFields = ref<FormField[]>([])
const formPublishedStart = ref<string | null>(null)
const formPublishedEnd = ref<string | null>(null)

const fetchForm = async () => {
  loading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: Form }>(
      `/api/forms/${formId.value}`,
      {
        credentials: 'include',
      }
    )
    const form = response.data
    formName.value = form.name
    formDescription.value = form.content.description || ''
    formFields.value = JSON.parse(JSON.stringify(form.content.fields || []))
    formPublishedStart.value = form.published_start
    formPublishedEnd.value = form.published_end
  } catch (error) {
    console.error('フォーム取得エラー:', error)
    toastError('フォームの取得に失敗しました')
    await navigateTo('/admin/forms')
  } finally {
    loading.value = false
  }
}

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

    await $fetch(`/api/forms/${formId.value}`, {
      method: 'PUT',
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

onMounted(() => {
  fetchForm()
})
</script>
