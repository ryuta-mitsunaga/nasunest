<template>
  <div class="relative w-full h-[200px] max-h-[200px] overflow-hidden bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
    <!-- プレビュー用の背景（簡易版） -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="text-gray-400 text-sm">背景プレビュー</div>
    </div>

    <!-- CTAボタンのプレビュー -->
    <div
      class="absolute right-4 bottom-4 rounded-[30px] bg-yellow-400 py-2 px-3 md:py-4 md:px-6 text-white shadow-lg flex items-center justify-center gap-2 md:gap-4"
    >
      <!-- 左側テキスト -->
      <div class="flex flex-col items-center justify-center font-bold">
        <p class="text-xs md:text-sm whitespace-pre-line text-center">{{ leftText || 'イベント名' }}</p>
        <p class="text-xs md:text-sm underline text-red-700">
          参加申し込み受付中
        </p>
      </div>

      <!-- 右側：日付・時間・場所（デスクトップのみ表示） -->
      <div
        v-if="event"
        class="hidden md:flex flex-col items-center justify-center font-bold"
      >
        <p class="text-xs">{{ formatDateTime(event.start_date) }}</p>
        <p v-if="event.end_date && event.start_date !== event.end_date" class="text-xs">
          {{ formatDateTime(event.end_date) }}まで
        </p>
        <p v-if="event.location_name" class="text-xs">
          <span class="mr-1">@</span>{{ event.location_name }}
        </p>
      </div>
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

