<template>
  <section class="bg-[#2E5E3E] text-white py-12">
    <div class="container mx-auto px-4">
      <UiSectionTitle title="那須町の最新イベント" />

      <div v-if="loading" class="text-center py-12">
        <p>読み込み中...</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-300">{{ error }}</p>
      </div>

      <!-- md以下: 横スクロール、lg以上: グリッド3列 -->
      <div v-else-if="events.length > 0" class="mt-8">
        <!-- lg以上: グリッドレイアウト -->
        <div class="hidden lg:grid lg:grid-cols-3 gap-6">
          <EventsEventCard
            v-for="event in events"
            :key="event.id"
            :event="event"
          />
        </div>

        <!-- md以下: 自動スクロールカルーセル -->
        <div
          ref="scrollContainer"
          class="lg:hidden overflow-x-hidden relative"
          @mouseenter="pauseScroll"
          @mouseleave="resumeScroll"
        >
          <div
            ref="scrollContent"
            class="flex gap-6 transition-transform duration-500 ease-in-out"
            :style="{ transform: `translateX(-${scrollPosition}px)` }"
          >
            <div
              v-for="event in events"
              :key="`carousel-${event.id}`"
              class="flex-shrink-0"
              :style="{
                width: isMobile
                  ? 'calc(100vw - 2rem)'
                  : 'calc((100vw - 4rem) / 1.5)',
                maxWidth: isMobile ? '100%' : '400px',
              }"
            >
              <EventsEventCard :event="event" />
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p>イベントはありません</p>
      </div>

      <div v-if="events.length > 0" class="mt-4 text-center">
        <NuxtLink
          to="/events"
          class="inline-flex items-center gap-2 text-base md:text-lg font-semibold hover:opacity-70 transition-opacity underline"
        >
          すべてのイベントを見る
          <svg
            class="w-5 h-5"
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
  </section>
</template>

<script setup lang="ts">
import type { Event } from '~/components/events/EventCard.vue'

interface Props {
  events: Event[]
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: '',
})

const scrollContainer = ref<HTMLElement | null>(null)
const scrollContent = ref<HTMLElement | null>(null)
const scrollPosition = ref(0)
const currentIndex = ref(0)
const isPaused = ref(false)
const isMobile = ref(false)
let scrollInterval: NodeJS.Timeout | null = null

const getCardWidth = () => {
  if (!scrollContent.value) return 0
  const firstCard = scrollContent.value.children[0] as HTMLElement
  if (!firstCard) return 0
  return firstCard.offsetWidth + 24 // gap-6 = 24px
}

const scrollToNext = () => {
  if (props.events.length === 0 || !scrollContent.value) return

  const cardWidth = getCardWidth()
  currentIndex.value = (currentIndex.value + 1) % props.events.length
  scrollPosition.value = cardWidth * currentIndex.value
}

const startAutoScroll = () => {
  if (scrollInterval) {
    clearInterval(scrollInterval)
  }

  // 3秒ごとにスクロール
  scrollInterval = setInterval(() => {
    if (!isPaused.value) {
      scrollToNext()
    }
  }, 3000)
}

const pauseScroll = () => {
  isPaused.value = true
}

const resumeScroll = () => {
  isPaused.value = false
}

onMounted(() => {
  if (process.client) {
    const checkSize = () => {
      const width = window.innerWidth
      const isLgBelow = width < 1024 // lg未満
      isMobile.value = width < 768 // モバイルサイズ

      if (isLgBelow && props.events.length > 0 && scrollContent.value) {
        scrollPosition.value = 0
        currentIndex.value = 0
        // レイアウト確定後に開始
        nextTick(() => {
          setTimeout(() => {
            startAutoScroll()
          }, 500)
        })
      } else {
        // lg以上の場合やイベントがない場合は停止
        if (scrollInterval) {
          clearInterval(scrollInterval)
          scrollInterval = null
        }
        scrollPosition.value = 0
        currentIndex.value = 0
      }
    }

    checkSize()
    window.addEventListener('resize', checkSize)

    onUnmounted(() => {
      window.removeEventListener('resize', checkSize)
      if (scrollInterval) {
        clearInterval(scrollInterval)
      }
    })
  }
})

onUnmounted(() => {
  if (scrollInterval) {
    clearInterval(scrollInterval)
  }
})
</script>
