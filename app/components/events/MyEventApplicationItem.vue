<template>
  <NuxtLink
    :to="`/events/${application.event_id}`"
    class="flex cursor-pointer flex-col items-start gap-2 rounded-xl border border-neutral-200/90 bg-white px-4 py-2 transition-shadow hover:shadow-sm md:flex-row md:items-center md:gap-4"
  >
    <div class="flex-1 min-w-0 w-full md:w-auto">
      <span
        class="block truncate text-sm font-semibold text-neutral-900 md:text-base"
      >
        {{ application.event_title }}
      </span>
    </div>
    <div
      class="flex items-center gap-2 md:gap-3 flex-shrink-0 w-full md:w-auto md:justify-end justify-between"
    >
      <span class="text-xs md:text-sm text-gray-600 whitespace-nowrap">
        {{ formatDate(application.start_date) }}
        <span
          v-if="
            application.end_date &&
            application.end_date !== application.start_date
          "
        >
          〜 {{ formatDate(application.end_date) }}
        </span>
      </span>
      <span
        class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
        :class="getStatusClass(application.status)"
      >
        {{ getStatusText(application.status) }}
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface EventApplication {
  id: number
  event_id: number
  event_title: string
  start_date: string
  end_date: string | null
  status: number
  applied_at: Date
}

const props = defineProps<{
  application: EventApplication
}>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getStatusText = (status: number | null) => {
  switch (status) {
    case 0:
      return '回答待ち'
    case 1:
      return '承認済み'
    case 2:
      return '却下'
    default:
      return '回答待ち'
  }
}

const getStatusClass = (status: number | null) => {
  switch (status) {
    case 0:
      return 'bg-yellow-100 text-yellow-800'
    case 1:
      return 'bg-green-100 text-green-800'
    case 2:
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>
