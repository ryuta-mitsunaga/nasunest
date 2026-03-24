<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <UButton variant="soft" to="/admin/forms" class="mb-4">
        <UIcon name="i-heroicons-arrow-left" />
        一覧に戻る
      </UButton>
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-bold">フォーム詳細</h1>
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
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <h2 class="text-xl font-semibold">回答一覧</h2>
              <UButton
                variant="soft"
                icon="i-heroicons-link"
                @click="handleShareResults"
                :loading="copyingResults"
              >
                共有
              </UButton>
            </div>
            <div class="flex items-center gap-4">
              <UCheckbox v-model="includeCancelled" label="キャンセルを含む" />
              <UButton
                color="primary"
                variant="soft"
                icon="i-heroicons-arrow-down-tray"
                @click="handleExportCsv"
              >
                CSV出力
              </UButton>
            </div>
          </div>
        </template>
        <div class="p-6">
          <AdminFormsBulkEmailSender
            v-if="hasEmailField && hasAnyEmailAnswer"
            :disabled-message="allEmailAnswersDisabledMessage"
            class="mb-2"
            :selected-count="selectedAnswerIds.length"
            @open-email-modal="openEmailModalForSelected"
          />
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
            <template #select-header>
              <UCheckbox
                :model-value="isAllSelected"
                :indeterminate="isIndeterminate"
                @update:model-value="toggleSelectAll"
                label=""
              />
            </template>

            <template #select-cell="{ row }">
              <UCheckbox
                :model-value="selectedAnswerIds.includes(row.original.id)"
                @update:model-value="
                  v => toggleAnswerSelection(row.original.id, !!v)
                "
                label=""
              />
            </template>

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
                <UButton
                  color="error"
                  size="sm"
                  variant="soft"
                  @click="handleDelete(row.original.id)"
                  :loading="processingCancelAnswerId === row.original.id"
                >
                  削除
                </UButton>
              </div>
            </template>
          </UTable>
        </div>
      </UCard>

      <!-- メール送信ログ -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">メール送信ログ</h2>
        </template>
        <div class="p-6">
          <div v-if="loadingLogs" class="text-center py-4">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl" />
          </div>
          <div
            v-else-if="emailLogs.length === 0"
            class="text-center py-8 text-gray-400"
          >
            メール送信ログがありません
          </div>
          <UTable
            v-else
            :data="emailLogs"
            :columns="emailLogColumns"
            class="w-full"
          >
            <template #status-cell="{ row }">
              <UStatusBadge
                :status="
                  row.original.status === 'success' ? 'success' : 'error'
                "
              >
                {{ row.original.status === 'success' ? '成功' : '失敗' }}
              </UStatusBadge>
            </template>
            <template #is_test-cell="{ row }">
              <UCheckbox
                :model-value="row.original.is_test"
                disabled
                label=""
              />
            </template>
            <template #createdAt-cell="{ row }">
              <span class="text-xs text-gray-500">
                {{ formatDate(row.original.createdAt) }}
              </span>
            </template>
            <template #admin-cell="{ row }">
              <span class="text-sm">
                {{ row.original.admin?.login_id || '-' }}
              </span>
            </template>
            <template #error_message-cell="{ row }">
              <span
                v-if="row.original.error_message"
                class="text-xs text-red-600"
                :title="row.original.error_message"
              >
                {{ row.original.error_message }}
              </span>
              <span v-else class="text-xs text-gray-400">-</span>
            </template>
            <template #body-cell="{ row }">
              <UButton
                size="sm"
                variant="soft"
                @click="openEmailBodyModal(row.original.html)"
              >
                確認
              </UButton>
            </template>
          </UTable>
        </div>
      </UCard>
    </div>

    <!-- メール送信モーダル -->
    <AdminFormsEmailSendModal
      v-model:open="isEmailModalOpen"
      :recipient-emails="selectedRecipientEmails"
      @send="handleEmailSend"
      ref="emailModalRef"
    />

    <!-- メール本文確認モーダル -->
    <AdminFormsEmailBodyModal
      v-model:open="isEmailBodyModalOpen"
      :body="selectedEmailBody"
    />
  </div>
</template>

<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { FormField } from '~/components/admin/FormEditor.vue'
import AdminFormsBulkEmailSender from '~/components/admin/forms/BulkEmailSender.vue'
import AdminFormsEmailSendModal from '~/components/admin/forms/EmailSendModal.vue'
import AdminFormsEmailBodyModal from '~/components/admin/forms/EmailBodyModal.vue'

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
const includeCancelled = ref(false)
const { success: toastSuccess, error: toastError } = useCustomToast()
const { showFetchErrorPage } = useAdminErrorPage()

// 選択状態管理
const selectedAnswerIds = ref<number[]>([])

// メール送信関連
const isEmailModalOpen = ref(false)
const emailModalRef = ref<{
  setSending: (value: boolean) => void
  reset: () => void
} | null>(null)

// メール送信ログ関連
const emailLogs = ref<any[]>([])
const loadingLogs = ref(false)

// メール本文確認モーダル関連
const isEmailBodyModalOpen = ref(false)
const selectedEmailBody = ref('')

// 共有機能関連
const copyingResults = ref(false)

const fetchEmailLogs = async () => {
  loadingLogs.value = true
  try {
    const response = await $fetch<{
      success: boolean
      data: any[]
    }>(`/api/admin/forms/${formId.value}/email-logs`, {
      credentials: 'include',
    })
    emailLogs.value = response.data || []
  } catch (error) {
    console.error('メール送信ログ取得エラー:', error)
  } finally {
    loadingLogs.value = false
  }
}

// メール送信ログのカラム定義
const emailLogColumns = computed(() => [
  { accessorKey: 'createdAt', header: '送信日時' },
  { accessorKey: 'recipient_email', header: '送信先' },
  { accessorKey: 'subject', header: '件名' },
  { accessorKey: 'body', header: '本文' },
  { accessorKey: 'status', header: 'ステータス' },
  { accessorKey: 'is_test', header: 'テスト配信' },
  { accessorKey: 'admin', header: '送信者' },
  { accessorKey: 'error_message', header: 'エラー' },
])
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
    withColWidth({
      accessorKey: 'select',
      header: '',
      meta: {
        class: {
          th: 'w-12 text-center',
          td: 'text-center',
        },
      },
    }),
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

/**選択中の回答全てにメールアドレスが含まれているかどうか */
const hasAllEmailAnswers = computed(() => {
  return selectedAnswerIds.value.every(answerId => {
    const answer = answers.value.find(answer => answer.id === answerId)
    return answer && getEmailFromAnswer(answer.content) !== null
  })
})

const allEmailAnswersDisabledMessage = computed(() => {
  return hasAllEmailAnswers.value
    ? ''
    : `メールアドレスが入力されていない回答があります。${selectedAnswerIds.value
        .map(answerId => {
          const answer = answers.value.find(answer => answer.id === answerId)

          if (!answer) return

          const email = getEmailFromAnswer(answer.content)
          return email ? undefined : `No.${answers.value.indexOf(answer) + 1}`
        })
        .filter(Boolean)
        .join(', ')}`
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
    // 初期表示の取得失敗はエラー画面にする（操作系はトーストのまま）
    showFetchErrorPage(error, 'データの取得に失敗しました')
    return
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

const { confirm } = useConfirm()

const handleDelete = async (answerId: number) => {
  const confirmed = await confirm({
    message: '本当にこの回答を削除しますか？',
    type: 'danger',
    confirmText: '削除',
    cancelText: 'キャンセル',
  })
  if (!confirmed) return

  processingCancelAnswerId.value = answerId
  try {
    await $fetch(`/api/admin/forms/${formId.value}/answers/${answerId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    toastSuccess('回答を削除しました')
    await fetchFormData()
  } catch (error) {
    console.error('削除エラー:', error)
    toastError('削除に失敗しました')
  } finally {
    processingCancelAnswerId.value = null
  }
}

// CSV出力処理
const handleExportCsv = async () => {
  try {
    const url = `/api/admin/forms/${formId.value}/answers/export-csv?includeCancelled=${includeCancelled.value}`
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.statusMessage || 'CSV出力に失敗しました')
    }

    // レスポンスからファイル名を取得（Content-Dispositionヘッダーから）
    const contentDisposition = response.headers.get('Content-Disposition')
    let fileName = `${formName.value || 'フォーム'}_回答一覧_${formatDateForFileName(new Date())}.csv`
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = decodeURIComponent(fileNameMatch[1])
      }
    }

    // Blobとして取得
    const blob = await response.blob()
    const urlObj = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = urlObj
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(urlObj)

    toastSuccess('CSVファイルをダウンロードしました')
  } catch (error: any) {
    console.error('CSV出力エラー:', error)
    toastError(error.message || 'CSV出力に失敗しました')
  }
}

// ファイル名用の日時フォーマット
const formatDateForFileName = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}${month}${day}_${hours}${minutes}`
}

const getFieldTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    text: 'テキスト',
    email: 'メールアドレス',
    select: 'プルダウン',
    checkbox: 'チェックボックス',
    'date-picker': '日程調整',
    tel: '電話番号',
    number: '数値',
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

// メールアドレスフィールドが存在するかチェック
const hasEmailField = computed(() => {
  return formFields.value.some(field => field.type === 'email')
})

// メールアドレスが入力されている回答が存在するかチェック
const hasAnyEmailAnswer = computed(() => {
  return answers.value.some(answer => {
    const email = getEmailFromAnswer(answer.content)
    return email !== null
  })
})

// 回答からメールアドレスを取得
const getEmailFromAnswer = (content: Record<string, any>): string | null => {
  const emailField = formFields.value.find(field => field.type === 'email')
  if (!emailField) return null
  const email = content[emailField.id]
  return email && typeof email === 'string' && email.trim()
    ? email.trim()
    : null
}

// メールアドレスが入力されている回答のリスト
const answersWithEmail = computed(() => {
  return answers.value
    .map(answer => ({
      answer,
      email: getEmailFromAnswer(answer.content),
    }))
    .filter(item => item.email !== null)
})

// 回答の選択をトグル
const toggleAnswerSelection = (answerId: number, selected: boolean) => {
  if (selected) {
    if (!selectedAnswerIds.value.includes(answerId)) {
      selectedAnswerIds.value.push(answerId)
    }
  } else {
    selectedAnswerIds.value = selectedAnswerIds.value.filter(
      id => id !== answerId
    )
  }
}

// 全選択状態をチェック
const isAllSelected = computed(() => {
  return (
    answers.value.length > 0 &&
    selectedAnswerIds.value.length === answers.value.length
  )
})

// 中間状態（一部選択）をチェック
const isIndeterminate = computed(() => {
  return (
    selectedAnswerIds.value.length > 0 &&
    selectedAnswerIds.value.length < answers.value.length
  )
})

// 全選択/全解除をトグル
const toggleSelectAll = (selected: boolean | 'indeterminate') => {
  if (selected === true) {
    // すべて選択
    selectedAnswerIds.value = answers.value.map(answer => answer.id)
  } else {
    // すべて解除
    selectedAnswerIds.value = []
  }
}

// 選択された回答からメールアドレスを取得
const getSelectedAnswersWithEmail = computed(() => {
  return answers.value
    .filter(answer => selectedAnswerIds.value.includes(answer.id))
    .map(answer => ({
      answer,
      email: getEmailFromAnswer(answer.content),
    }))
    .filter(item => item.email !== null)
})

// 選択された回答のメールアドレス一覧（送信先として使用）
const selectedRecipientEmails = computed(() => {
  return getSelectedAnswersWithEmail.value
    .map(item => item.email!)
    .filter(Boolean)
})

// メール送信モーダルを開く（選択された回答に対して）
const openEmailModalForSelected = () => {
  if (getSelectedAnswersWithEmail.value.length === 0) {
    toastError('メールアドレスが入力されている回答を選択してください')
    return
  }

  isEmailModalOpen.value = true
}

// メール送信処理
const handleEmailSend = async (data: {
  to: string[]
  subject: string
  html: string
  isTest?: boolean
}) => {
  if (emailModalRef.value) {
    emailModalRef.value.setSending(true)
  }

  try {
    // 複数のメールアドレスに順次送信
    const sendPromises = data.to.map(email =>
      $fetch('/api/admin/send-email', {
        method: 'POST',
        credentials: 'include',
        body: {
          to: email,
          subject: data.subject,
          html: data.html,
          from: undefined, // 送信者はサーバー側のデフォルトを使用
          form_id: parseInt(formId.value, 10),
          is_test: data.isTest || false,
        },
      })
    )

    await Promise.all(sendPromises)
    toastSuccess(`${data.to.length}件のメールを送信しました`)
    if (emailModalRef.value) {
      emailModalRef.value.reset()
    }
    isEmailModalOpen.value = false
    // ログを再取得
    await fetchEmailLogs()
  } catch (error: any) {
    console.error('メール送信エラー:', error)
    toastError(
      error.data?.statusMessage || error.message || 'メールの送信に失敗しました'
    )
    // エラー時もログを再取得（失敗ログが記録されているため）
    await fetchEmailLogs()
  } finally {
    if (emailModalRef.value) {
      emailModalRef.value.setSending(false)
    }
  }
}

// 回答状況ページのURLをクリップボードにコピー
const handleShareResults = async () => {
  copyingResults.value = true
  try {
    const url = `${window.location.origin}/admin/forms/${formId.value}/results`
    await navigator.clipboard.writeText(url)
    toastSuccess('URLをクリップボードにコピーしました')
  } catch (error) {
    console.error('コピーエラー:', error)
    toastError('URLのコピーに失敗しました')
  } finally {
    copyingResults.value = false
  }
}

// メール本文確認モーダルを開く
const openEmailBodyModal = (body: string | null | undefined) => {
  selectedEmailBody.value = body || ''
  isEmailBodyModalOpen.value = true
}

onMounted(() => {
  fetchFormData()
  fetchEmailLogs()
})
</script>
