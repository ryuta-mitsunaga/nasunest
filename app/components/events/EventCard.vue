<template>
  <div
    class="event-card bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden border-2 border-transparent hover:border-opacity-50 block cursor-pointer"
    :style="{
      borderColor: event.form_id ? '#F4D35E' : 'transparent',
    }"
  >
    <NuxtLink :to="`/events/${event.id}`" class="block h-full relative">
      <!-- 終了/募集終了のときはカード全体に薄グレーのオーバーレイを被せる -->
      <div
        v-if="isClosedOrRecruitmentClosed"
        class="absolute inset-0 bg-black opacity-20 z-10 pointer-events-none"
      />
      <!-- 参加人数表示（右上） -->
      <div
        v-if="event.participant_count !== undefined && event.participant_count > 0"
        class="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center gap-1 text-sm font-medium z-20"
        style="color: #2e5e3e"
      >
        <UIcon name="i-heroicons-user" class="w-4 h-4" />
        <span>{{ event.participant_count }}名参加</span>
      </div>
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
        <div>
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
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { dayjs } = useDayjs()

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
  participant_count?: number
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
  // UTCとして解釈し、JSTに変換して表示
  const date = dayjs.utc(dateString).tz('Asia/Tokyo')
  if (!date.isValid()) return dateString
  return date.format('YYYY年M月D日 HH:mm')
}

const isClosed = computed(() => {
  return props.event.status === 'closed'
})

const isRecruitmentClosed = computed(() => {
  return props.event.status === 'recruitment_closed'
})

const isClosedOrRecruitmentClosed = computed(() => {
  return isClosed.value || isRecruitmentClosed.value
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
