<template>
  <section
    id="events-start"
    class="scroll-mt-[4.75rem] bg-white py-20 text-neutral-900 md:py-28"
    aria-labelledby="events-heading"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div
        class="flex flex-col gap-8 md:flex-row md:items-end md:justify-between mb-12 md:mb-14"
      >
        <div class="max-w-2xl">
          <UiSectionTitle
            heading-id="events-heading"
            title="那須町の最新イベント"
            eyebrow="Events"
            eyebrow-class="text-neutral-500"
            text-color-class="text-neutral-900"
            divider-color-class="bg-neutral-800"
            divider-height-class="h-1"
            heading-size="xl"
          />
          <p
            class="mt-5 text-sm md:text-base text-neutral-600 max-w-lg leading-relaxed"
          >
            直近の募集・開催情報をピックアップ。気になるものから参加してみてください。
          </p>
        </div>
        <UiCtaLink
          v-if="events.length > 0"
          to="/events"
          variant="outline"
          label="すべて見る"
        />
      </div>

      <!-- スケルトン -->
      <div
        v-if="loading"
        class="grid grid-cols-1 lg:grid-cols-3 gap-6"
        aria-busy="true"
        aria-label="読み込み中"
      >
        <div
          v-for="n in 3"
          :key="n"
          class="rounded-xl border border-neutral-200 bg-white overflow-hidden animate-pulse"
        >
          <div class="aspect-[1.618/1] bg-neutral-200" />
          <div class="p-5 space-y-3">
            <div class="h-3 bg-neutral-200 rounded w-1/3" />
            <div class="h-4 bg-neutral-200 rounded w-full" />
            <div class="h-4 bg-neutral-200 rounded w-4/5" />
          </div>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-16">
        <p class="text-red-600 text-sm md:text-base">{{ error }}</p>
      </div>

      <div v-else-if="events.length > 0">
        <div class="hidden lg:grid lg:grid-cols-3 gap-8">
          <EventsEventCard
            v-for="event in events"
            :key="event.id"
            :event="event"
          />
        </div>

        <div
          ref="scrollContainer"
          class="lg:hidden overflow-x-hidden relative"
          @mouseenter="pauseScroll"
          @mouseleave="resumeScroll"
        >
          <div
            ref="scrollContent"
            class="flex gap-5 transition-transform duration-500 ease-out"
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

      <div v-else class="text-center py-16">
        <p class="text-neutral-500">イベントはありません</p>
      </div>

      <div
        v-if="events.length > 0"
        class="mt-10 flex flex-col items-center gap-6 md:hidden"
      >
        <UiCtaLink
          to="/events"
          variant="solid"
          label="すべてのイベントを見る"
        />
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
let scrollInterval: ReturnType<typeof setInterval> | null = null

const getCardWidth = () => {
  if (!scrollContent.value) return 0
  const firstCard = scrollContent.value.children[0] as HTMLElement
  if (!firstCard) return 0
  return firstCard.offsetWidth + 20 // gap-5
}

const scrollToNext = () => {
  if (props.events.length === 0 || !scrollContent.value) return
  const cardWidth = getCardWidth()
  currentIndex.value = (currentIndex.value + 1) % props.events.length
  scrollPosition.value = cardWidth * currentIndex.value
}

const startAutoScroll = () => {
  if (scrollInterval) clearInterval(scrollInterval)
  scrollInterval = setInterval(() => {
    if (!isPaused.value) scrollToNext()
  }, 3500)
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
      const isLgBelow = width < 1024
      isMobile.value = width < 768

      if (isLgBelow && props.events.length > 0 && scrollContent.value) {
        scrollPosition.value = 0
        currentIndex.value = 0
        nextTick(() => {
          setTimeout(() => startAutoScroll(), 500)
        })
      } else {
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
      if (scrollInterval) clearInterval(scrollInterval)
    })
  }
})

onUnmounted(() => {
  if (scrollInterval) clearInterval(scrollInterval)
})
</script>
