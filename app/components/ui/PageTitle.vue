<template>
  <div class="mb-12 text-center">
    <h1 class="text-2xl md:text-3xl font-bold mb-4" style="color: #8c5a3c">
      {{ title }}
    </h1>
    <div
      class="w-24 h-1 mx-auto rounded-full"
      style="background-color: #2e5e3e"
    ></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>
