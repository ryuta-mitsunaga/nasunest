<template>
  <div v-if="selectedCount > 0" class="flex items-center justify-end">
    <UiUButtonWithTooltip
      color="primary"
      variant="soft"
      :tooltip="disabledMessage"
      :disabled="!!disabledMessage"
      @click="openEmailModal"
    >
      メール送信
    </UiUButtonWithTooltip>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedCount: number
  disabledMessage?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'open-email-modal': []
}>()

const openEmailModal = () => {
  emit('open-email-modal')
}
</script>
