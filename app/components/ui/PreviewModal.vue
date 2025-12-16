<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <h3 class="text-xl font-semibold">{{ title }}</h3>
    </template>

    <template #body>
      <div class="max-h-[70vh] overflow-y-auto">
        <slot />
      </div>
    </template>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <UButton variant="soft" @click="handleCancel">
          {{ cancelText }}
        </UButton>
        <UButton
          :color="confirmColor"
          @click="handleConfirm"
          :loading="loading"
        >
          {{ confirmText }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  open: boolean
  title?: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'primary' | 'error' | 'success' | 'warning'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  title: 'プレビュー',
  confirmText: '反映する',
  cancelText: 'キャンセル',
  confirmColor: 'primary',
  loading: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}
</script>
