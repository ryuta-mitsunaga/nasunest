<template>
  <TopHeroSection :events="allEvents" />
  <TopNasuNestSection />
  <TopEventsSection
    :events="latestEvents"
    :loading="eventsLoading"
    :error="eventsError"
  />
  <TopAboutSection />
</template>

<script setup lang="ts">
import type { Event } from '~/components/events/EventCard.vue'

// TODO: トップページ用のレイアウトを作成
definePageMeta({
  layout: 'top',
})

// イベントデータの取得
const eventsLoading = ref(true)
const eventsError = ref('')
const latestEvents = ref<Event[]>([])
const allEvents = ref<Event[]>([])

const { data, error: fetchError } = await useFetch<{
  success: boolean
  data: Event[]
}>('/api/public/events', {
  default: () => ({ success: true, data: [] }),
})

if (fetchError.value) {
  eventsError.value = 'イベントの取得に失敗しました'
} else if (data.value?.success && data.value.data) {
  // 全イベントデータを保持
  allEvents.value = data.value.data
  // 最新3件のみ取得
  latestEvents.value = data.value.data.slice(0, 3)
}

eventsLoading.value = false
</script>
