<template>
  <UCard
    class="hover:shadow-lg transition-shadow cursor-pointer"
    @click="handleClick"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <UIcon :name="icon" :class="iconClass" />
        <h2 class="text-xl font-semibold">{{ title }}</h2>
      </div>
    </template>
    <div class="p-4 min-h-[120px]">
      <p class="text-gray-600">{{ description }}</p>
    </div>
    <template #footer>
      <div class="flex justify-end">
        <UButton color="primary" variant="soft">
          管理画面へ
          <UIcon name="i-heroicons-arrow-right" class="ml-2" />
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  icon: string
  iconColor?: string
  to: string
  permission?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'blue',
  permission: null,
})

const iconClass = computed(() => {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  }
  return `text-2xl ${colorMap[props.iconColor] || colorMap.blue}`
})

const handleClick = () => {
  navigateTo(props.to)
}
</script>
