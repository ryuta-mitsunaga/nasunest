<template>
  <div v-if="creator?.icon_url" class="flex items-center gap-2">
    <span class="font-medium text-gray-600 text-sm"> 投稿者 </span>
    <img
      :src="creator.icon_url"
      alt="作成者"
      :class="[
        'rounded-full object-cover border',
        imgSizeClass,
        'border-2 border-gray-200',
      ]"
    />
  </div>
</template>

<script setup lang="ts">
interface Creator {
  icon_url: string
}

interface Props {
  creator: Creator | null | undefined
  size?: 'sm' | 'md' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const imgSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-8 h-8'
    case 'md':
      return 'w-12 h-12'
    case 'xl':
      return 'w-16 h-16'
  }
})
</script>
