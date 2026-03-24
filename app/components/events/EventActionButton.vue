<template>
  <button
    type="button"
    class="inline-flex w-full items-center justify-center rounded-lg bg-[#f4d35e] px-6 py-3 text-base font-medium text-neutral-900 shadow-sm transition-all duration-200 hover:shadow-md"
    @click="emit('click')"
  >
    <span>{{ label }}</span>
    <svg
      v-if="showArrow"
      class="w-5 h-5 ml-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 5l7 7-7 7"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    buttonText?: string | null
    showArrow?: boolean
  }>(),
  { buttonText: null, showArrow: true }
)

const label = computed(() => props.buttonText ?? '参加申し込み')

const emit = defineEmits<{
  click: []
}>()
</script>
