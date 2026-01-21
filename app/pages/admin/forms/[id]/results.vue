<template>
  <div class="container mx-auto p-6">
    <div v-if="loading" class="text-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
    </div>

    <UCard v-else>
      <template #header>
        <div>
          <h1 class="text-xl font-bold">回答状況</h1>
          <p v-if="formName" class="text-sm text-gray-600 mt-1">{{ formName }}</p>
        </div>
      </template>
      <div class="p-6">
        <div v-if="answers.length === 0" class="text-center py-8 text-gray-400">
          回答がありません
        </div>
        <UTable
          v-else
          :data="answers"
          :columns="columns"
          :meta="tableMeta"
          class="w-full"
        >
          <template #no-cell="{ row }">
            {{ answers.indexOf(row.original) + 1 }}
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

          <template #is_cancel-cell="{ row }">
            <UStatusBadge
              :status="row.original.is_cancel ? 'error' : 'success'"
            >
              {{ row.original.is_cancel ? 'キャンセル' : '有効' }}
            </UStatusBadge>
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
    description?: string
    fields: FormField[]
  }
}

interface FormAnswer {
  id: number
  form_id: number
  date: Date
  content: Record<string, any>
  createdAt: Date
  is_cancel: boolean
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
const formName = ref('')
const formFields = ref<FormField[]>([])
const answers = ref<FormAnswer[]>([])
const { success: toastSuccess, error: toastError } = useCustomToast()
const { showFetchErrorPage } = useAdminErrorPage()

const tableMeta = computed(() => ({
  class: {
    tr: (row: TableRow<FormAnswer>) =>
      row.original.is_cancel ? 'bg-gray-200 opacity-60' : '',
  },
}))

const columns = computed<TableColumn<FormAnswer>[]>(() => {
  const withColWidth = (
    col: TableColumn<FormAnswer>
  ): TableColumn<FormAnswer> =>
    ({
      ...col,
      meta: {
        ...(col as any).meta,
        class: {
          ...(((col as any).meta?.class as any) || {}),
          th: `min-w-[100px] max-w-[200px] ${((col as any).meta?.class?.th as string) || ''}`.trim(),
          td: `whitespace-normal break-words overflow-hidden ${((col as any).meta?.class?.td as string) || ''}`.trim(),
        },
      },
    }) as TableColumn<FormAnswer>

  return [
    withColWidth({ accessorKey: 'no', header: 'No.' }),
    withColWidth({ accessorKey: 'createdAt', header: '回答日時' }),
    ...formFields.value.map(field =>
      withColWidth({
        accessorKey: field.id,
        header: field.label || '（未設定）',
      })
    ),
    withColWidth({
      accessorKey: 'is_cancel',
      header: 'ステータス',
    }),
  ]
})

const fetchFormData = async () => {
  loading.value = true
  try {
    // 回答状況（フォーム情報 + 回答）をまとめて取得
    const resultsResponse = await $fetch<{
      success: boolean
      data: {
        form: Form
        answers: FormAnswer[]
      }
    }>(`/api/admin/forms/${formId.value}/results`, {
      credentials: 'include',
    })
    const form = resultsResponse.data.form
    formName.value = form.name
    formFields.value = JSON.parse(JSON.stringify(form.content.fields || []))
    answers.value = resultsResponse.data.answers || []
  } catch (error) {
    console.error('データ取得エラー:', error)
    // 初期表示の取得失敗はエラー画面にする
    showFetchErrorPage(error, 'データの取得に失敗しました')
    return
  } finally {
    loading.value = false
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
  const value = content[fieldId]
  if (value === undefined || value === null || value === '') {
    return ''
  }
  if (Array.isArray(value)) {
    // 日程調整フィールドの場合は日時をフォーマット
    const field = formFields.value.find(f => f.id === fieldId)
    if (field && field.type === 'date-picker') {
      return value
        .map((dateTimeString: string) => {
          const [date, time] = dateTimeString.split('T')
          if (date && time) {
            return formatDateOption({ date, time })
          }
          return dateTimeString
        })
        .join(', ')
    }
    return value.join(', ')
  }
  return String(value)
}

interface DateOption {
  date: string
  time: string
}

const formatDateOption = (dateOption: DateOption): string => {
  if (!dateOption.date || !dateOption.time) {
    return ''
  }
  const date = new Date(`${dateOption.date}T${dateOption.time}`)
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = weekdays[date.getDay()]
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}/${day}(${weekday}) ${hours}:${minutes}～`
}

onMounted(() => {
  fetchFormData()
})
</script>
