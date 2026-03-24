<template>
  <div
    class="event-report-card block cursor-pointer overflow-hidden rounded-xl border-2 border-neutral-200 bg-white shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-neutral-400 hover:shadow-md"
  >
    <NuxtLink
      :to="`/eventReports/${eventReport.id}`"
      class="group block rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
    >
      <div class="flex flex-col sm:flex-row sm:items-stretch">
        <!-- モバイル: サムネイル全面 + 下部グラデーション内に日付・タイトル -->
        <div
          class="relative isolate aspect-[5/3] max-h-[min(52vw,260px)] w-full overflow-hidden bg-neutral-100 sm:hidden"
        >
          <img
            v-if="eventReport.thumbnail"
            :src="eventReport.thumbnail"
            :alt="''"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
          <div
            v-else
            class="absolute inset-0 flex items-center justify-center text-xs text-neutral-400"
          >
            no photo
          </div>
          <div
            class="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/85 via-black/55 to-transparent"
            aria-hidden="true"
          />
          <div class="absolute inset-x-0 bottom-0 px-4 pb-4 pt-10">
            <time
              class="block text-[11px] font-semibold uppercase tabular-nums tracking-wider text-white/85 drop-shadow-sm"
              :datetime="eventReport.createdAt"
            >
              {{ formatDateTime(eventReport.createdAt) }}
            </time>
            <h2
              class="mt-1.5 line-clamp-2 text-base font-bold leading-snug text-white drop-shadow-md"
            >
              {{ eventReport.title }}
            </h2>
          </div>
        </div>

        <!-- モバイル: CTA 行 -->
        <div
          class="flex items-center justify-between gap-3 border-t border-neutral-100 px-5 py-3.5 sm:hidden"
        >
          <span
            class="text-xs font-semibold text-neutral-500 transition-colors duration-200 group-hover:text-neutral-900"
          >
            レポートを読む
          </span>
          <svg
            class="h-5 w-5 shrink-0 text-neutral-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-neutral-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>

        <!-- デスクトップ: テキスト列 -->
        <div
          class="hidden min-w-0 flex-1 flex-col justify-between p-5 sm:flex sm:p-6"
        >
          <div>
            <time
              class="text-[11px] font-semibold uppercase tabular-nums tracking-wider text-gray-500"
              :datetime="eventReport.createdAt"
            >
              {{ formatDateTime(eventReport.createdAt) }}
            </time>
            <h2
              class="mt-2 line-clamp-3 text-base font-bold leading-snug md:text-lg"
              :style="{ color: titleColor }"
            >
              {{ eventReport.title }}
            </h2>
          </div>
          <div
            class="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3"
          >
            <span
              class="text-xs font-semibold text-neutral-500 transition-colors duration-200 group-hover:text-neutral-900"
            >
              レポートを読む
            </span>
            <svg
              class="h-5 w-5 shrink-0 text-neutral-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-neutral-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>

        <!-- デスクトップ: サムネイル -->
        <div
          v-if="eventReport.thumbnail"
          class="hidden min-h-[140px] w-full flex-shrink-0 overflow-hidden border-l border-neutral-200 bg-neutral-100 sm:flex sm:w-36"
        >
          <img
            :src="eventReport.thumbnail"
            :alt="''"
            class="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
          />
        </div>
        <div
          v-else
          class="hidden min-h-[140px] w-full flex-shrink-0 items-center justify-center border-l border-neutral-200 bg-neutral-100 text-xs text-neutral-400 sm:flex sm:w-36"
        >
          no photo
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
  body_html?: string | null
  createdAt: string
  event?: {
    id: number
    title: string
    start_date: string
  } | null
}

defineProps<{
  eventReport: EventReport
}>()

const titleColor = '#171717'

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
