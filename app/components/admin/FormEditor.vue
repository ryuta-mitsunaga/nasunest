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

      <UFormField label="公開開始日" name="published_start">
        <UInput v-model="localPublishedStart" type="date" />
      </UFormField>

      <UFormField label="公開終了日" name="published_end">
        <UInput v-model="localPublishedEnd" type="date" />
      </UFormField>

      <!-- フィールドエディタ -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h4 class="text-lg font-semibold">フィールド</h4>
          <div class="flex gap-2">
            <UButton size="sm" @click="addField('text')">テキスト</UButton>
            <UButton size="sm" @click="addField('select')">プルダウン</UButton>
            <UButton size="sm" @click="addField('checkbox')"
              >チェックボックス</UButton
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
              <div v-if="field.type === 'text'">
                <UInput
                  v-model="field.placeholder"
                  placeholder="プレースホルダー（任意）"
                />
              </div>
              <div v-if="field.type === 'select' && field.options">
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
              <div v-if="field.type === 'checkbox' && field.options">
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
        <UButton variant="soft" to="/admin/forms">キャンセル</UButton>
        <UButton @click="handleSubmit" :loading="submitting">
          {{ submitLabel }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
export interface FormField {
  id: string
  type: 'text' | 'select' | 'checkbox'
  label: string
  placeholder?: string
  options?: string[]
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
  submit: [data: {
    name: string
    description?: string
    fields: FormField[]
    published_start?: string | null
    published_end?: string | null
  }]
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

const addField = (type: 'text' | 'select' | 'checkbox') => {
  const field: FormField = {
    id: `field_${++fieldIdCounter}`,
    type,
    label: '',
  }
  if (type === 'select' || type === 'checkbox') {
    field.options = ['']
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
  if (field) {
    if (!field.options) {
      field.options = []
    }
    field.options.push('')
  }
}

const removeOption = (fieldIndex: number, optionIndex: number) => {
  const field = localFormFields.value[fieldIndex]
  if (field && field.options) {
    field.options.splice(optionIndex, 1)
  }
}

const handleSubmit = () => {
  if (!localFormName.value.trim()) {
    alert('フォーム名を入力してください')
    return
  }

  emit('submit', {
    name: localFormName.value,
    description: localFormDescription.value || undefined,
    fields: localFormFields.value,
    published_start: localPublishedStart.value || null,
    published_end: localPublishedEnd.value || null,
  })
}
</script>
