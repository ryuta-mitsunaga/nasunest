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

interface Form {
  id: number
  name: string
  content: {
    description?: string
    fields: FormField[]
  }
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
  } catch (error) {
    console.error('フォーム取得エラー:', error)
    alert('フォームの取得に失敗しました')
    await navigateTo('/admin/forms')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async (data: {
  name: string
  description?: string
  fields: FormField[]
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
      },
    })

    await navigateTo('/admin/forms')
  } catch (error) {
    console.error('保存エラー:', error)
    alert('保存に失敗しました')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchForm()
})
</script>
