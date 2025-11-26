<template>
  <nav
    class="relative flex justify-between items-center gap-8 py-4 px-4 sticky top-0 z-100 bg-[#f9f7f2] h-[60px]"
  >
    <NuxtLink
      to="/"
      class="text-sm font-medium hover:opacity-70 transition-opacity flex items-center"
    >
      <img
        src="/img/title-logo.png"
        alt="那須町地域おこし協力隊"
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

    <!-- モバイルメニュー -->
    <UiMobileMenu />
  </nav>
</template>

<script setup lang="ts">
const linkMenus = [
  { label: 'トップ', to: '/' },
  { label: '地域おこし協力隊員', to: '/members' },
  { label: 'イベント', to: '/events' },
]
</script>

<style scoped></style>
