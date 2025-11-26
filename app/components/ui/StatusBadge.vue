<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      isPublished
        ? 'bg-green-100 text-green-800'
        : 'bg-gray-100 text-gray-800',
    ]"
  >
    {{ isPublished ? '公開' : '非公開' }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  isPublished: boolean
}

defineProps<Props>()
</script>

