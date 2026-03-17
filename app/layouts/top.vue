<template>
  <UiNavigation />
  <div class="min-h-screen">
    <slot />
  </div>
  <!-- <div class="fixed bottom-5 right-5 z-40">
    <NesutonCharacterToggle default-visible>
      <p
        class="text-sm md:text-base leading-relaxed"
        style="color: #2e5e3e; font-family: 'Kosugi Maru', sans-serif"
      >
        NasuNestへようこそ！那須町のイベントや地域の情報をお届けします。
      </p>
    </NesutonCharacterToggle>
  </div> -->
  <UiFooter />
</template>

<script setup lang="ts"></script>
