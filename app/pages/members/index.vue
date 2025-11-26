<template>
  <div style="color: #2E5E3E">
    <UiPageTitle title="地域おこし協力隊員一覧" />

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
      />
    </div>

    <div v-else class="text-center py-20">
      メンバーが登録されていません
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MembersResponse } from '~/types'

const { data, pending, error } = await useFetch<MembersResponse>('/api/members')

const members = computed(() => data.value?.data || [])
</script>
