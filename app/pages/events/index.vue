<template>
  <div style="color: #2E5E3E">
      <UiPageTitle title="イベント一覧" />

      <EventsEventCardList :events="events" :error="error" />
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/components/events/EventCard.vue'

const error = ref('')

const { data, error: fetchError } = await useFetch<{
  success: boolean
  data: Event[]
}>('/api/public/events', {
  default: () => ({ success: true, data: [] }),
})

if (fetchError.value) {
  error.value = 'イベントの取得に失敗しました'
}

const events = computed<Event[]>(() => {
  if (fetchError.value) {
    return []
  }
  if (!data.value || !data.value.success) {
    return []
  }
  return data.value.data || []
})
</script>
