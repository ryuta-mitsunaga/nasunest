<template>
  <div class="min-h-screen py-8">
    <div class="container mx-auto max-w-3xl px-4">
      <div class="space-y-6">
        <UCard class="text-center">
          <div class="py-8">
            <UIcon
              name="i-heroicons-check-circle"
              class="mx-auto mb-4 text-6xl text-green-500"
            />
            <h1 class="mb-2 text-2xl font-bold text-gray-900">送信完了</h1>
            <p class="text-gray-600">ご回答ありがとうございました。</p>
          </div>
        </UCard>

        <div
          class="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 shadow-sm"
        >
          <div class="px-6 py-8 text-center sm:px-8 sm:py-10">
            <p
              class="mb-6 text-sm font-semibold tracking-wide text-neutral-900"
            >
              LINE公式アカウントのご案内
            </p>
            <a
              :href="lineOfficialAccountUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="group inline-flex cursor-pointer flex-col items-center gap-3 rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#06C755] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50"
              aria-label="LINE公式アカウント（友だち追加ページを開く）"
            >
              <img
                src="/img/LINE_OACombinationLogo_2line_PrimaryWhite_JP_RGB.png"
                alt="LINE公式アカウント"
                class="h-auto max-h-16 w-auto max-w-full object-contain md:max-h-[4.5rem]"
                loading="lazy"
                decoding="async"
              />
              <span
                class="text-sm font-semibold text-[#06C755] underline decoration-[#06C755]/50 underline-offset-4 transition-colors group-hover:decoration-[#06C755]"
              >
                友だち追加はこちら
              </span>
            </a>
            <p
              class="mx-auto mt-6 max-w-lg text-left text-sm leading-relaxed text-neutral-600 sm:text-center"
            >
              LINE公式アカウントに登録いただくと、最新のイベント情報や、イベント管理者からのご連絡をLINEで受け取ることができます。ぜひ友だち追加をご検討ください。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const lineOfficialAccountUrl =
  (useRuntimeConfig().public.lineOfficialAccountUrl as string) ||
  'https://lin.ee/VLzjPvj'

useHead({
  title: '送信完了',
})
</script>
