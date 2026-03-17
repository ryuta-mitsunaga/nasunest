<template>
  <div class="flex items-start gap-4">
    <!-- 吹き出し（左側・キャラクターが左を向いているため） -->
    <div class="nesuton-speech-bubble flex-1 min-w-0">
      <div class="p-4 md:p-5">
        <slot />
      </div>
    </div>

    <!-- キャラクター画像と名前 -->
    <div class="flex-shrink-0 flex flex-col items-center gap-1">
      <img
        src="/img/nesuton.png"
        alt="ねすとん"
        class="w-24 md:w-32 h-auto object-contain"
      />
      <span
        class="text-sm font-bold"
        style="font-family: 'Kosugi Maru', sans-serif; color: #2e5e3e"
      >
        ねすとん
      </span>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.nesuton-speech-bubble {
  position: relative;
  background-color: var(--color-page-bg);
  border: 2px solid #2e5e3e;
  border-radius: 16px;
}
</style>
