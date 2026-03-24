<template>
  <div :class="wrapperClass">
    <p
      v-if="eyebrow"
      class="text-[11px] font-semibold tracking-[0.22em] uppercase mb-3"
      :class="eyebrowClass"
    >
      {{ eyebrow }}
    </p>
    <h2
      :id="headingId || undefined"
      class="font-bold tracking-tight mb-3"
      :class="[headingSizeClass, textColorClass]"
    >
      {{ title }}
      <slot v-if="!title" />
    </h2>
    <UiDivider
      :color-class="dividerColorClass"
      :height-class="dividerHeightClass"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  textColorClass?: string
  dividerColorClass?: string
  dividerHeightClass?: string
  /** 英字の小見出し（例: EVENTS） */
  eyebrow?: string
  eyebrowClass?: string
  /** 見出しの大きさ */
  headingSize?: 'md' | 'lg' | 'xl'
  wrapperClass?: string
  /** アクセシビリティ用（aria-labelledby 等） */
  headingId?: string
}

const props = withDefaults(defineProps<Props>(), {
  textColorClass: 'text-white',
  dividerColorClass: 'bg-[#F1C40F]',
  dividerHeightClass: 'h-[6px]',
  eyebrowClass: 'text-neutral-500',
  headingSize: 'md',
  wrapperClass: '',
  headingId: undefined,
})

const headingSizeClass = computed(() => {
  switch (props.headingSize) {
    case 'xl':
      return 'text-3xl sm:text-4xl md:text-5xl'
    case 'lg':
      return 'text-2xl sm:text-3xl md:text-4xl'
    default:
      return 'text-xl md:text-3xl'
  }
})
</script>
