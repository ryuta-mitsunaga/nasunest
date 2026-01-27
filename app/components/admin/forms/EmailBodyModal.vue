<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <h3 class="text-lg font-semibold">メール本文</h3>
    </template>
    <template #body>
      <div
        class="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto"
        v-html="body"
      ></div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          variant="soft"
          icon="i-heroicons-clipboard-document"
          @click="handleCopy"
        >
          コピー
        </UButton>
        <UButton variant="soft" color="neutral" @click="isOpen = false">閉じる</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { success: toastSuccess, error: toastError } = useCustomToast()

interface Props {
  open: boolean
  body: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

// 本文をクリップボードにコピー
const handleCopy = async () => {
  if (!props.body || !props.body.trim()) {
    toastError('コピーする内容がありません')
    return
  }

  try {
    // HTMLタグを除去してテキストのみをコピー
    const textContent = props.body.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
    await navigator.clipboard.writeText(textContent)
    toastSuccess('本文をクリップボードにコピーしました')
  } catch (error) {
    console.error('コピーエラー:', error)
    toastError('コピーに失敗しました')
  }
}
</script>
