<template>
  <div class="mb-10 text-left sm:mb-12">
    <h1
      class="mb-3 text-2xl font-bold tracking-tight text-neutral-900 md:text-4xl"
    >
      {{ title }}
    </h1>
    <UiDivider color-class="bg-neutral-800" height-class="h-1" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>
