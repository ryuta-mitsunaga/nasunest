<template>
  <div v-if="error" class="py-12 text-center">
    <p class="text-neutral-600">{{ error }}</p>
  </div>

  <div v-else-if="events.length === 0 && !loading" class="py-12 text-center">
    <p class="text-neutral-500">イベントがありません</p>
  </div>

  <div v-else>
    <UiInfiniteScroll
      :has-more="hasMore"
      :loading="loading"
      loading-text="読み込み中..."
      loading-text-color="#5c726b"
      @load-more="$emit('load-more')"
    >
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <EventsEventCard
          v-for="(event, index) in events"
          :key="event.id"
          :event="event"
          :style="{ animationDelay: `${index * 0.1}s` }"
        />
      </div>
    </UiInfiniteScroll>
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/components/events/EventCard.vue'

interface Props {
  events: Event[]
  error?: string
  loading?: boolean
  hasMore?: boolean
}

interface Emits {
  (e: 'load-more'): void
}

withDefaults(defineProps<Props>(), {
  error: '',
  loading: false,
  hasMore: false,
})

defineEmits<Emits>()
</script>
