<template>
  <VDropdown
    v-if="tooltip"
    :triggers="triggers"
    :placement="placement"
    :distance="distance"
  >
    <UButton
      v-bind="$attrs"
      :disabled="disabled"
      @click="$emit('click', $event)"
    >
      <slot />
    </UButton>
    <template #popper>
      <div
        class="p-2 text-sm text-gray-700 max-w-xs bg-white rounded shadow-lg border border-gray-200"
      >
        <slot name="tooltip">
          {{ tooltip }}
        </slot>
      </div>
    </template>
  </VDropdown>
  <UButton
    v-else
    v-bind="$attrs"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </UButton>
</template>

<script setup lang="ts">
interface Props {
  tooltip?: string
  disabled?: boolean
  triggers?: string[]
  placement?: 'top' | 'bottom' | 'left' | 'right'
  distance?: number
}

withDefaults(defineProps<Props>(), {
  tooltip: undefined,
  disabled: false,
  triggers: () => ['hover', 'focus'],
  placement: 'top',
  distance: 8,
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>
