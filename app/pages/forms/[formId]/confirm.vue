<template>
  <div class="min-h-screen py-8">
    <div class="container mx-auto max-w-3xl px-4">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin text-4xl text-blue-600"
        />
      </div>

      <div v-else-if="draft">
        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          :title="error"
          class="mb-6"
        />

        <template v-if="formFields.length > 0">
          <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">入力内容の確認</h1>
            <p class="mt-2 text-sm text-gray-600">
              内容をご確認のうえ、「送信する」でお申し込みが完了します。修正する場合は「入力に戻る」を押してください。
            </p>
          </div>

          <UCard class="mb-6">
            <div class="border-b border-gray-200 pb-4">
              <h2 class="text-xl font-normal text-gray-900">{{ formName }}</h2>
              <p v-if="formDescription" class="mt-2 text-sm text-gray-600">
                {{ formDescription }}
              </p>
            </div>
            <ul class="divide-y divide-gray-100">
              <li
                v-for="field in formFields"
                :key="field.id"
                class="flex flex-col gap-1 py-4 sm:flex-row sm:gap-4"
              >
                <span
                  class="shrink-0 text-sm font-medium text-gray-700 sm:w-48"
                  >{{ field.label }}</span
                >
                <span
                  class="whitespace-pre-wrap text-sm text-gray-900 sm:flex-1"
                  >{{
                    formatPublicFormAnswerForDisplay(
                      field,
                      draft!.formData[field.id]
                    )
                  }}</span
                >
              </li>
            </ul>
          </UCard>

          <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <UButton
              variant="outline"
              color="neutral"
              size="lg"
              :to="{
                path: `/forms/${formId}`,
                query: route.query,
              }"
            >
              入力に戻る
            </UButton>
            <UButton
              size="lg"
              :loading="submitting"
              :disabled="submitting"
              @click="submitAnswer"
            >
              送信する
            </UButton>
          </div>
        </template>

        <div v-else class="flex justify-end">
          <UButton
            variant="soft"
            size="lg"
            :to="{
              path: `/forms/${formId}`,
              query: route.query,
            }"
          >
            入力に戻る
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PublicFormDraftPayload } from '~/composables/usePublicFormDraft'
import type { PublicFormField } from '~/utils/publicFormDisplay'
import { formatPublicFormAnswerForDisplay } from '~/utils/publicFormDisplay'

interface FormField extends PublicFormField {
  type: string
  description?: string
  placeholder?: string
  options?: string[] | { date: string; time: string }[]
  required?: boolean
}

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
  const id = route.params.formId
  return Array.isArray(id) ? id[0] || '' : id || ''
})

const { loadDraft, clearDraft } = usePublicFormDraft()

const loading = ref(true)
const error = ref('')
const submitting = ref(false)
const draft = ref<PublicFormDraftPayload | null>(null)
const formName = ref('')
const formDescription = ref('')
const formFields = ref<FormField[]>([])

const fetchForm = async () => {
  error.value = ''
  try {
    const response = await $fetch<{ success: boolean; data: Form }>(
      `/api/public/forms/${formId.value}`
    )
    const form = response.data
    formName.value = form.name
    formDescription.value = form.content.description || ''
    formFields.value = JSON.parse(JSON.stringify(form.content.fields || []))
  } catch (err: any) {
    console.error('フォーム取得エラー:', err)
    error.value =
      err.data?.message || err.message || 'フォームの取得に失敗しました'
  }
}

const submitAnswer = async () => {
  if (!draft.value) return
  submitting.value = true
  error.value = ''
  try {
    await $fetch(`/api/public/forms/${formId.value}/answers`, {
      method: 'POST',
      body: {
        content: draft.value.formData,
        event_id: draft.value.eventId,
      },
    })
    clearDraft(formId.value)
    await navigateTo({
      path: `/forms/${formId.value}/complete`,
      query: route.query,
    })
  } catch (err: any) {
    console.error('送信エラー:', err)
    error.value = err.data?.message || err.message || '送信に失敗しました'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const stored = loadDraft(formId.value)
  if (!stored) {
    await navigateTo({
      path: `/forms/${formId.value}`,
      query: route.query,
    })
    return
  }
  draft.value = stored
  await fetchForm()
  loading.value = false
})

useHead({
  title: '入力内容の確認',
})
</script>
