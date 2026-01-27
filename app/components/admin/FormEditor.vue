<template>
  <UCard>
    <div class="space-y-6 p-6">
      <UFormField label="フォーム名" name="name" required>
        <UInput
          v-model="localFormName"
          placeholder="例: イベント申し込みフォーム"
        />
      </UFormField>

      <UFormField label="説明" name="description">
        <UTextarea
          v-model="localFormDescription"
          placeholder="フォームの説明を入力してください（任意）"
          :rows="3"
        />
      </UFormField>

      <UFormField label="公開開始日時" name="published_start">
        <UInput v-model="localPublishedStart" type="datetime-local" @change="(value) => console.log('👺', value)" />
      </UFormField>

      <UFormField label="公開終了日時" name="published_end">
        <UInput v-model="localPublishedEnd" type="datetime-local" />
      </UFormField>

      <!-- フィールドエディタ -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h4 class="text-lg font-semibold">フィールド</h4>
          <div class="flex gap-2">
            <UButton size="sm" @click="addField('text')">テキスト</UButton>
            <UButton size="sm" @click="addField('email')"
              >メールアドレス</UButton
            >
            <UButton size="sm" @click="addField('select')">プルダウン</UButton>
            <UButton size="sm" @click="addField('checkbox')"
              >チェックボックス</UButton
            >
            <UButton size="sm" @click="addField('date-picker')"
              >日程調整</UButton
            >
          </div>
        </div>

        <div
          v-if="localFormFields.length === 0"
          class="text-center py-8 text-gray-400"
        >
          フィールドを追加してください
        </div>

        <div
          v-for="(field, index) in localFormFields"
          :key="field.id"
          class="border rounded-lg p-4 space-y-3"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1 space-y-3">
              <div class="flex items-center gap-3">
                <UInput
                  v-model="field.label"
                  placeholder="質問文を入力"
                  class="font-semibold flex-1"
                />
                <label class="flex items-center gap-2 whitespace-nowrap">
                  <input
                    type="checkbox"
                    v-model="field.required"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-700">必須</span>
                </label>
              </div>
              <div class="mt-2">
                <UTextarea
                  v-model="field.description"
                  placeholder="説明を入力（任意）"
                  :rows="2"
                  class="text-sm"
                />
              </div>
              <div v-if="field.type === 'text' || field.type === 'email'">
                <UInput
                  v-model="field.placeholder"
                  placeholder="プレースホルダー（任意）"
                />
              </div>
              <div
                v-if="field.type === 'select' && isStringArray(field.options)"
              >
                <div
                  v-for="(option, optIndex) in field.options"
                  :key="optIndex"
                  class="flex gap-2 mb-2"
                >
                  <UInput
                    v-model="field.options[optIndex]"
                    :placeholder="`選択肢 ${optIndex + 1}`"
                  />
                  <UButton
                    color="error"
                    variant="soft"
                    size="sm"
                    @click="removeOption(index, optIndex)"
                  >
                    削除
                  </UButton>
                </div>
                <UButton size="sm" variant="soft" @click="addOption(index)">
                  選択肢を追加
                </UButton>
              </div>
              <div
                v-if="field.type === 'checkbox' && isStringArray(field.options)"
              >
                <div
                  v-for="(option, optIndex) in field.options"
                  :key="optIndex"
                  class="flex gap-2 mb-2"
                >
                  <UInput
                    v-model="field.options[optIndex]"
                    :placeholder="`選択肢 ${optIndex + 1}`"
                  />
                  <UButton
                    color="error"
                    variant="soft"
                    size="sm"
                    @click="removeOption(index, optIndex)"
                  >
                    削除
                  </UButton>
                </div>
                <UButton size="sm" variant="soft" @click="addOption(index)">
                  選択肢を追加
                </UButton>
              </div>
              <div v-if="field.type === 'date-picker'">
                <div
                  v-for="(dateOption, optIndex) in getDateOptions(field)"
                  :key="optIndex"
                  class="flex gap-2 mb-2 items-end"
                >
                  <div class="flex-1">
                    <label class="text-xs text-gray-600 mb-1 block">日付</label>
                    <UInput
                      v-model="dateOption.date"
                      type="date"
                      class="w-full"
                    />
                  </div>
                  <div class="flex-1">
                    <label class="text-xs text-gray-600 mb-1 block">時刻</label>
                    <UInput
                      v-model="dateOption.time"
                      list="data-list"
                      type="time"
                      class="w-full"
                      :step="1800"
                    />
                    <datalist id="data-list">
                      <option value="00:00">00:00</option>
                      <option value="00:30">00:30</option>
                      <option value="01:00">01:00</option>
                      <option value="01:30">01:30</option>
                      <option value="02:00">02:00</option>
                      <option value="02:30">02:30</option>
                      <option value="03:00">03:00</option>
                      <option value="03:30">03:30</option>
                      <option value="04:00">04:00</option>
                      <option value="04:30">04:30</option>
                      <option value="05:00">05:00</option>
                      <option value="05:30">05:30</option>
                      <option value="06:00">06:00</option>
                      <option value="06:30">06:30</option>
                      <option value="07:00">07:00</option>
                      <option value="07:30">07:30</option>
                      <option value="08:00">08:00</option>
                      <option value="08:30">08:30</option>
                      <option value="09:00">09:00</option>
                      <option value="09:30">09:30</option>
                      <option value="10:00">10:00</option>
                      <option value="10:30">10:30</option>
                      <option value="11:00">11:00</option>
                      <option value="11:30">11:30</option>
                      <option value="12:00">12:00</option>
                      <option value="12:30">12:30</option>
                      <option value="13:00">13:00</option>
                      <option value="13:30">13:30</option>
                      <option value="14:00">14:00</option>
                      <option value="14:30">14:30</option>
                      <option value="15:00">15:00</option>
                      <option value="15:30">15:30</option>
                      <option value="16:00">16:00</option>
                      <option value="16:30">16:30</option>
                      <option value="17:00">17:00</option>
                      <option value="17:30">17:30</option>
                      <option value="18:00">18:00</option>
                      <option value="18:30">18:30</option>
                      <option value="19:00">19:00</option>
                      <option value="19:30">19:30</option>
                      <option value="20:00">20:00</option>
                      <option value="20:30">20:30</option>
                      <option value="21:00">21:00</option>
                      <option value="21:30">21:30</option>
                      <option value="22:00">22:00</option>
                      <option value="22:30">22:30</option>
                      <option value="23:00">23:00</option>
                      <option value="23:30">23:30</option>
                    </datalist>
                  </div>
                  <UButton
                    color="error"
                    variant="soft"
                    size="sm"
                    @click="removeDateOption(index, optIndex)"
                  >
                    削除
                  </UButton>
                </div>
                <UButton
                  size="sm"
                  variant="soft"
                  @click="addDateOption(index)"
                >
                  日程を追加
                </UButton>
              </div>
            </div>
            <div class="flex flex-col gap-2 ml-4">
              <UButton
                color="error"
                variant="soft"
                size="sm"
                @click="removeField(index)"
              >
                削除
              </UButton>
              <UButton
                v-if="index > 0"
                variant="soft"
                size="sm"
                @click="moveField(index, index - 1)"
              >
                ↑
              </UButton>
              <UButton
                v-if="index < localFormFields.length - 1"
                variant="soft"
                size="sm"
                @click="moveField(index, index + 1)"
              >
                ↓
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-2 justify-end pt-4">
        <UButton @click="$emit('cancel')" variant="soft">キャンセル</UButton>
        <UButton @click="handleSubmit" :loading="submitting">
          {{ submitLabel }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
export interface DateOption {
  date: string
  time: string
}

export interface FormField {
  id: string
  type: 'text' | 'email' | 'select' | 'checkbox' | 'date-picker'
  label: string
  description?: string
  placeholder?: string
  options?: string[] | DateOption[]
  required?: boolean
}

interface Props {
  initialFormName?: string
  initialFormDescription?: string
  initialFields?: FormField[]
  initialPublishedStart?: string | null
  initialPublishedEnd?: string | null
  submitLabel?: string
  submitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialFormName: '',
  initialFormDescription: '',
  initialFields: () => [],
  initialPublishedStart: null,
  initialPublishedEnd: null,
  submitLabel: '保存',
  submitting: false,
})

const emit = defineEmits<{
  cancel: []
  submit: [
    data: {
      name: string
      description?: string
      fields: FormField[]
      published_start?: string | null
      published_end?: string | null
    },
  ]
}>()

const localFormName = ref(props.initialFormName)
const localFormDescription = ref(props.initialFormDescription)
const localPublishedStart = ref<string>(props.initialPublishedStart || '')
const localPublishedEnd = ref<string>(props.initialPublishedEnd || '')
const localFormFields = ref<FormField[]>(
  JSON.parse(JSON.stringify(props.initialFields))
)
let fieldIdCounter = 0

// 初期フィールドから最大IDを取得
watch(
  () => props.initialFields,
  newFields => {
    if (newFields && newFields.length > 0) {
      localFormFields.value = JSON.parse(JSON.stringify(newFields))
      const maxId = newFields.reduce((max, field) => {
        const match = field.id.match(/field_(\d+)/)
        if (match && match[1]) {
          const idNum = parseInt(match[1], 10)
          return Math.max(max, idNum)
        }
        return max
      }, 0)
      fieldIdCounter = maxId
    }
  },
  { immediate: true }
)

watch(
  () => props.initialFormName,
  newName => {
    localFormName.value = newName
  },
  { immediate: true }
)

watch(
  () => props.initialFormDescription,
  newDescription => {
    localFormDescription.value = newDescription
  },
  { immediate: true }
)

watch(
  () => props.initialPublishedStart,
  newPublishedStart => {
    localPublishedStart.value = newPublishedStart || ''
  },
  { immediate: true }
)

watch(
  () => props.initialPublishedEnd,
  newPublishedEnd => {
    localPublishedEnd.value = newPublishedEnd || ''
  },
  { immediate: true }
)

const addField = (
  type: 'text' | 'email' | 'select' | 'checkbox' | 'date-picker'
) => {
  const field: FormField = {
    id: `field_${++fieldIdCounter}`,
    type,
    label: '',
  }
  if (type === 'select' || type === 'checkbox') {
    field.options = ['']
  } else if (type === 'date-picker') {
    field.options = [{ date: '', time: '' }]
  }
  localFormFields.value.push(field)
}

const removeField = (index: number) => {
  localFormFields.value.splice(index, 1)
}

const moveField = (fromIndex: number, toIndex: number) => {
  const field = localFormFields.value.splice(fromIndex, 1)[0]
  if (field) {
    localFormFields.value.splice(toIndex, 0, field)
  }
}

const addOption = (fieldIndex: number) => {
  const field = localFormFields.value[fieldIndex]
  if (field && (field.type === 'select' || field.type === 'checkbox')) {
    if (!field.options) {
      field.options = []
    }
    if (isStringArray(field.options)) {
      field.options.push('')
    }
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

const removeOption = (fieldIndex: number, optionIndex: number) => {
  const field = localFormFields.value[fieldIndex]
  if (field && field.options && isStringArray(field.options)) {
    field.options.splice(optionIndex, 1)
  }
}

const getDateOptions = (field: FormField): DateOption[] => {
  if (field.type === 'date-picker' && Array.isArray(field.options)) {
    return field.options as DateOption[]
  }
  return []
}

const addDateOption = (fieldIndex: number) => {
  const field = localFormFields.value[fieldIndex]
  if (field && field.type === 'date-picker') {
    if (!field.options) {
      field.options = []
    }
    ;(field.options as DateOption[]).push({ date: '', time: '' })
  }
}

const removeDateOption = (fieldIndex: number, optionIndex: number) => {
  const field = localFormFields.value[fieldIndex]
  if (field && field.type === 'date-picker' && field.options) {
    ;(field.options as DateOption[]).splice(optionIndex, 1)
  }
}

const { error: toastError } = useCustomToast()

const handleSubmit = () => {
  if (!localFormName.value.trim()) {
    toastError('フォーム名を入力してください')
    return
  }

  // 空文字列をnullに変換するヘルパー関数
  const toNullIfEmpty = (value: string | null | undefined): string | null => {
    return value && value.trim() ? value : null
  }

  emit('submit', {
    name: localFormName.value,
    description: localFormDescription.value || undefined,
    fields: localFormFields.value,
    published_start: toNullIfEmpty(localPublishedStart.value),
    published_end: toNullIfEmpty(localPublishedEnd.value),
  })
}
</script>
