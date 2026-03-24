<template>
  <div v-if="error" class="py-12 text-center">
    <p class="text-sm text-red-600 md:text-base">{{ error }}</p>
  </div>

  <div
    v-else-if="eventReports.length === 0 && !loading"
    class="py-12 text-center"
  >
    <p class="text-neutral-500">イベントレポートがありません</p>
  </div>

  <div v-else>
    <UiInfiniteScroll
      :has-more="hasMore"
      :loading="loading"
      loading-text="読み込み中..."
      loading-text-color="#737373"
      @load-more="$emit('load-more')"
    >
      <div class="grid grid-cols-1 gap-4">
        <EventsEventReportCard
          v-for="(eventReport, index) in eventReports"
          :key="eventReport.id"
          :event-report="eventReport"
          :style="{ animationDelay: `${index * 0.1}s` }"
        />
      </div>
    </UiInfiniteScroll>
  </div>
</template>

<script setup lang="ts">
import type { EventReport } from '~/components/events/EventReportCard.vue'

interface Props {
  eventReports: EventReport[]
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
