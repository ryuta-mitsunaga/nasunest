<template>
  <section class="bg-[#2E5E3E] text-white py-12">
    <div class="container mx-auto px-4">
      <UiSectionTitle title="#イベントレポ" />
    </div>

    <div class="container mx-auto px-4 mt-8">
      <EventsEventReportCardList
        :event-reports="eventReports"
        :loading="loading"
        :error="error"
        :has-more="false"
      />
    </div>

    <div
      v-if="!loading && !error && eventReports.length > 0"
      class="mt-4 text-center"
    >
      <NuxtLink
        to="/eventReports"
        class="inline-flex items-center gap-2 text-base md:text-lg font-semibold hover:opacity-70 transition-opacity underline"
      >
        すべてのイベントレポを見る
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { EventReport } from '~/components/events/EventReportCard.vue'

const props = withDefaults(
  defineProps<{
    eventReports: EventReport[]
    loading?: boolean
    error?: string
  }>(),
  {
    eventReports: () => [],
    loading: false,
    error: '',
  }
)
</script>
