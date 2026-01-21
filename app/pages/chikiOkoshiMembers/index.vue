<template>
  <div style="color: #2e5e3e">
    <UiPageTitle title="那須町地域おこし協力隊" />

    <!-- 那須町地域おこし協力隊について -->
    <section class="bg-page-bg mb-12">
      <div class="container mx-auto px-4">
        <div
          class="mt-8 flex flex-col md:flex-row gap-8 items-center md:items-start max-w-screen-lg"
        >
          <!-- 左側：画像 -->
          <div class="flex-shrink-0 w-full md:w-1/2">
            <img
              src="/img/chiki-okoshi-Introduction/chiki_okoshi_group_photo.jpg"
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
          </div>
        </div>
      </div>
    </section>

    <!-- メンバー一覧 -->
    <div v-if="pending" class="flex justify-center items-center py-20">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin text-3xl text-gray-400"
      />
    </div>

    <div v-else-if="error" class="text-center py-20">
      メンバーの取得に失敗しました
    </div>

    <div
      v-else-if="members && members.length > 0"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-8"
    >
      <MembersMemberCard
        v-for="member in members"
        :key="member.id"
        :name-sei="member.name_sei"
        :name-mei="member.name_mei"
        :mission="member.mission"
        :description="member.description"
        :icon="member.icon"
        :x-url="member.x_url"
        :instagram-url="member.instagram_url"
        :facebook-url="member.facebook_url"
        :homepage-url="member.homepage_url"
      />
    </div>

    <div v-else class="text-center py-20">メンバーが登録されていません</div>
  </div>
</template>

<script setup lang="ts">
import type { MembersResponse } from '~/types'

const baseUrl = 'https://www.nasunest.com'

// SEO設定
useHead({
  title: '那須町地域おこし協力隊',
  meta: [
    {
      name: 'description',
      content:
        '那須町地域おこし協力隊の隊員一覧。各隊員の活動内容やミッションを紹介しています。',
    },
    {
      property: 'og:title',
      content: '地域おこし協力隊員一覧 | NasuNest',
    },
    {
      property: 'og:description',
      content:
        '那須町地域おこし協力隊の隊員一覧。各隊員の活動内容やミッションを紹介しています。',
    },
    {
      property: 'og:url',
      content: `${baseUrl}/chikiOkoshiMembers`,
    },
    { property: 'og:type', content: 'website' },
  ],
})

const { data, pending, error } = await useFetch<MembersResponse>('/api/members')

const members = computed(() => data.value?.data || [])
</script>
