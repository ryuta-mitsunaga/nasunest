<template>
  <div class="min-h-screen" style="background-color: #f9f7f2">
    <div class="container mx-auto px-4 py-12">
      <UiPageTitle title="イベント一覧" />

      <EventsEventCardList :events="events" :error="error" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/components/events/EventCard.vue'

const error = ref('')
const events = ref<Event[]>([])

const { data } = await useFetch<{ success: boolean; data: Event[] }>(
  '/api/public/events'
)

events.value = data.value?.data || []
</script>
