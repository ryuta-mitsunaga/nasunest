<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <UButton
        variant="soft"
        :to="`/admin/forms/${formId}/answers`"
        class="mb-4"
      >
        <UIcon name="i-heroicons-arrow-left" />
        回答一覧に戻る
      </UButton>
      <h1 class="text-xl font-bold">フォーム回答詳細</h1>
    </div>

    <div v-if="loading" class="text-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
    </div>

    <div v-else-if="answer" class="space-y-6">
      <!-- 回答情報 -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">回答情報</h2>
        </template>
        <div class="p-6 space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-600">回答ID</label>
            <p class="text-lg">{{ answer.id }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">回答日時</label>
            <p class="text-lg">{{ formatDate(answer.createdAt) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600"
              >承認ステータス</label
            >
            <div class="mt-1">
              <UBadge
                :color="
                  answer.status === 1
                    ? 'success'
                    : answer.status === 2
                      ? 'error'
                      : 'warning'
                "
                variant="soft"
              >
                {{
                  answer.status === 1
                    ? '承認済み'
                    : answer.status === 2
                      ? '却下'
                      : '回答待ち'
                }}
              </UBadge>
            </div>
          </div>
          <div v-if="answer.event_id">
            <label class="text-sm font-medium text-gray-600">イベントID</label>
            <p class="text-lg">{{ answer.event_id }}</p>
          </div>
          <div v-if="answer.user_id">
            <label class="text-sm font-medium text-gray-600">ユーザーID</label>
            <p class="text-lg">{{ answer.user_id }}</p>
          </div>
        </div>
      </UCard>

      <!-- 回答内容 -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">回答内容</h2>
        </template>
        <div class="p-6 space-y-4">
          <div
            v-for="field in formFields"
            :key="field.id"
            class="border rounded-lg p-4"
          >
            <div class="mb-2">
              <p class="font-semibold text-lg">{{ field.label }}</p>
              <span
                class="inline-block mt-1 px-2 py-1 text-xs rounded bg-gray-100"
              >
                {{ getFieldTypeLabel(field.type) }}
              </span>
            </div>
            <div class="mt-3">
              <p class="text-gray-700">
                {{ getAnswerValue(answer.content, field.id) }}
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- 操作ボタン -->
      <div v-if="answer.status === 0" class="flex gap-2 justify-end">
        <UButton
          color="success"
          variant="soft"
          @click="handleApprove"
          :loading="processing"
        >
          承認
        </UButton>
        <UButton
          color="error"
          variant="soft"
          @click="handleReject"
          :loading="processing"
        >
          却下
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormField } from '~/components/admin/FormEditor.vue'

definePageMeta({
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

interface FormAnswer {
  id: number
  form_id: number
  event_id: number | null
  user_id: number | null
  date: Date
  content: Record<string, any>
  status: number | null
  createdAt: Date
}

const route = useRoute()
const formId = computed(() => {
  const id = route.params.id
  if (Array.isArray(id)) {
    return id[0] || ''
  }
  return id || ''
})

const answerId = computed(() => {
  const id = route.params.answerId
  if (Array.isArray(id)) {
    return id[0] || ''
  }
  return id || ''
})

const loading = ref(true)
const processing = ref(false)
const formFields = ref<FormField[]>([])
const answer = ref<FormAnswer | null>(null)
const { success: toastSuccess, error: toastError } = useCustomToast()
const { showFetchErrorPage } = useAdminErrorPage()

const fetchData = async () => {
  loading.value = true
  try {
    // フォーム情報を取得
    const formResponse = await $fetch<{ success: boolean; data: Form }>(
      `/api/forms/${formId.value}`,
      {
        credentials: 'include',
      }
    )
    const form = formResponse.data
    formFields.value = JSON.parse(JSON.stringify(form.content.fields || []))

    // 回答データを取得
    const answerResponse = await $fetch<{
      success: boolean
      data: FormAnswer
    }>(`/api/admin/forms/${formId.value}/answers/${answerId.value}`, {
      credentials: 'include',
    })
    answer.value = answerResponse.data
  } catch (error) {
    console.error('データ取得エラー:', error)
    // 初期表示の取得失敗はエラー画面にする
    showFetchErrorPage(error, 'データの取得に失敗しました')
    return
  } finally {
    loading.value = false
  }
}

const handleApprove = async () => {
  processing.value = true
  try {
    await $fetch(`/api/admin/forms/${formId.value}/answers/${answerId.value}`, {
      method: 'PUT',
      credentials: 'include',
      body: {
        status: 1, // OK
      },
    })
    toastSuccess('承認しました')
    await fetchData()
  } catch (error) {
    console.error('承認エラー:', error)
    toastError('承認に失敗しました')
  } finally {
    processing.value = false
  }
}

const handleReject = async () => {
  processing.value = true
  try {
    await $fetch(`/api/admin/forms/${formId.value}/answers/${answerId.value}`, {
      method: 'PUT',
      credentials: 'include',
      body: {
        status: 2, // NG
      },
    })
    toastSuccess('却下しました')
    await fetchData()
  } catch (error) {
    console.error('却下エラー:', error)
    toastError('却下に失敗しました')
  } finally {
    processing.value = false
  }
}

const getFieldTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    text: 'テキスト',
    select: 'プルダウン',
    checkbox: 'チェックボックス',
  }
  return labels[type] || type
}

const getAnswerValue = (content: Record<string, any>, fieldId: string) => {
  const value = content[fieldId]
  if (value === undefined || value === null || value === '') {
    return '（未回答）'
  }
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  return String(value)
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  fetchData()
})
</script>
