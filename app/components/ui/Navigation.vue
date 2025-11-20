<template>
  <nav
    class="absolute top-8 left-0 right-0 flex justify-center items-center gap-8 z-10"
  >
    <NuxtLink
      to="/members"
      class="text-white text-lg underline hover:opacity-80 transition-opacity"
    >
      メンバー
    </NuxtLink>
    <NuxtLink
      to="/events"
      class="text-white text-lg underline hover:opacity-80 transition-opacity"
    >
      イベント
    </NuxtLink>
    <NuxtLink
      to="/presentations"
      class="text-white text-lg underline hover:opacity-80 transition-opacity"
    >
      報告会
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts"></script>
