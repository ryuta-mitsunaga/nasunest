<template>
  <NuxtLink :to="to" class="group block">
    <div
      class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 via-white to-primary-50/50 border border-primary-100 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300"
    >
      <div
        class="absolute inset-0 bg-gradient-to-r from-primary-50/40 via-transparent to-transparent"
      />
      <div class="relative flex items-center gap-5 px-6 py-5">
        <div class="min-w-0 flex-1">
          <p
            class="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors"
          >
            {{ label }}
          </p>
          <p class="mt-0.5 text-sm text-gray-500">
            {{ cardText }}
          </p>
        </div>
        <div
          class="shrink-0 rounded-full bg-primary-100 p-2 text-primary-600 group-hover:bg-primary-200 transition-colors"
        >
          <UIcon name="i-heroicons-arrow-right" class="h-5 w-5" />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  label: string
  cardText: string
  to: string
}

defineProps<Props>()
</script>
