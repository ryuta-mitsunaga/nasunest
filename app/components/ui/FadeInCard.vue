<template>
  <div
    class="fade-in-up"
    :style="{
      animationDelay: `${delay}ms`,
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  delay?: number
}

withDefaults(defineProps<Props>(), {
  delay: 0,
})
</script>

