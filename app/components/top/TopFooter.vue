<template>
  <footer
    class="top-footer border-t border-neutral-200 bg-white text-neutral-600"
    aria-label="サイトフッター"
  >
    <div class="mx-auto max-w-6xl px-4 pb-10 pt-14">
      <div
        class="grid grid-cols-1 gap-10 border-b border-neutral-200 pb-10 md:grid-cols-12 md:gap-8"
      >
        <div class="md:col-span-5">
          <p
            class="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500"
          >
            NasuNest
          </p>
          <p class="max-w-sm text-sm leading-relaxed text-neutral-600">
            栃木県那須町の「人がつながるきっかけ」を生み出すコミュニティプラットフォーム。
          </p>
        </div>
        <nav class="md:col-span-4" aria-label="主要ページ">
          <p
            class="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500"
          >
            Navigate
          </p>
          <ul class="flex flex-col gap-3 text-sm font-medium">
            <li>
              <NuxtLink
                to="/events"
                class="cursor-pointer rounded-sm text-neutral-900 transition-colors duration-200 hover:text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              >
                イベント一覧
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/eventReports"
                class="cursor-pointer rounded-sm text-neutral-900 transition-colors duration-200 hover:text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              >
                イベントレポート
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/chikiOkoshiMembers"
                class="cursor-pointer rounded-sm text-neutral-900 transition-colors duration-200 hover:text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              >
                地域おこし協力隊
              </NuxtLink>
            </li>
          </ul>
        </nav>
        <div class="md:col-span-3">
          <p
            class="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500"
          >
            Follow
          </p>
          <div class="flex flex-col gap-3">
            <UiSnsLink
              type="instagram"
              href="https://www.instagram.com/nasunest.info/"
              label="Instagram"
              aria-label="NasuNest Instagram"
            />
            <UiSnsLink
              type="line"
              href="https://lin.ee/VLzjPvj"
              label="LINE公式アカウント"
              aria-label="LINE公式アカウント"
            />
          </div>
        </div>
      </div>
      <p class="pt-8 text-center text-xs text-neutral-500 md:text-left">
        © {{ year }} NasuNest. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>
