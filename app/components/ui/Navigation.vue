<template>
  <!-- モバイル: viewport 確定後かつ md 未満のときのみ（null の間は出さない → PC 初期のハンバーガー誤表示を防ぐ） -->
  <div
    v-if="isWideScreen === false"
    role="navigation"
    aria-label="メインナビゲーション"
    class="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-end p-4 sm:p-5"
  >
    <div class="pointer-events-auto">
      <UiMobileMenu />
    </div>
  </div>

  <!-- PC: 幅未確定時もデスクトップ DOM（md 未満では hidden）。確定後は isWideScreen に追随 -->
  <header
    v-else-if="isWideScreen === true || isWideScreen === null"
    class="fixed left-0 right-0 top-0 z-[100] border-b border-neutral-200 bg-white/95 shadow-sm backdrop-blur-md transition-[transform,opacity,background-color,box-shadow,border-color] duration-300 ease-out supports-[backdrop-filter]:bg-white/90"
    :class="[
      desktopHeaderVisibilityClass,
      isWideScreen === null && 'hidden md:block',
    ]"
    :inert="isHomePath && !isScrolled"
  >
    <nav
      class="relative mx-auto flex h-[56px] max-w-7xl items-center justify-between gap-3 px-4 text-neutral-900 sm:h-[60px] sm:px-6 lg:px-8"
      aria-label="メインナビゲーション"
    >
      <div
        class="flex min-w-[2.75rem] shrink-0 items-center justify-start sm:min-w-[3.25rem]"
      >
        <NuxtLink
          v-show="showDesktopLogo"
          to="/"
          class="group flex items-center rounded-md outline-none ring-neutral-900/15 focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <img
            src="/img/title-logo.png"
            alt="NasuNest トップへ"
            class="h-9 w-auto opacity-95 transition-opacity duration-200 group-hover:opacity-100 sm:h-10"
          />
        </NuxtLink>
      </div>

      <div
        class="pointer-events-none absolute inset-x-0 flex items-center justify-center"
      >
        <div
          class="pointer-events-auto flex flex-wrap items-center justify-center gap-x-1 gap-y-1 sm:gap-x-2"
        >
          <NuxtLink
            v-for="menu in linkMenus"
            :key="menu.to"
            :to="menu.to"
            class="group relative cursor-pointer whitespace-nowrap px-2.5 py-2 text-sm font-medium tracking-wide text-neutral-600 transition-colors duration-200 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 sm:px-3.5"
            :class="
              isActiveRoute(menu.to) ? 'font-semibold text-neutral-900' : ''
            "
          >
            {{ menu.label }}
            <span
              class="pointer-events-none absolute bottom-0 left-2.5 right-2.5 h-0.5 origin-left scale-x-0 rounded-full bg-neutral-900 transition-transform duration-300 ease-out group-hover:scale-x-100 sm:left-3.5 sm:right-3.5"
              :class="isActiveRoute(menu.to) ? 'scale-x-100' : ''"
              aria-hidden="true"
            />
          </NuxtLink>
        </div>
      </div>

      <!-- <div
        class="flex min-w-[10rem] shrink-0 items-center justify-end gap-2 sm:gap-3"
      >
        <div class="flex items-center gap-2">
          <template v-if="isAuthenticated">
            <NuxtLink
              to="/mypage"
              class="cursor-pointer rounded-full px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors duration-200 hover:bg-neutral-900/[0.06] hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              :class="
                isActiveRoute('/mypage')
                  ? 'bg-neutral-900/[0.08] text-neutral-900'
                  : ''
              "
            >
              マイページ
            </NuxtLink>
            <UButton
              size="sm"
              variant="soft"
              class="cursor-pointer rounded-full"
              :loading="authLoading"
              :style="{ color: '#2f403b' }"
              @click="handleLogout"
            >
              ログアウト
            </UButton>
          </template>

          <UiCtaLink
            v-else
            :label="'ログイン'"
            :show-arrow="false"
            variant="outline"
            size="sm"
            to="/login"
          />
        </div>
      </div> -->
    </nav>
  </header>
</template>

<script setup lang="ts">
const MD_MIN_WIDTH = 768
/** 表示: これより下にスクロールしたらヘッダー表示（上方向は下の値まで戻るまで維持） */
const SCROLL_REVEAL_AFTER = 20
/** 非表示: これより上に戻ったらヘッダーを隠す */
const SCROLL_HIDE_BELOW = 6

const route = useRoute()
const { isAuthenticated, logout, loading: authLoading } = useAuth()

const isScrolled = ref(false)
/**
 * null: SSR / ハイドレーション直前（どちらを出すか未確定。PC でハンバーガーが一瞬出ないようモバイルは出さない）
 * 確定後: matchMedia(min-width:768px)
 */
const isWideScreen = ref<boolean | null>(null)

let mediaQuery: MediaQueryList | null = null

const updateScrollState = () => {
  if (!import.meta.client) return
  const y = window.scrollY
  if (route.path !== '/') {
    isScrolled.value = true
    return
  }
  if (y > SCROLL_REVEAL_AFTER) isScrolled.value = true
  else if (y < SCROLL_HIDE_BELOW) isScrolled.value = false
}

const syncViewport = () => {
  if (!import.meta.client || !mediaQuery) return
  isWideScreen.value = mediaQuery.matches
}

const isHomePath = computed(() => route.path === '/')

/** トップ / 未スクロールのみ非表示。それ以外は常に表示（いずれも fixed でレイアウト外） */
const desktopHeaderVisibilityClass = computed(() => {
  if (isHomePath.value && !isScrolled.value) {
    return 'pointer-events-none -translate-y-full opacity-0'
  }
  return 'translate-y-0 opacity-100'
})

const showDesktopLogo = computed(() => !isHomePath.value || isScrolled.value)

watch(
  () => route.fullPath,
  () => {
    if (import.meta.client) {
      nextTick(() => updateScrollState())
    }
  }
)

function isActiveRoute(path: string) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}

onMounted(() => {
  if (!import.meta.client) return

  updateScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })

  mediaQuery = window.matchMedia(`(min-width: ${MD_MIN_WIDTH}px)`)
  syncViewport()
  mediaQuery.addEventListener('change', syncViewport)
})

onBeforeUnmount(() => {
  if (!import.meta.client) return

  window.removeEventListener('scroll', updateScrollState)
  mediaQuery?.removeEventListener('change', syncViewport)
})

const linkMenus = [
  { label: 'トップ', to: '/' },
  { label: 'イベント', to: '/events' },
  { label: 'イベントレポート', to: '/eventReports' },
  { label: '那須町地域おこし協力隊', to: '/chikiOkoshiMembers' },
]

const handleLogout = async () => {
  const result = await logout()
  if (result.success) {
    await navigateTo('/')
  }
}
</script>

<style scoped></style>
