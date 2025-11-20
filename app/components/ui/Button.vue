<template>
  <NuxtLink
    :to="href"
    :class="[
      'inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200',
      variant === 'primary' 
        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg' 
        : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50',
      size === 'sm' ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'
    ]"
  >
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ButtonVariant, ButtonSize } from '~/types'

interface Props {
  href: string
  variant?: ButtonVariant
  size?: ButtonSize
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
})
</script>

