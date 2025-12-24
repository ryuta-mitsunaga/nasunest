<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <h3 class="text-lg font-semibold">メール送信</h3>
    </template>

    <template #body>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            送信先メールアドレス
            <span class="text-xs text-gray-500 ml-2"
              >({{ recipientEmails.length }}件)</span
            >
          </label>
          <div class="mt-1 space-y-1">
            <p
              v-for="(email, index) in recipientEmails"
              :key="index"
              class="text-sm text-gray-900"
            >
              {{ email }}
            </p>
          </div>
        </div>
        <UFormField label="メールテンプレート">
          <USelect
            v-model="selectedTemplateId"
            :items="templateOptions"
            placeholder="テンプレートを選択（任意）"
            @update:model-value="handleTemplateSelect"
            class="w-full"
          />
        </UFormField>
        <UFormField label="件名" required>
          <UInput
            v-model="form.subject"
            placeholder="メールの件名を入力"
            class="w-full"
          />
        </UFormField>
        <UFormField label="メール本文" required>
          <UTextarea
            v-model="form.html"
            :rows="10"
            placeholder="メールの本文を入力（HTML形式）"
            class="w-full"
          />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton variant="soft" @click="handleCancel">キャンセル</UButton>
          <UButton
            color="primary"
            @click="handleSend"
            :loading="sending"
            :disabled="!form.subject || !form.html"
          >
            送信
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import {
  EMAIL_TEMPLATES,
  type EmailTemplate,
} from '~/constants/email-templates'

interface Props {
  open: boolean
  recipientEmails: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  send: [data: { to: string[]; subject: string; html: string }]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const sending = ref(false)
const selectedTemplateId = ref<string | undefined>(undefined)

const form = reactive({
  subject: '',
  html: '',
})

// テンプレート選択肢
const templateOptions = computed(() => {
  return EMAIL_TEMPLATES.map(template => ({
    label: template.title,
    value: template.id,
  }))
})

// テンプレート選択時の処理
const handleTemplateSelect = (templateId: string | undefined) => {
  if (!templateId || templateId === 'default') {
    return
  }

  const template = EMAIL_TEMPLATES.find(t => t.id === templateId)
  if (template) {
    // テンプレートのタイトルとコンテンツを適用
    if (template.title && template.title !== 'デフォルト') {
      form.subject = template.title
    }
    if (template.content) {
      form.html = template.content
    }
  }
}

const handleCancel = () => {
  isOpen.value = false
  form.subject = ''
  form.html = ''
}

const handleSend = () => {
  if (props.recipientEmails.length === 0 || !form.subject || !form.html) {
    return
  }
  sending.value = true
  emit('send', {
    to: props.recipientEmails,
    subject: form.subject,
    html: form.html,
  })
  // 送信後は親コンポーネントでモーダルを閉じる
}

// モーダルが開かれたときにフォームをリセット
watch(isOpen, newValue => {
  if (newValue) {
    form.subject = ''
    form.html = ''
    selectedTemplateId.value = undefined
  }
})

// 送信完了時にリセット
const reset = () => {
  sending.value = false
  handleCancel()
}

const setSending = (value: boolean) => {
  sending.value = value
}

defineExpose({
  reset,
  setSending,
})
</script>
