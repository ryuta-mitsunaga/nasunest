<template>
  <div class="flex items-center justify-center gap-2 md:gap-4">
    <!-- 左側テキスト -->
    <div class="flex flex-col items-center justify-center font-bold">
      <p class="text-xs md:text-lg whitespace-pre-line text-center">{{ leftText }}</p>
      <p class="text-sm md:text-xl underline text-red-700">
        参加申し込み受付中
      </p>
    </div>
    <!-- 右側：日付・時間・場所（タブレット・デスクトップのみ表示） -->
    <div
      v-if="event"
      class="hidden md:flex flex-col items-center justify-center font-bold"
    >
      <p class="text-sm">{{ formatDateTime(event.start_date) }}</p>
      <p v-if="event.end_date && event.start_date !== event.end_date" class="text-sm">
        {{ formatDateTime(event.end_date) }}まで
      </p>
      <p v-if="event.location_name" class="text-sm">
        <span class="mr-1">@</span>{{ event.location_name }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Event {
  id: number
  title: string
  start_date: string
  end_date: string | null
  location_name: string | null
}

interface Props {
  event: Event | null
  leftText: string
}

const props = defineProps<Props>()

const formatDateTime = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const weekday = weekdays[date.getDay()]
  return `${month}/${day}(${weekday})`
}

</script>

