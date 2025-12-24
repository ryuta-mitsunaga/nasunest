<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <UButton variant="soft" :to="`/admin/forms/${formId}`" class="mb-4">
        <UIcon name="i-heroicons-arrow-left" />
        フォーム詳細に戻る
      </UButton>
      <h1 class="text-3xl font-bold">フォーム回答一覧（回答待ち）</h1>
    </div>

    <div v-if="loading" class="text-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
    </div>

    <UCard v-else>
      <template #header>
        <h2 class="text-xl font-semibold">回答待ち: {{ answers.length }}件</h2>
      </template>
      <div class="p-6">
        <div v-if="answers.length === 0" class="text-center py-8 text-gray-400">
          回答待ちの申し込みはありません
        </div>
        <UTable v-else :data="answers" :columns="columns" :meta="tableMeta" class="w-full">
          <template #no-cell="{ row }">
            {{ answers.indexOf(row.original) + 1 }}
          </template>

          <template #id-cell="{ row }">
                <NuxtLink
              :to="`/admin/forms/${formId}/answers/${row.original.id}`"
                  class="text-primary hover:underline font-medium"
                >
              #{{ row.original.id }}
                </NuxtLink>
          </template>

          <template #createdAt-cell="{ row }">
            <span class="text-xs text-gray-500">
              {{ formatDate(row.original.createdAt) }}
            </span>
          </template>

          <template
            v-for="field in formFields"
            :key="field.id"
            #[`${field.id}-cell`]="{ row }"
          >
            <span class="text-sm">
              {{ getAnswerValue(row.original.content, field.id) }}
            </span>
          </template>

          <template #event_id-cell="{ row }">
            {{ row.original.event_id || 'なし' }}
          </template>

          <template #user_id-cell="{ row }">
            {{ row.original.user_id || 'なし' }}
          </template>

          <template #is_cancel-cell="{ row }">
            <UCheckbox
              :model-value="row.original.is_cancel"
              @update:model-value="(v) => handleToggleCancel(row.original.id, !!v)"
              :disabled="processingAnswerId === row.original.id"
              label=""
            />
          </template>

          <template #actions-cell="{ row }">
            <div class="flex gap-2 flex-wrap">
              <UButton
                color="primary"
                variant="soft"
                size="sm"
                :to="`/admin/forms/${formId}/answers/${row.original.id}`"
              >
                詳細
              </UButton>
                <UButton
                  color="success"
                  variant="soft"
                  size="sm"
                @click="handleApprove(row.original.id)"
                :loading="processingAnswerId === row.original.id"
                :disabled="row.original.is_cancel"
                >
                  承認
                </UButton>
                <UButton
                  color="error"
                  variant="soft"
                  size="sm"
                @click="handleReject(row.original.id)"
                :loading="processingAnswerId === row.original.id"
                :disabled="row.original.is_cancel"
                >
                  却下
                </UButton>
              </div>
          </template>
        </UTable>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { FormField } from '~/components/admin/FormEditor.vue'

definePageMeta({
  layout: 'admin',
})

interface Form {
  id: number
  name: string
  content: {
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
  is_cancel: boolean
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

const loading = ref(true)
const answers = ref<FormAnswer[]>([])
const formFields = ref<FormField[]>([])
const processingAnswerId = ref<number | null>(null)
const { success: toastSuccess, error: toastError } = useCustomToast()
const tableMeta = computed(() => ({
  class: {
    tr: (row: TableRow<FormAnswer>) =>
      row.original.is_cancel ? 'bg-gray-50 opacity-60' : '',
  },
}))

const columns = computed<TableColumn<FormAnswer>[]>(() => {
  const withColWidth = <T>(col: TableColumn<T>) => ({
    ...col,
    meta: {
      ...(col as any).meta,
      class: {
        ...(((col as any).meta?.class as any) || {}),
        th: `min-w-[130px] max-w-[200px] ${((col as any).meta?.class?.th as string) || ''}`.trim(),
        td: `min-w-[130px] max-w-[200px] whitespace-normal break-words overflow-hidden ${((col as any).meta?.class?.td as string) || ''}`.trim(),
      },
    },
  })

  return [
    withColWidth({ accessorKey: 'no', header: 'No.' }),
    withColWidth({ accessorKey: 'id', header: '回答ID' }),
    withColWidth({ accessorKey: 'createdAt', header: '回答日時' }),
    ...formFields.value.map(field => withColWidth({
      accessorKey: field.id,
      header: field.label || '（未設定）',
    })),
    withColWidth({ accessorKey: 'event_id', header: 'イベントID' }),
    withColWidth({ accessorKey: 'user_id', header: 'ユーザーID' }),
    withColWidth({
      accessorKey: 'is_cancel',
      header: '申込みキャンセル',
      meta: {
        class: {
          th: 'text-center',
          td: 'flex justify-center items-center',
        },
      },
    }),
    withColWidth({ accessorKey: 'actions', header: '操作' }),
  ]
})

const fetchFormFields = async () => {
  try {
    const response = await $fetch<{ success: boolean; data: Form }>(
      `/api/forms/${formId.value}`,
      { credentials: 'include' }
    )
    formFields.value = JSON.parse(
      JSON.stringify(response.data.content.fields || [])
    )
  } catch (e) {
    console.error('フォーム項目取得エラー:', e)
    formFields.value = []
  }
}

const fetchAnswers = async () => {
  loading.value = true
  try {
    const response = await $fetch<{
      success: boolean
      data: FormAnswer[]
    }>(`/api/forms/${formId.value}/answers?status=0`, {
      credentials: 'include',
    })
    answers.value = response.data || []
  } catch (error) {
    console.error('回答取得エラー:', error)
    toastError('回答の取得に失敗しました')
  } finally {
    loading.value = false
  }
}

const handleApprove = async (answerId: number) => {
  processingAnswerId.value = answerId
  try {
    await $fetch(`/api/admin/forms/${formId.value}/answers/${answerId}`, {
      method: 'PUT',
      credentials: 'include',
      body: {
        status: 1, // OK
      },
    })
    toastSuccess('承認しました')
    await fetchAnswers()
  } catch (error) {
    console.error('承認エラー:', error)
    toastError('承認に失敗しました')
  } finally {
    processingAnswerId.value = null
  }
}

const handleReject = async (answerId: number) => {
  processingAnswerId.value = answerId
  try {
    await $fetch(`/api/admin/forms/${formId.value}/answers/${answerId}`, {
      method: 'PUT',
      credentials: 'include',
      body: {
        status: 2, // NG
      },
    })
    toastSuccess('却下しました')
    await fetchAnswers()
  } catch (error) {
    console.error('却下エラー:', error)
    toastError('却下に失敗しました')
  } finally {
    processingAnswerId.value = null
  }
}

const handleToggleCancel = async (answerId: number, nextValue: boolean) => {
  processingAnswerId.value = answerId
  try {
    await $fetch(`/api/admin/forms/${formId.value}/answers/${answerId}`, {
      method: 'PUT',
      credentials: 'include',
      body: {
        is_cancel: nextValue,
      },
    })
    toastSuccess(nextValue ? 'キャンセルにしました' : 'キャンセルを解除しました')
    await fetchAnswers()
  } catch (error) {
    console.error('キャンセル更新エラー:', error)
    toastError('キャンセル更新に失敗しました')
  } finally {
    processingAnswerId.value = null
  }
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

const getAnswerValue = (content: Record<string, any>, fieldId: string) => {
  const value = content?.[fieldId]
  if (value === undefined || value === null || value === '') return ''
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

onMounted(() => {
  fetchFormFields()
  fetchAnswers()
})
</script>
