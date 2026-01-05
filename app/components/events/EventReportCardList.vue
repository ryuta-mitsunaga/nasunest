<template>
  <div v-if="error" class="text-center py-12">
    <p style="color: #8c5a3c">{{ error }}</p>
  </div>

  <div
    v-else-if="eventReports.length === 0 && !loading"
    class="text-center py-12"
  >
    <p style="color: #8c5a3c">イベントレポートがありません</p>
  </div>

  <div v-else>
    <UiInfiniteScroll
      :has-more="hasMore"
      :loading="loading"
      loading-text="読み込み中..."
      loading-text-color="#8c5a3c"
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

