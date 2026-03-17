<template>
  <nav
    class="relative flex justify-between items-center gap-8 py-4 px-4 sticky top-0 z-100 h-[60px] transition-colors duration-300"
    :class="isScrolled ? 'bg-[#f9f7f2]' : 'bg-transparent'"
  >
    <NuxtLink
      to="/"
      class="text-sm font-medium hover:opacity-70 transition-opacity flex items-center"
    >
      <img
        src="/img/title-logo.png"
        alt="NasuNestタイトルロゴ"
        class="w-16 md:w-22"
      />
    </NuxtLink>
    <!-- デスクトップメニュー -->
    <div
      class="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2"
    >
      <NuxtLink
        v-for="menu in linkMenus"
        :key="menu.to"
        :to="menu.to"
        class="text-lg hover:opacity-50 transition-opacity text-[#2E5E3E] font-bold"
        style="font-family: 'Kosugi Maru', sans-serif"
      >
        {{ menu.label }}
      </NuxtLink>
    </div>

    <!-- SNS・ログイン/ログアウトボタン（デスクトップ） -->
    <div class="hidden md:flex items-center gap-4">
      <!-- ログイン済み -->
      <template v-if="isAuthenticated">
        <NuxtLink
          to="/mypage"
          class="text-sm hover:opacity-70 transition-opacity text-[#2E5E3E] font-bold"
          style="font-family: 'Kosugi Maru', sans-serif"
        >
          マイページ
        </NuxtLink>
        <UButton
          size="sm"
          variant="soft"
          @click="handleLogout"
          :loading="authLoading"
          style="color: #2e5e3e"
        >
          ログアウト
        </UButton>
      </template>
      <!-- 未ログイン -->
      <template v-else>
        <NuxtLink to="/login">
          <UButton
            size="sm"
            style="background-color: #2e5e3e; color: white"
            class="hover:opacity-80 transition-opacity"
          >
            ログイン
          </UButton>
        </NuxtLink>
      </template>
    </div>

    <!-- モバイルメニュー -->
    <UiMobileMenu />
  </nav>
</template>

<script setup lang="ts">
const { isAuthenticated, logout, loading: authLoading } = useAuth()

const isScrolled = ref(false)

const updateScrollState = () => {
  if (process.client) {
    isScrolled.value = window.scrollY > 0
  }
}

onMounted(() => {
  if (process.client) {
    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
  }
})

onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener('scroll', updateScrollState)
  }
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
