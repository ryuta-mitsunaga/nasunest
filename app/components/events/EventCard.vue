<template>
  <div
    class="event-card bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-opacity-50"
    :style="{
      borderColor: event.form_id ? '#F4D35E' : 'transparent',
    }"
  >
    <!-- サムネイル画像 -->
    <div
      v-if="event.thumbnail"
      class="relative w-full overflow-hidden"
      style="aspect-ratio: 1.618 / 1"
    >
      <img
        :src="event.thumbnail"
        :alt="event.title"
        class="w-full h-full object-cover"
      />
      <!-- カードヘッダー（画像の下部にabsolute配置） -->
      <div
        class="absolute bottom-0 left-0 right-0 px-4 py-3"
        style="border-color: #2e5e3e; background: rgba(46, 94, 62, 0.9)"
      >
        <h2
          class="text-md font-bold mb-1 text-white truncate"
          style="text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)"
        >
          {{ event.title }}
        </h2>
        <div class="flex items-center gap-2 text-white/90 text-xs">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{{ formatDate(event.start_date) }}</span>
          <span v-if="event.end_date && event.end_date !== event.start_date">
            〜 {{ formatDate(event.end_date) }}
          </span>
        </div>
      </div>
    </div>

    <!-- サムネイルがない場合 -->
    <div
      v-else
      class="relative w-full overflow-hidden bg-gray-200 flex items-center justify-center"
      style="aspect-ratio: 1.618 / 1"
    >
      <p class="text-gray-400 text-sm">no photo</p>
      <!-- カードヘッダー（画像の下部にabsolute配置） -->
      <div
        class="absolute bottom-0 left-0 right-0 px-4 py-3"
        style="border-color: #2e5e3e; background: rgba(46, 94, 62, 0.9)"
      >
        <h2
          class="text-md font-bold mb-1 text-white truncate"
          style="text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)"
        >
          {{ event.title }}
        </h2>
        <div class="flex items-center gap-2 text-white/90 text-xs">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{{ formatDate(event.start_date) }}</span>
          <span v-if="event.end_date && event.end_date !== event.start_date">
            〜 {{ formatDate(event.end_date) }}
          </span>
        </div>
      </div>
    </div>

    <!-- カードボディ -->
    <div class="p-4 space-y-3">
      <!-- 説明 -->
      <p
        class="text-gray-700 leading-relaxed line-clamp-2 text-sm"
        style="color: #8c5a3c"
      >
        {{ event.description }}
      </p>

      <!-- 場所情報 -->
      <div v-if="event.location_name" class="space-y-1.5">
        <div class="flex items-start gap-2 text-xs" style="color: #2e5e3e">
          <svg
            class="w-4 h-4 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <div>
            <p class="font-semibold">{{ event.location_name }}</p>
            <p v-if="event.location_address" class="text-gray-600 text-xs mt-1">
              {{ event.location_address }}
            </p>
          </div>
        </div>
        <a
          v-if="event.location_url"
          :href="event.location_url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-xs hover:underline"
          style="color: #2e5e3e"
        >
          <span>地図を見る</span>
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      <!-- フォームリンク -->
      <div v-if="event.form_id" class="pt-1">
        <NuxtLink
          :to="`/forms/${event.form_id}`"
          class="inline-flex items-center justify-center w-full px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          style="background-color: #f4d35e; color: #2e5e3e"
        >
          <span>参加申し込み</span>
          <svg
            class="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </NuxtLink>
      </div>
    </div>
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
}

interface Props {
  event: Event
}

defineProps<Props>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-card {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
