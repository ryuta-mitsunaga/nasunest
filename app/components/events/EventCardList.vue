<template>
  <div v-if="error" class="text-center py-12">
    <p style="color: #8c5a3c">{{ error }}</p>
  </div>

  <div v-else-if="events.length === 0" class="text-center py-12">
    <p style="color: #8c5a3c">イベントがありません</p>
  </div>

  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <EventsEventCard
      v-for="(event, index) in events"
      :key="event.id"
      :event="event"
      :style="{ animationDelay: `${index * 0.1}s` }"
    />
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/components/events/EventCard.vue'

interface Props {
  events: Event[]
  error?: string
}

withDefaults(defineProps<Props>(), {
  error: '',
})
</script>
