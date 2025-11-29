<template>
  <div
    v-if="categories && categories.length > 0"
    class="flex flex-wrap gap-1"
  >
    <span
      v-for="category in categories"
      :key="category.id"
      class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
    >
      {{ category.name }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: number
  name: string
}

interface Props {
  categories?: Category[]
}

defineProps<Props>()
</script>

