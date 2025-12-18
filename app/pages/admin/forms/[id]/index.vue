<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <UButton variant="soft" to="/admin/forms" class="mb-4">
        <UIcon name="i-heroicons-arrow-left" />
        一覧に戻る
      </UButton>
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold">フォーム詳細</h1>
        <UButton
          color="primary"
          variant="soft"
          :to="`/admin/forms/${formId}/edit`"
        >
          編集
        </UButton>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
    </div>

    <div v-else class="space-y-6">
      <!-- フォーム情報 -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">フォーム情報</h2>
        </template>
        <div class="p-6 space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-600">フォーム名</label>
            <p class="text-lg">{{ formName }}</p>
          </div>
          <div v-if="formDescription">
            <label class="text-sm font-medium text-gray-600">説明</label>
            <p class="text-lg text-gray-700">{{ formDescription }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">回答数</label>
            <p class="text-lg">{{ answers.length }}件</p>
          </div>
        </div>
      </UCard>

      <!-- フォーム項目 -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">フォーム項目</h2>
        </template>
        <div class="p-6 space-y-4">
          <div
            v-for="(field, index) in formFields"
            :key="field.id"
            class="border rounded-lg p-4"
          >
            <div class="flex items-start gap-2 mb-2">
              <span class="text-sm font-medium text-gray-500"
                >{{ index + 1 }}.</span
              >
              <div class="flex-1">
                <p class="font-semibold">{{ field.label }}</p>
                <span
                  class="inline-block mt-1 px-2 py-1 text-xs rounded bg-gray-100"
                >
                  {{ getFieldTypeLabel(field.type) }}
                </span>
                <p v-if="field.description" class="text-sm text-gray-600 mt-2">
                  {{ field.description }}
                </p>
              </div>
            </div>
            <div v-if="field.type === 'select' || field.type === 'checkbox'">
              <p class="text-sm text-gray-600 mt-2">選択肢:</p>
              <ul class="list-disc list-inside text-sm text-gray-500 ml-4">
                <li
                  v-for="option in isStringArray(field.options)
                    ? field.options
                    : []"
                  :key="option"
                >
                  {{ option }}
                </li>
              </ul>
            </div>
            <div v-if="field.type === 'date-picker'">
              <p class="text-sm text-gray-600 mt-2">候補日程:</p>
              <ul class="list-disc list-inside text-sm text-gray-500 ml-4">
                <li
                  v-for="(dateOption, index) in getDateOptions(field)"
                  :key="index"
                >
                  {{ formatDateOption(dateOption) }}
                </li>
              </ul>
            </div>
            <div v-if="field.placeholder" class="mt-2">
              <p class="text-sm text-gray-500">
                プレースホルダー: {{ field.placeholder }}
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- 集計情報 -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">集計情報</h2>
        </template>
        <div class="p-6 space-y-6">
          <div
            v-for="(field, index) in formFields"
            :key="field.id"
            class="border rounded-lg p-4"
          >
            <div class="mb-4">
              <h3 class="font-semibold text-lg">{{ field.label }}</h3>
              <span class="text-sm text-gray-500">{{
                getFieldTypeLabel(field.type)
              }}</span>
              <p v-if="field.description" class="text-sm text-gray-600 mt-2">
                {{ field.description }}
              </p>
            </div>

            <!-- テキストフィールドの集計 -->
            <div v-if="field.type === 'text'">
              <p class="text-sm text-gray-600 mb-2">
                回答数: {{ getAnswerCount(field.id) }}件
              </p>
              <div
                v-if="getTextAnswers(field.id).length > 0"
                class="space-y-2 max-h-60 overflow-y-auto"
              >
                <div
                  v-for="(answer, idx) in getTextAnswers(field.id)"
                  :key="idx"
                  class="p-2 bg-gray-50 rounded text-sm"
                >
                  {{ answer }}
                </div>
              </div>
              <p v-else class="text-sm text-gray-400">回答なし</p>
            </div>

            <!-- プルダウン/チェックボックスの集計 -->
            <div v-if="field.type === 'select' || field.type === 'checkbox'">
              <p class="text-sm text-gray-600 mb-2">
                回答数: {{ getAnswerCount(field.id) }}件
              </p>
              <div v-if="isStringArray(field.options)" class="space-y-2">
                <div
                  v-for="option in field.options"
                  :key="option"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span class="text-sm">{{ option }}</span>
                  <span class="text-sm font-semibold text-blue-600">
                    {{ getOptionCount(field.id, option) }}件
                  </span>
                </div>
              </div>
            </div>

            <!-- 日程調整の集計 -->
            <div v-if="field.type === 'date-picker'">
              <p class="text-sm text-gray-600 mb-2">
                回答数: {{ getAnswerCount(field.id) }}件
              </p>
              <div v-if="getDateOptions(field).length > 0" class="space-y-2">
                <div
                  v-for="(dateOption, index) in getDateOptions(field)"
                  :key="index"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span class="text-sm">{{
                    formatDateOption(dateOption)
                  }}</span>
                  <span class="text-sm font-semibold text-blue-600">
                    {{ getDateOptionCount(field.id, dateOption) }}件
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- 回答一覧 -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">回答一覧</h2>
        </template>
        <div class="p-6">
          <div
            v-if="answers.length === 0"
            class="text-center py-8 text-gray-400"
          >
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
              <UCheckbox
                :model-value="row.original.is_cancel"
                @update:model-value="
                  v => handleToggleCancel(row.original.id, !!v)
                "
                :disabled="processingCancelAnswerId === row.original.id"
                label=""
              />
            </template>

            <template #actions-cell="{ row }">
              <div class="flex gap-2 flex-wrap">
                <UButton
                  size="sm"
                  variant="soft"
                  :to="`/admin/forms/${formId}/answers/${row.original.id}`"
                >
                  詳細
                </UButton>
              </div>
            </template>
          </UTable>
        </div>
      </UCard>
    </div>
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
const formDescription = ref('')
const formFields = ref<FormField[]>([])
const answers = ref<FormAnswer[]>([])
const processingCancelAnswerId = ref<number | null>(null)
const { success: toastSuccess, error: toastError } = useCustomToast()
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
      header: '申込みキャンセル',
    }),
    withColWidth({ accessorKey: 'actions', header: '操作' }),
  ]
})

const fetchFormData = async () => {
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
    formName.value = form.name
    formDescription.value = form.content.description || ''
    formFields.value = JSON.parse(JSON.stringify(form.content.fields || []))

    // 回答データを取得
    const answersResponse = await $fetch<{
      success: boolean
      data: FormAnswer[]
    }>(`/api/forms/${formId.value}/answers`, {
      credentials: 'include',
    })
    answers.value = answersResponse.data || []
  } catch (error) {
    console.error('データ取得エラー:', error)
    toastError('データの取得に失敗しました')
    await navigateTo('/admin/forms')
  } finally {
    loading.value = false
  }
}

const handleToggleCancel = async (answerId: number, nextValue: boolean) => {
  processingCancelAnswerId.value = answerId
  try {
    await $fetch(`/api/admin/forms/${formId.value}/answers/${answerId}`, {
      method: 'PUT',
      credentials: 'include',
      body: { is_cancel: nextValue },
    })
    toastSuccess(
      nextValue ? 'キャンセルにしました' : 'キャンセルを解除しました'
    )
    await fetchFormData()
  } catch (error) {
    console.error('キャンセル更新エラー:', error)
    toastError('キャンセル更新に失敗しました')
  } finally {
    processingCancelAnswerId.value = null
  }
}

const getFieldTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    text: 'テキスト',
    select: 'プルダウン',
    checkbox: 'チェックボックス',
    'date-picker': '日程調整',
  }
  return labels[type] || type
}

const getAnswerCount = (fieldId: string) => {
  return answers.value.filter(answer => {
    const value = answer.content[fieldId]
    return value !== undefined && value !== null && value !== ''
  }).length
}

const getTextAnswers = (fieldId: string) => {
  return answers.value
    .map(answer => answer.content[fieldId])
    .filter(value => value !== undefined && value !== null && value !== '')
}

const getOptionCount = (fieldId: string, option: string) => {
  return answers.value.filter(answer => {
    const value = answer.content[fieldId]
    if (Array.isArray(value)) {
      return value.includes(option)
    }
    return value === option
  }).length
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

interface DateOption {
  date: string
  time: string
}

const isStringArray = (
  options: string[] | DateOption[] | undefined
): options is string[] => {
  if (!options || !Array.isArray(options) || options.length === 0) {
    return false
  }
  return typeof options[0] === 'string'
}

const getDateOptions = (field: FormField): DateOption[] => {
  if (
    field.type === 'date-picker' &&
    Array.isArray(field.options) &&
    !isStringArray(field.options)
  ) {
    return field.options as DateOption[]
  }
  return []
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

const getDateOptionCount = (
  fieldId: string,
  dateOption: DateOption
): number => {
  const dateTimeString = `${dateOption.date}T${dateOption.time}`
  return answers.value.filter(answer => {
    const value = answer.content[fieldId]
    if (Array.isArray(value)) {
      return value.includes(dateTimeString)
    }
    return false
  }).length
}

onMounted(() => {
  fetchFormData()
})
</script>
