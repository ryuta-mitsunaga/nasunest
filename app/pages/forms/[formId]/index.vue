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

      <!-- フォーム -->
      <UForm v-else :state="formState" @submit="goToConfirm" class="space-y-6">
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

              <!-- 電話番号 -->
              <UInput
                v-else-if="field.type === 'tel'"
                v-model="formData[field.id]"
                type="tel"
                autocomplete="tel"
                inputmode="tel"
                :required="field.required"
                :placeholder="field.placeholder || ''"
                size="lg"
              />

              <!-- 数値 -->
              <UInput
                v-else-if="field.type === 'number'"
                v-model="formData[field.id]"
                type="number"
                inputmode="decimal"
                step="any"
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

        <!-- 注意事項への同意 -->
        <UCard data-consent-section>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">注意事項</h3>
          <p class="text-sm text-gray-600 mb-4">
            以下の内容に同意いただいたうえでお申し込みください。
          </p>
          <ul
            class="text-sm text-gray-600 space-y-2 list-disc list-inside mb-4"
          >
            <li>
              イベント内で発生した事故やトラブルについては、主催者および運営は責任を負いかねます。
            </li>
            <li>
              ご記入いただいた個人情報は、本事業の運営およびご連絡の目的にのみ使用いたします。
            </li>
            <li>
              イベントの様子を写真・動画で記録し、広報や記録として使用する場合があります。
            </li>
            <li>
              やむを得ない事情により、イベントの中止または内容の変更が生じる場合があります。
            </li>
          </ul>
          <UFormField
            label="上記の注意事項に同意します"
            name="consent"
            required
          >
            <UCheckbox
              id="consent"
              v-model="consentAccepted"
              label="注意事項に同意する"
              size="lg"
              @update:model-value="onConsentChange"
            />
          </UFormField>
          <p v-if="consentError" class="text-sm text-red-600 mt-2">
            {{ consentError }}
          </p>
        </UCard>

        <!-- 確認画面へ -->
        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <UButton type="submit" size="lg"> 入力内容を確認 </UButton>
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
  type:
    | 'text'
    | 'email'
    | 'select'
    | 'checkbox'
    | 'date-picker'
    | 'tel'
    | 'number'
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

const route = useRoute()
const formId = computed(() => {
  const id = route.params.formId
  if (Array.isArray(id)) {
    return id[0] || ''
  }
  return id || ''
})

const { loadDraft, saveDraft } = usePublicFormDraft()

const loading = ref(true)
const error = ref('')
const formName = ref('')
const formDescription = ref('')
const formFields = ref<FormField[]>([])
const formData = ref<Record<string, any>>({})
const fieldErrors = ref<Record<string, string>>({})
const consentAccepted = ref(false)
const consentError = ref('')

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

    const restored = loadDraft(formId.value)
    if (restored) {
      for (const field of formFields.value) {
        const id = field.id
        if (Object.prototype.hasOwnProperty.call(restored.formData, id)) {
          formData.value[id] = restored.formData[id]
        }
      }
      consentAccepted.value = restored.consentAccepted
    }
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

/** 入力値を検証用の文字列にそろえる（number 入力の number 型にも対応） */
const fieldValueAsTrimmedString = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number' && !Number.isNaN(value)) return String(value)
  if (typeof value === 'string') return value.trim()
  return String(value).trim()
}

const isValidNumberFieldInput = (s: string): boolean => {
  if (s === '') return true
  const n = Number(s)
  return Number.isFinite(n)
}

const isValidTelFieldInput = (s: string): boolean => {
  if (s === '') return true
  const digits = s.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

const onConsentChange = (checked: boolean | 'indeterminate') => {
  if (checked === true) {
    consentError.value = ''
  }
}

const validateForm = () => {
  fieldErrors.value = {}
  const errors: string[] = []

  for (const field of formFields.value) {
    const value = formData.value[field.id]
    const strVal = fieldValueAsTrimmedString(value)

    if (field.required) {
      let isValid = false

      if (field.type === 'checkbox' || field.type === 'date-picker') {
        isValid = Array.isArray(value) && value.length > 0
      } else if (field.type === 'select') {
        isValid = value !== '' && value !== null && value !== undefined
      } else {
        isValid = strVal !== ''
      }

      if (!isValid) {
        const errorMsg = 'この項目は必須です'
        fieldErrors.value[field.id] = errorMsg
        errors.push(`${field.label}は必須項目です`)
      }
    }

    if (!fieldErrors.value[field.id]) {
      if (
        field.type === 'number' &&
        strVal !== '' &&
        !isValidNumberFieldInput(strVal)
      ) {
        const errorMsg = '有効な数値を入力してください'
        fieldErrors.value[field.id] = errorMsg
        errors.push(`${field.label}: ${errorMsg}`)
      } else if (
        field.type === 'tel' &&
        strVal !== '' &&
        !isValidTelFieldInput(strVal)
      ) {
        const errorMsg =
          '電話番号は10〜15桁の数字で入力してください（ハイフン可）'
        fieldErrors.value[field.id] = errorMsg
        errors.push(`${field.label}: ${errorMsg}`)
      }
    }
  }

  return errors
}

const goToConfirm = async () => {
  consentError.value = ''

  if (!consentAccepted.value) {
    consentError.value = '確認へ進むには注意事項への同意が必要です'
    const consentCard = document.querySelector('[data-consent-section]')
    if (consentCard) {
      consentCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }

  const errors = validateForm()
  if (errors.length > 0) {
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

  const eventId = route.query.event_id ? String(route.query.event_id) : null
  saveDraft(formId.value, {
    formData: JSON.parse(JSON.stringify(formData.value)),
    consentAccepted: consentAccepted.value,
    eventId,
  })

  await navigateTo({
    path: `/forms/${formId.value}/confirm`,
    query: route.query,
  })
}

// リアルタイムバリデーション
watch(
  formData,
  () => {
    for (const fieldId in fieldErrors.value) {
      const field = formFields.value.find(f => f.id === fieldId)
      if (!field) continue

      const value = formData.value[fieldId]
      const strVal = fieldValueAsTrimmedString(value)
      let ok = true

      if (field.type === 'checkbox' || field.type === 'date-picker') {
        ok = Array.isArray(value) && value.length > 0
      } else if (field.type === 'select') {
        ok = value !== '' && value !== null && value !== undefined
      } else if (field.required) {
        ok = strVal !== ''
      }

      if (
        ok &&
        field.type === 'number' &&
        strVal !== '' &&
        !isValidNumberFieldInput(strVal)
      ) {
        ok = false
      }
      if (
        ok &&
        field.type === 'tel' &&
        strVal !== '' &&
        !isValidTelFieldInput(strVal)
      ) {
        ok = false
      }

      if (ok) {
        delete fieldErrors.value[fieldId]
      }
    }
  },
  { deep: true }
)

onMounted(() => {
  fetchForm()
})
</script>
