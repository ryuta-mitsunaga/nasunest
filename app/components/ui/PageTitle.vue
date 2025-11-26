<template>
  <div class="mb-12 text-left">
    <h1 class="text-xl md:text-3xl font-bold mb-2" style="color: #2E5E3E">
      {{ title }}
    </h1>
    <UiDivider />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>
