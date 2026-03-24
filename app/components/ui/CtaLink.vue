<template>
  <NuxtLink
    :to="to"
    class="group/cta-link cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-neutral-900 text-sm font-semibold transition-colors duration-300 ease-out"
    :class="[CTA_LINK_FOCUS_VISIBLE, rootClass]"
  >
    <span>{{ label }}</span>
    <svg
      v-if="showArrow"
      class="h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover/cta-link:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 5l7 7-7 7"
      />
    </svg>
  </NuxtLink>
</template>

<script setup lang="ts">
/**
 * 白背景向け CTA: 近黒のボーダー・テキスト（outline / solid）
 */
const CTA_LINK_FOCUS_VISIBLE =
  'outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900'

const props = withDefaults(
  defineProps<{
    to: string
    label: string
    variant: 'outline' | 'solid'
    showArrow?: boolean
  }>(),
  { showArrow: true }
)

const rootClass = computed(() => {
  if (props.variant === 'outline') {
    return [
      'hidden shrink-0 self-start px-6 py-3.5 md:inline-flex',
      'bg-transparent text-neutral-900',
      'hover:bg-neutral-950 hover:text-white',
    ].join(' ')
  }
  return [
    'inline-flex w-full max-w-xs shrink-0 px-6 py-3.5',
    'bg-neutral-900 text-white',
    'hover:bg-neutral-800',
  ].join(' ')
})
</script>
