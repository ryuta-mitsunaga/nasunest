<template>
  <div class="min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-3xl">
      <!-- ローディング -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin text-4xl text-blue-600"
        />
      </div>

      <!-- エラー -->
      <UAlert
        v-else-if="error"
        color="error"
        variant="soft"
        :title="error"
        class="mb-6"
      />

      <!-- 送信完了 -->
      <UCard v-else-if="submitted" class="text-center">
        <div class="py-8">
          <UIcon
            name="i-heroicons-check-circle"
            class="text-6xl text-green-500 mx-auto mb-4"
          />
          <h2 class="text-2xl font-bold text-gray-900 mb-2">送信完了</h2>
          <p class="text-gray-600">ご回答ありがとうございました。</p>
        </div>
      </UCard>

      <!-- フォーム -->
      <UForm v-else :state="formState" @submit="handleSubmit" class="space-y-6">
        <!-- フォームヘッダー -->
        <UCard>
          <div class="pb-4 border-b border-gray-200">
            <h1 class="text-3xl font-normal text-gray-900">{{ formName }}</h1>
            <p v-if="formDescription" class="mt-2 text-sm text-gray-600">
              {{ formDescription }}
            </p>
          </div>
        </UCard>

        <!-- フォームフィールド -->
        <div
          v-for="(field, index) in formFields"
          :key="field.id"
          :data-field-id="field.id"
        >
          <UCard>
            <UFormField
              :label="field.label"
              :name="field.id"
              :required="field.required"
            >
              <template v-if="field.description" #description>
                <p class="text-sm text-gray-600 mt-1">
                  {{ field.description }}
                </p>
              </template>
              <!-- テキストフィールド -->
              <UInput
                v-if="field.type === 'text'"
                v-model="formData[field.id]"
                :required="field.required"
                :placeholder="field.placeholder || ''"
                size="lg"
              />

              <!-- メールアドレスフィールド -->
              <UInput
                v-else-if="field.type === 'email'"
                v-model="formData[field.id]"
                type="email"
                :required="field.required"
                :placeholder="field.placeholder || ''"
                size="lg"
              />

              <!-- プルダウンフィールド -->
              <USelect
                v-else-if="field.type === 'select'"
                v-model="formData[field.id]"
                :required="field.required"
                :items="getSelectOptions(field)"
                size="lg"
                class="w-48"
              />

              <!-- チェックボックスフィールド -->
              <div v-else-if="field.type === 'checkbox'" class="space-y-2">
                <UCheckbox
                  v-for="option in field.options"
                  :id="`${field.id}-${option}`"
                  :key="option"
                  :model-value="isChecked(field.id, option)"
                  :required="field.required"
                  :value="option"
                  :label="option"
                  size="lg"
                  @update:model-value="
                    val => toggleCheckbox(field.id, option, val)
                  "
                />
              </div>

              <!-- 日程調整フィールド -->
              <div v-else-if="field.type === 'date-picker'" class="space-y-3">
                <UCheckbox
                  v-for="(dateOption, index) in getDateOptions(field)"
                  :id="`${dateOption.date}-${dateOption.time}-${index}`"
                  :key="`${dateOption.date}-${dateOption.time}-${index}`"
                  :model-value="isDateChecked(field.id, dateOption)"
                  :required="field.required"
                  :label="formatDateOption(dateOption)"
                  size="lg"
                  @update:model-value="
                    val => toggleDateCheckbox(field.id, dateOption, val)
                  "
                />
              </div>
            </UFormField>
          </UCard>
        </div>

        <!-- 送信ボタン -->
        <div class="flex justify-end gap-4 pt-4">
          <UButton
            type="submit"
            size="lg"
            :loading="submitting"
            :disabled="submitting"
          >
            送信
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DateOption {
  date: string
  time: string
}

interface FormField {
  id: string
  type: 'text' | 'email' | 'select' | 'checkbox' | 'date-picker'
  label: string
  description?: string
  placeholder?: string
  options?: string[] | DateOption[]
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

if (process.server) {
  throw createError({
    statusCode: 404,
    statusMessage: 'ページが見つかりません',
  })
}

const route = useRoute()
const formId = computed(() => {
  const id = route.params.formId
  if (Array.isArray(id)) {
    return id[0] || ''
  }
  return id || ''
})

const loading = ref(true)
const error = ref('')
const submitting = ref(false)
const submitted = ref(false)
const formName = ref('')
const formDescription = ref('')
const formFields = ref<FormField[]>([])
const formData = ref<Record<string, any>>({})
const fieldErrors = ref<Record<string, string>>({})

const formState = computed(() => formData.value)

const fetchForm = async () => {
  loading.value = true
  error.value = ''
  fieldErrors.value = {}
  try {
    const response = await $fetch<{ success: boolean; data: Form }>(
      `/api/public/forms/${formId.value}`
    )
    const form = response.data
    formName.value = form.name
    formDescription.value = form.content.description || ''
    formFields.value = JSON.parse(JSON.stringify(form.content.fields || []))

    // フォームデータを初期化
    formFields.value.forEach(field => {
      if (field.type === 'checkbox' || field.type === 'date-picker') {
        formData.value[field.id] = []
      } else {
        formData.value[field.id] = ''
      }
    })
  } catch (err: any) {
    console.error('フォーム取得エラー:', err)
    error.value =
      err.data?.message || err.message || 'フォームの取得に失敗しました'
  } finally {
    loading.value = false
  }
}

const getSelectOptions = (field: FormField) => {
  if (!field.options) return []
  return [
    { label: '選択してください', value: undefined },
    ...field.options.map(option => ({ label: option, value: option })),
  ]
}

const isChecked = (fieldId: string, option: string) => {
  const value = formData.value[fieldId]
  if (Array.isArray(value)) {
    return value.includes(option)
  }
  return false
}

const toggleCheckbox = (
  fieldId: string,
  option: string,
  checked: boolean | string
) => {
  const isChecked = !!checked
  if (!Array.isArray(formData.value[fieldId])) {
    formData.value[fieldId] = []
  }
  const index = formData.value[fieldId].indexOf(option)
  if (isChecked && index === -1) {
    formData.value[fieldId].push(option)
  } else if (!isChecked && index > -1) {
    formData.value[fieldId].splice(index, 1)
  }
  // エラーをクリア
  if (fieldErrors.value[fieldId] && formData.value[fieldId].length > 0) {
    delete fieldErrors.value[fieldId]
  }
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

const isDateChecked = (fieldId: string, dateOption: DateOption): boolean => {
  const value = formData.value[fieldId]
  if (!Array.isArray(value)) {
    return false
  }
  const dateTimeString = `${dateOption.date}T${dateOption.time}`
  return value.includes(dateTimeString)
}

const toggleDateCheckbox = (
  fieldId: string,
  dateOption: DateOption,
  checked: boolean | string
) => {
  const isChecked = !!checked
  if (!Array.isArray(formData.value[fieldId])) {
    formData.value[fieldId] = []
  }
  const dateTimeString = `${dateOption.date}T${dateOption.time}`
  const index = formData.value[fieldId].indexOf(dateTimeString)
  if (isChecked && index === -1) {
    formData.value[fieldId].push(dateTimeString)
  } else if (!isChecked && index > -1) {
    formData.value[fieldId].splice(index, 1)
  }
  // エラーをクリア
  if (fieldErrors.value[fieldId] && formData.value[fieldId].length > 0) {
    delete fieldErrors.value[fieldId]
  }
}

const getFieldError = (fieldId: string) => {
  return fieldErrors.value[fieldId] || ''
}

const validateForm = () => {
  fieldErrors.value = {}
  const errors: string[] = []

  for (const field of formFields.value) {
    if (field.required) {
      const value = formData.value[field.id]
      let isValid = false

      if (field.type === 'checkbox' || field.type === 'date-picker') {
        isValid = Array.isArray(value) && value.length > 0
      } else if (field.type === 'select') {
        isValid = value !== '' && value !== null && value !== undefined
      } else {
        isValid = value && typeof value === 'string' && value.trim() !== ''
      }

      if (!isValid) {
        const errorMsg = 'この項目は必須です'
        fieldErrors.value[field.id] = errorMsg
        errors.push(`${field.label}は必須項目です`)
      }
    }
  }

  return errors
}

const handleSubmit = async () => {
  // 必須項目のバリデーション
  const errors = validateForm()
  if (errors.length > 0) {
    // 最初のエラーフィールドにスクロール
    const firstErrorFieldId = Object.keys(fieldErrors.value)[0]
    if (firstErrorFieldId) {
      const element = document.querySelector(
        `[data-field-id="${firstErrorFieldId}"]`
      )
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    return
  }

  submitting.value = true
  try {
    // クエリパラメータからevent_idを取得
    const eventId = route.query.event_id ? String(route.query.event_id) : null

    await $fetch(`/api/public/forms/${formId.value}/answers`, {
      method: 'POST',
      body: {
        content: formData.value,
        event_id: eventId,
      },
    })

    submitted.value = true
  } catch (err: any) {
    console.error('送信エラー:', err)
    error.value = err.data?.message || err.message || '送信に失敗しました'
  } finally {
    submitting.value = false
  }
}

// リアルタイムバリデーション
watch(
  formData,
  () => {
    // 入力時にエラーをクリア
    for (const fieldId in fieldErrors.value) {
      const field = formFields.value.find(f => f.id === fieldId)
      if (field) {
        const value = formData.value[fieldId]
        let isValid = false

        if (field.type === 'checkbox' || field.type === 'date-picker') {
          isValid = Array.isArray(value) && value.length > 0
        } else if (field.type === 'select') {
          isValid = value !== '' && value !== null && value !== undefined
        } else {
          isValid = value && typeof value === 'string' && value.trim() !== ''
        }

        if (isValid) {
          delete fieldErrors.value[fieldId]
        }
      }
    }
  },
  { deep: true }
)

onMounted(() => {
  fetchForm()
})
</script>
