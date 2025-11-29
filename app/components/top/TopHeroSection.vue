<template>
  <section class="relative w-full h-screen max-h-[600px] overflow-hidden">
    <!-- タイトルテキスト (画像表示前) -->
    <Transition name="fade-out">
      <div
        v-if="!imagesLoaded"
        class="absolute inset-0 flex items-center justify-center h-full pointer-events-none z-20"
      >
        <h1 class="title-text-image text-center px-4">
          <span class="text-[#2e5e3e]">小さなご縁が、</span>
          <br />
          <span class="text-[#2e5e3e]">ここから広がる。</span>
        </h1>
      </div>
    </Transition>

    <!-- 背景のフォトスタック -->
    <div
      class="absolute inset-0 flex items-center justify-center h-full pointer-events-none"
    >
      <TopPhotoStack :events="events" @images-loaded="handleImagesLoaded" />
    </div>

    <!-- ロゴ -->
    <div class="absolute bottom-3 right-3 md:bottom-10 md:right-10 z-10">
      <img
        src="/img/title-logo.png"
        alt="那須町地域おこし協力隊"
        class="logo-image md:w-[140px] w-[100px]"
      />
    </div>

    <Transition name="fade">
      <NuxtLink
        v-if="!isMobileMenuOpen && activePickupEvent"
        :to="pickupEventLink"
        class="fixed right-4 top-14 md:right-12 md:top-auto md:bottom-8 rounded-[30px] bg-yellow-400 py-2 px-3 md:py-4 md:px-6 text-white shadow-lg flex items-center justify-center gap-2 md:gap-4 z-110"
      >
        <TopPickupEventButton
          :event="activePickupEvent.event"
          :left-text="activePickupEvent.left_text"
        />
      </NuxtLink>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import type { Event } from '~/components/events/EventCard.vue'

interface Props {
  events?: Event[]
}

const props = withDefaults(defineProps<Props>(), {
  events: () => [],
})

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

const imagesLoaded = ref(false)

const handleImagesLoaded = () => {
  imagesLoaded.value = true
}
</script>

<style scoped>
.logo-image {
  height: auto;
  filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.25));
}

/* CTAボタンのフェードアニメーション */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* タイトルテキストのフェードイン・スケールアニメーション */
.title-text-image {
  font-size: clamp(2rem, 8vw, 4rem);
  font-weight: 600;
  line-height: 1.4;
  animation: titleTextFadeIn 3s ease-out forwards;
  letter-spacing: 0.1em;
  font-style: normal;
  display: inline-block;
}

@keyframes titleTextFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* title-text.pngのフェードアウトアニメーション */
.fade-out-enter-active,
.fade-out-leave-active {
  transition: opacity 0.8s ease-out;
}

.fade-out-enter-from,
.fade-out-leave-to {
  opacity: 0;
}
</style>
