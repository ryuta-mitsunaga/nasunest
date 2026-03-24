<template>
  <section
    id="reports-start"
    class="scroll-mt-[4.75rem] border-t border-neutral-200 bg-white py-20 text-neutral-900 md:py-28"
    aria-labelledby="reports-heading"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div
        class="flex flex-col gap-8 md:flex-row md:items-end md:justify-between mb-12 md:mb-14"
      >
        <div class="max-w-2xl">
          <UiSectionTitle
            heading-id="reports-heading"
            title="#イベントレポ"
            eyebrow="Reports"
            eyebrow-class="text-neutral-500"
            text-color-class="text-neutral-900"
            divider-color-class="bg-neutral-800"
            divider-height-class="h-1"
            heading-size="xl"
          />
          <p
            class="mt-5 text-sm md:text-base text-neutral-600 max-w-lg leading-relaxed"
          >
            開催の様子やレポートをチェックして、次の参加のヒントに。
          </p>
        </div>
        <UiCtaLink
          v-if="!loading && !error && eventReports.length > 0"
          to="/eventReports"
          variant="outline"
          label="すべて見る"
        />
      </div>

      <EventsEventReportCardList
        :event-reports="eventReports"
        :loading="loading"
        :error="error"
        :has-more="false"
      />

      <div
        v-if="!loading && !error && eventReports.length > 0"
        class="mt-10 flex justify-center md:hidden"
      >
        <UiCtaLink
          to="/eventReports"
          variant="solid"
          label="すべてのイベントレポを見る"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { EventReport } from '~/components/events/EventReportCard.vue'

withDefaults(
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
