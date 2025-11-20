<template>
  <!-- メンバー -->
  <section>
    <!-- メンバー一覧 -->
    <div class="grid grid-cols-2 gap-2 p-4">
      <div
        v-for="(member, index) in data?.data"
        :key="member.id"
        class="flex items-center justify-start p-4"
      >
        <div class="w-12 h-12 bg-gray-300 rounded-full mr-2">
          <img
            :src="member.icon"
            :alt="member.name_sei + ' ' + member.name_mei"
            class="w-full h-full object-cover rounded-sm"
          />
        </div>
        <div class="p-4">
          <p>{{ member.mission }}</p>
          <p>{{ member.name_sei + ' ' + member.name_mei }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MembersResponse } from '~/types'

const { data, pending, error } = await useFetch<MembersResponse>('/api/members')
</script>
