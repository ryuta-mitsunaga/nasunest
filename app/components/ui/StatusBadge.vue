<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      statusClass,
    ]"
  >
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  status: 'published' | 'unpublished' | 'closed' | 'recruitment_closed'
}

const props = defineProps<Props>()

const statusText = computed(() => {
  switch (props.status) {
    case 'published':
      return '公開'
    case 'unpublished':
      return '非公開'
    case 'closed':
      return '募集終了'
    case 'recruitment_closed':
      return 'イベント終了'
    default:
      return '不明'
  }
})

const statusClass = computed(() => {
  switch (props.status) {
    case 'published':
      return 'bg-green-100 text-green-800'
    case 'unpublished':
      return 'bg-gray-100 text-gray-800'
    case 'closed':
      return 'bg-red-100 text-red-800'
    case 'recruitment_closed':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})
</script>
