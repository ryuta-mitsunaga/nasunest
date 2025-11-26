<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <h3 class="text-lg font-semibold">{{ confirmState.options?.title || '確認' }}</h3>
    </template>

    <template #body>
      <p class="text-gray-700">{{ confirmState.options?.message }}</p>
    </template>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <UButton
          variant="soft"
          @click="handleCancel"
        >
          {{ confirmState.options?.cancelText || 'キャンセル' }}
        </UButton>
        <UButton
          :color="confirmState.options?.type === 'danger' ? 'error' : 'primary'"
          @click="handleConfirm"
        >
          {{ confirmState.options?.confirmText || 'OK' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { confirmState, handleConfirm, handleCancel } = useConfirm()

const isOpen = computed({
  get: () => confirmState.value.isOpen,
  set: (value) => {
    if (!value) {
      handleCancel()
    }
  },
})
</script>

