<template>
  <div class="flex items-center gap-2">
    <!-- ラベル部分（slotまたはprops） -->
    <span v-if="!$slots.default" class="text-sm font-medium">
      {{ label }}
    </span>
    <slot v-else />

    <!-- はてなアイコンとTooltip -->
    <ClientOnly v-if="helpText || $slots.help">
      <VDropdown
        :triggers="['hover', 'click']"
        placement="top"
        :distance="8"
        :skidding="0"
      >
        <button
          class="h-full inline-flex items-center justify-center w-4 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          @click.prevent
        >
          <UIcon name="i-heroicons-question-mark-circle" class="w-3.5 h-3.5" />
        </button>

        <template #popper>
          <div class="p-2 text-sm text-gray-700 max-w-xs">
            <slot name="help">
              {{ helpText }}
            </slot>
          </div>
        </template>
      </VDropdown>
      <template #fallback>
        <button
          class="h-full inline-flex items-center justify-center w-4 h-10 rounded-full bg-gray-200 text-gray-600"
          disabled
        >
          <UIcon name="i-heroicons-question-mark-circle" class="w-3.5 h-3.5" />
        </button>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  helpText?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  helpText: '',
})
</script>

<style scoped>
:deep(.v-popper.v-popper--theme-dropdown) {
  display: flex;
}
</style>
