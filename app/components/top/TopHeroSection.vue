<template>
  <section class="relative w-full h-screen max-h-[600px] overflow-hidden">
    <!-- 背景のフォトスタック -->
    <div
      class="absolute inset-0 flex items-center justify-center h-full pointer-events-none"
    >
      <TopPhotoStack :events="events" />
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
        v-if="!isMobileMenuOpen"
        to="/forms/14"
        class="fixed right-4 top-14 md:right-12 md:top-auto md:bottom-8 rounded-[30px] bg-yellow-400 py-2 px-3 md:py-4 md:px-6 text-white shadow-lg flex items-center justify-center gap-2 md:gap-4 z-110"
      >
        <div class="flex flex-col items-center justify-center font-bold">
          <p class="text-xs md:text-lg">令和7年度 活動報告会</p>
          <p class="text-sm md:text-xl underline text-red-700">
            参加申し込み受付中
          </p>
        </div>
        <!-- 日付（タブレット・デスクトップのみ表示） -->
        <div
          class="hidden md:flex flex-col items-center justify-center font-bold"
        >
          <p class="text-sm">11/18(月)</p>
          <p class="text-sm">10:00 - 12:00</p>
          <p><span class="mr-1">@</span>ゆめプラザ</p>
        </div>
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
</style>
