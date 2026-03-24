<template>
  <section
    id="about-start"
    class="relative scroll-mt-[4.75rem] bg-white py-20 md:py-28"
    aria-labelledby="about-heading"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <header class="max-w-3xl mb-14 md:mb-20">
        <p
          class="text-[11px] font-semibold tracking-[0.22em] text-neutral-500 uppercase mb-4"
        >
          About
        </p>
        <h2
          id="about-heading"
          class="text-3xl font-bold leading-[1.15] tracking-tight text-neutral-900 sm:text-4xl md:text-5xl"
        >
          NasuNestとは
        </h2>
        <div class="mt-5 h-1 w-14 rounded-full bg-neutral-800" />
        <p
          class="mt-8 text-lg md:text-xl font-medium text-neutral-800 leading-relaxed"
        >
          地域に広がり、重なり合う小さなつながり
        </p>
      </header>

      <!-- 3つの価値（若年層向けスキャンしやすいブロック） -->
      <ul
        class="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20"
      >
        <li
          v-for="(item, i) in pillars"
          :key="item.title"
          class="group rounded-2xl border border-neutral-200 bg-white p-6 transition-[border-color,box-shadow] duration-200 hover:border-neutral-300 hover:shadow-md md:p-8"
        >
          <span
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-xs font-bold text-neutral-600 mb-4"
            aria-hidden="true"
          >
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <h3 class="mb-2 text-base font-bold tracking-tight text-neutral-900">
            {{ item.title }}
          </h3>
          <p class="text-sm text-neutral-600 leading-relaxed">
            {{ item.body }}
          </p>
        </li>
      </ul>

      <!-- エディトリアル: 画像 + 長文 -->
      <div
        class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start"
      >
        <div class="lg:col-span-5 order-2 lg:order-1">
          <figure
            class="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 md:p-10"
          >
            <img
              src="/img/logo_logo_only.png"
              alt="NasuNest ロゴマーク"
              class="w-full max-w-sm mx-auto h-auto object-contain grayscale contrast-[1.03]"
            />
            <figcaption class="sr-only">
              NasuNest のシンボルマーク
            </figcaption>
          </figure>
        </div>
        <div class="lg:col-span-7 order-1 lg:order-2 space-y-6">
          <blockquote
            class="border-l-4 border-neutral-800 py-1 pl-6 text-lg font-medium leading-relaxed text-neutral-900 md:text-xl"
          >
            移住・暮らし・旅。それぞれのペースで那須町に関われる「入り口」を、ひとつの場所に。
          </blockquote>
          <p class="text-base md:text-lg text-neutral-600 leading-[1.85]">
            NasuNestは、那須町で生まれる多様な活動やイベントを集め、人と人、人と地域がゆるやかにつながる“重なり”を可視化するコミュニティプラットフォームです。移住者や地域住民、訪れる人が、自分に合った出会いや体験を見つけられる場として、地域の動きを紡ぎ、新たなご縁を育むことを目指しています。
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const pillars = [
  {
    title: '見つける',
    body: 'ワークショップから交流会まで、気になるイベントをすばやくチェック。',
  },
  {
    title: '参加する',
    body: '申し込みや詳細にアクセスし、実際の場につながりやすい導線。',
  },
  {
    title: 'つながる',
    body: 'レポートやコミュニティ情報で、あとからも関係が続きやすい設計。',
  },
] as const
</script>
