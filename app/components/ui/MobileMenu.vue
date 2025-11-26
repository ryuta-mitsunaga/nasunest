<template>
  <div class="md:hidden mobile-menu-container">
    <!-- ハンバーガーボタン -->
    <button
      @click.stop="toggleMenu"
      class="p-2 hover:opacity-70 transition-opacity"
      aria-label="メニュー"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <!-- 全画面オーバーレイ -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-opacity-50 z-40"
        @click.stop="closeMenu"
      ></div>
    </Transition>

    <!-- モバイルメニュー -->
    <Transition name="slide-right">
      <div
        v-if="isOpen"
        class="fixed top-0 right-0 bottom-0 w-80 bg-page-bg shadow-2xl z-50 overflow-y-auto"
      >
        <!-- メニューの上に表示される閉じるボタン -->
        <button
          @click.stop="closeMenu"
          class="absolute top-4 right-2 p-2 hover:opacity-70 transition-opacity z-[60]"
          aria-label="メニューを閉じる"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div class="px-8 py-16 h-full">
          <div class="flex flex-col gap-4 h-full">
            <div
              v-for="(item, index) in menuItems"
              :key="item.to"
              class="flex flex-col gap-1"
            >
              <NuxtLink
                :to="item.to"
                class="text-[#2E5E3E] px-4 py-1 flex items-center justify-between hover:opacity-50 transition-opacity"
                style="font-family: 'Kosugi Maru', sans-serif"
                @click.stop="closeMenu"
              >
                <span>{{ item.label }}</span>
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
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface MenuItem {
  label: string
  to: string
}

const menuItems: MenuItem[] = [
  { label: 'トップ', to: '/' },
  { label: '地域おこし協力隊員一覧', to: '/members' },
  { label: 'イベント', to: '/events' },
]

const { isOpen, toggleMenu, closeMenu } = useMobileMenu()

// メニュー外をクリックしたら閉じる
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const menuElement = document.querySelector('.mobile-menu-container')
  if (menuElement && !menuElement.contains(target)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* フェードインアニメーション（オーバーレイ用） */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 右から左にスライドするアニメーション */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-right-enter-from {
  transform: translateX(100%);
}

.slide-right-enter-to {
  transform: translateX(0);
}

.slide-right-leave-from {
  transform: translateX(0);
}

.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
