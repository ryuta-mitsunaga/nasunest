<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ファーストビュー -->
    <section class="relative w-full h-screen bg-gray-200 overflow-hidden">
      <!-- 背景画像エリア -->

      <!-- 縦書きテキスト（画像） -->
      <div class="absolute inset-0 flex items-center justify-center h-full">
        <div class="vertical-calligraphy-image">
          <img
            src="/img/title-logo.png"
            alt="那須町地域おこし協力隊"
            class="calligraphy-image"
          />
        </div>
      </div>

      <!-- ナビゲーション -->
      <UiNavigation />

      <NuxtLink
        to="/forms/14"
        class="fixed right-4 bottom-4 md:right-12 md:bottom-8 rounded-[30px] bg-yellow-400 py-4 px-6 text-white shadow-lg flex items-center justify-center gap-4 z-10"
      >
        <div class="flex flex-col items-center justify-center font-bold">
          <p class="text-lg">令和7年度 活動報告会</p>
          <p class="text-xl underline text-red-700">参加申し込み受付中</p>
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
    </section>
  </div>
</template>

<script setup lang="ts">
import type { AvatarSize, MembersResponse } from '~/types'

const { data } = await useFetch<MembersResponse>('/api/members')

// 縦書きテキスト（画像に変更）

// アバターサイズをインデックスに応じて決定（ランダムに変化）
const getAvatarSize = (index: number): AvatarSize => {
  // ランダムな配置で視覚的な興味を引く
  const sizes: AvatarSize[] = [
    'sm',
    'md',
    'lg',
    'md',
    'sm',
    'md',
    'lg',
    'md',
    'sm',
    'md',
    'lg',
    'sm',
  ]
  return sizes[index % sizes.length] || 'md'
}

// const getMemberCellClass = (index: number) => {
//   return {
//     textColor: index % 2 === 0 ? 'text-[#F9F7F2]' : 'text-[#2E5E3E]',
//     backgroundColor: index % 2 === 0 ? 'bg-[#2E5E3E]' : 'bg-[#fff]'
//   }
// }
</script>

<style scoped>
.vertical-calligraphy-image {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 100%;
  width: 100%;
}

.calligraphy-image {
  max-width: 100%;
  max-height: 80vh;
  height: auto;
  width: auto;
  object-fit: contain;
  opacity: 0;
  transform: translateY(-50px) scale(0.9);
  animation: imageReveal 2s ease-out forwards;
  filter: drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.15));
}

@keyframes imageReveal {
  0% {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes brushStrokeImage {
  0% {
    clip-path: inset(0 0 100% 0);
    opacity: 0.8;
  }
  100% {
    clip-path: inset(0 0 0% 0);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .calligraphy-image {
    max-height: 70vh;
  }
}
</style>
