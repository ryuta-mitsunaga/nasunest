<template>
  <div class="mobile-menu-container">
    <!-- ハンバーガーボタン -->
    <button
      @click.stop="toggleMenu"
      class="p-2 hover:opacity-70 transition-opacity"
      aria-label="メニュー"
    >
      <svg
        class="h-6 w-6 text-neutral-900"
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
        class="fixed inset-0 z-40 bg-black/40"
        @click.stop="closeMenu"
      ></div>
    </Transition>

    <!-- モバイルメニュー -->
    <Transition name="slide-right">
      <div
        v-if="isOpen"
        class="fixed bottom-0 right-0 top-0 z-50 w-80 overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl"
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
              v-for="item in menuItems"
              :key="item.to"
              class="flex flex-col gap-1"
            >
              <NuxtLink
                :to="item.to"
                class="flex cursor-pointer items-center justify-between rounded-md px-4 py-1 font-medium text-neutral-900 transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
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

            <!-- 認証関連メニュー -->
            <ClientOnly>
              <div class="mt-4 pt-4 border-t border-gray-300">
                <template v-if="isAuthenticated">
                  <NuxtLink
                    to="/mypage"
                    class="flex cursor-pointer items-center justify-between rounded-md px-4 py-2 font-medium text-neutral-900 transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                    @click.stop="closeMenu"
                  >
                    <span>マイページ</span>
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
                  <button
                    @click.stop="handleLogout"
                    :disabled="authLoading"
                    class="flex w-full cursor-pointer items-center justify-between rounded-md px-4 py-2 text-left font-medium text-neutral-900 transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                  >
                    <span>ログアウト</span>
                    <UIcon
                      v-if="authLoading"
                      name="i-heroicons-arrow-path"
                      class="w-5 h-5 animate-spin"
                    />
                  </button>
                </template>
                <template v-else>
                  <NuxtLink
                    to="/login"
                    class="flex cursor-pointer items-center justify-between rounded-md px-4 py-2 font-medium text-neutral-900 transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                    @click.stop="closeMenu"
                  >
                    <span>ログイン</span>
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
                </template>

                <!-- SNSエリア -->
                <div class="mt-4 pt-4 border-t border-gray-300 flex flex-col gap-2">
                  <UiSnsLink
                    type="line"
                    href="https://lin.ee/VLzjPvj"
                    label="LINE公式アカウント"
                    aria-label="LINE公式アカウント"
                    @click="closeMenu"
                  />
                  <UiSnsLink
                    type="instagram"
                    href="https://www.instagram.com/nasunest.info/"
                    label="Instagram"
                    aria-label="NasuNest Instagram"
                    @click="closeMenu"
                  />
                </div>
              </div>
            </ClientOnly>
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
  { label: 'イベント', to: '/events' },
  { label: 'イベントレポート', to: '/eventReports' },
  { label: '那須町地域おこし協力隊', to: '/chikiOkoshiMembers' },
]

const { isOpen, toggleMenu, closeMenu } = useMobileMenu()
const { isAuthenticated, logout, loading: authLoading } = useAuth()

const handleLogout = async () => {
  const result = await logout()
  if (result.success) {
    closeMenu()
    await navigateTo('/')
  }
}

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
