<template>
  <div
    class="event-report-card bg-white rounded-sm shadow-md hover:shadow-xl overflow-hidden border-2 border-transparent hover:border-opacity-50 block cursor-pointer"
  >
    <NuxtLink :to="`/eventReports/${eventReport.id}`" class="block">
      <div class="flex gap-4 p-4">
        <!-- 左側: テキスト情報 -->
        <div class="flex-1 flex flex-col justify-between min-w-0">
          <!-- 作成日時 -->
          <div class="text-xs text-gray-500 mb-2">
            {{ formatDateTime(eventReport.createdAt) }}
          </div>
          <!-- タイトル -->
          <h2 class="text-md font-bold line-clamp-3" style="color: #2e5e3e">
            {{ eventReport.title }}
          </h2>
        </div>

        <!-- 右側: サムネイル -->
        <div
          v-if="eventReport.thumbnail"
          class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden"
        >
          <img
            :src="eventReport.thumbnail"
            :alt="eventReport.title"
            class="w-full h-full object-cover"
          />
        </div>
        <div
          v-else
          class="flex-shrink-0 w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center"
        >
          <p class="text-gray-400 text-xs">no photo</p>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
export interface EventReport {
  id: number
  event_id: number
  admin_id: number
  title: string
  thumbnail: string | null
  body: string | null
  createdAt: string
  event?: {
    id: number
    title: string
    start_date: string
  } | null
}

interface Props {
  eventReport: EventReport
}

const props = defineProps<Props>()

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
