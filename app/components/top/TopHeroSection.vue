<template>
  <!-- ナビ高さ60pxを除いた1画面分。ロゴは中央、キャッチ＋新着ストリップ＋Scrollは最下部 -->
  <section
    class="hero-chic relative flex min-h-[calc(100dvh-60px)] w-full flex-col bg-white"
    aria-label="NasuNest"
  >
    <div
      class="flex min-h-0 flex-1 w-full flex-col items-center justify-center px-6 py-6 text-center"
    >
      <h1 class="sr-only">NasuNest — 那須町のコミュニティプラットフォーム</h1>
      <div class="flex flex-col items-center">
        <img
          src="/img/title-logo.png"
          alt=""
          class="logo-image w-[min(78vw,360px)] md:w-[min(48vw,440px)] h-auto"
          decoding="async"
          fetchpriority="high"
        />
      </div>
    </div>

    <div class="mt-auto flex w-full shrink-0 flex-col">
      <p
        class="hero-tagline mx-auto max-w-[min(92vw,36rem)] px-4 pb-2 pt-1 text-center text-neutral-700 md:pb-3 md:pt-2"
      >
        那須の楽しみ、見つけて参加して
      </p>
      <div class="w-full max-w-[100vw] sm:mx-auto sm:max-w-none">
        <TopHeroNewsStrip :items="newsItems" :loading="newsLoading" />
      </div>
      <div
        class="flex justify-center px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1"
      >
        <button
          type="button"
          class="relative z-30 flex cursor-pointer flex-col items-center gap-2 rounded-full px-4 py-2 text-neutral-600 transition-colors duration-200 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          aria-label="イベント一覧セクションへスクロール"
          @click="scrollToEvents"
        >
          <span class="text-[10px] font-semibold tracking-[0.35em] uppercase">
            Scroll
          </span>
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </div>
    </div>

    <NuxtLink
      v-if="!isMobileMenuOpen && activePickupEvent"
      :to="pickupEventLink"
      class="fixed right-4 top-16 z-[120] flex max-w-[calc(100vw-2rem)] cursor-pointer items-center justify-center rounded-2xl border-2 border-neutral-900 bg-neutral-900 py-3 px-4 text-white shadow-xl transition-[transform,box-shadow,background-color] duration-200 hover:bg-neutral-800 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 md:right-8 md:top-auto md:bottom-52 md:max-w-none md:px-7 md:py-4"
    >
      <TopPickupEventButton
        :event="activePickupEvent.event"
        :left-text="activePickupEvent.left_text"
      />
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
import type { HeroNewsItem } from '~/components/top/TopHeroNewsStripCard.vue'

withDefaults(
  defineProps<{
    newsItems: HeroNewsItem[]
    newsLoading?: boolean
  }>(),
  {
    newsItems: () => [],
    newsLoading: false,
  }
)

const { isOpen: isMobileMenuOpen } = useMobileMenu()

const { data: pickupData } = await useFetch<{
  success: boolean
  data: {
    id: number
    event_id: number
    left_text: string
    pickup_datetime_start: string
    pickup_datetime_end: string
    event: {
      id: number
      title: string
      start_date: string
      end_date: string | null
      location_name: string | null
      form_id: number | null
      cta_button_text: string | null
    }
  } | null
}>('/api/public/pickup-events/active')

const activePickupEvent = computed(() => pickupData.value?.data || null)

const pickupEventLink = computed(() => {
  if (!activePickupEvent.value?.event.id) return '#'
  return `/events/${activePickupEvent.value.event.id}`
})

const scrollToEvents = () => {
  if (!process.client) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById('events-start')?.scrollIntoView({
    behavior: reduce ? 'auto' : 'smooth',
    block: 'start',
  })
}
</script>

<style scoped>
/* ロゴの手描き・丸ゴシックに近いトーン（Zen Maru Gothic） */
.logo-image {
  filter: drop-shadow(0 8px 28px rgba(0, 0, 0, 0.12));
}

.hero-tagline {
  font-family:
    'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', 'Hiragino Sans',
    'Yu Gothic UI', system-ui, sans-serif;
  font-weight: 500;
  font-size: clamp(0.8125rem, 3.2vw, 0.9375rem);
  line-height: 1.65;
  letter-spacing: 0.06em;
}

@media (min-width: 768px) {
  .hero-tagline {
    font-size: clamp(0.875rem, 1.35vw, 1rem);
    letter-spacing: 0.07em;
  }
}
</style>
