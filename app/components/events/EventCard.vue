<template>
  <div
    class="event-card bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden border-2 border-transparent hover:border-opacity-50 block cursor-pointer"
    :style="{
      borderColor: event.form_id ? '#F4D35E' : 'transparent',
    }"
  >
    <NuxtLink :to="`/events/${event.id}`" class="block">
      <!-- サムネイル画像 -->
      <div
        v-if="event.thumbnail"
        class="relative w-full overflow-hidden relative"
        style="aspect-ratio: 1.618 / 1"
      >
        <img
          :src="event.thumbnail"
          :alt="event.title"
          class="w-full h-full object-cover absolute"
        />

        <div
          v-if="statusText"
          class="absolute w-full h-full bg-black/50 text-white flex items-center justify-center font-bold text-lg"
        >
          {{ statusText }}
        </div>
      </div>

      <!-- サムネイルがない場合 -->
      <div
        v-else
        class="relative w-full overflow-hidden bg-gray-200 flex items-center justify-center"
        style="aspect-ratio: 1.618 / 1"
      >
        <p class="text-gray-400 text-sm">no photo</p>
      </div>

      <!-- カードボディ -->
      <div class="py-3 px-4 space-y-2">
        <!-- カテゴリ -->
        <EventsEventCategories :categories="event.categories" />
        <!-- タイトル -->
        <h2 class="text-md font-bold line-clamp-3" style="color: #2e5e3e">
          {{ event.title }}
        </h2>
        <!-- 日付 -->
        <div class="flex items-center gap-2 text-sm" style="color: #8c5a3c">
          <span>{{ formatDate(event.start_date) }}</span>
          <span v-if="event.end_date && event.end_date !== event.start_date">
            〜 {{ formatDate(event.end_date) }}
          </span>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
export interface Event {
  id: number
  title: string
  form_id: number | null
  start_date: string
  end_date: string | null
  description: string
  location_name: string | null
  location_address: string | null
  location_url: string | null
  thumbnail: string | null
  cta_button_text: string | null
  status: 'published' | 'unpublished' | 'closed' | 'recruitment_closed'
  categories?: Array<{
    id: number
    name: string
  }>
}

interface Props {
  event: Event
}

const props = defineProps<Props>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const isClosed = computed(() => {
  return props.event.status === 'closed'
})

const isRecruitmentClosed = computed(() => {
  return props.event.status === 'recruitment_closed'
})

const statusText = computed(() => {
  if (isClosed.value) {
    return 'イベント終了'
  }
  if (isRecruitmentClosed.value) {
    return '募集終了'
  }
  return ''
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
