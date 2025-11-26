<template>
  <section class="bg-page-bg py-12">
    <div class="container mx-auto px-4">
      <UiSectionTitle
        title="那須町地域おこし協力隊について"
        textColorClass="text-[#2E5E3E]"
      />

      <div
        class="mt-8 flex flex-col md:flex-row gap-8 items-center md:items-start max-w-screen-lg"
      >
        <!-- 左側：画像 -->
        <div class="flex-shrink-0 w-full md:w-1/2">
          <img
            src="/img/chiki-okoshi-Introduction/dummy1.jpg"
            alt="那須町地域おこし協力隊"
            class="w-full h-auto rounded-lg object-cover"
          />
        </div>

        <!-- 右側：説明文 -->
        <div class="w-full md:w-1/2 flex flex-col gap-4 text-[#2e5e3e]">
          <h3 class="text-xl md:text-2xl font-semibold py-4">
            地域と暮らしに寄り添う、那須町の協力隊
          </h3>
          <p class="text-base md:text-lg leading-relaxed">
            那須町地域おこし協力隊は、豊かな自然に囲まれた那須町を舞台に、地域課題の解決や暮らしのサポートに取り組むメンバーです。住民の皆さんと協力しながら、地域の魅力を広げる活動を進めています。
          </p>
          <NuxtLink
            to="/members"
            class="mt-4 inline-flex items-center gap-2 text-base md:text-lg font-semibold hover:opacity-70 transition-opacity underline"
          >
            地域おこし協力隊員一覧を見る
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
