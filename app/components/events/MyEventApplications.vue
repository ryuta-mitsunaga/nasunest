<template>
  <div v-if="applications.length > 0" class="mb-8">
    <div class="flex items-center gap-2 mb-2">
      <h2 class="text-xl font-bold text-neutral-900">申し込み中のイベント</h2>
      <button
        type="button"
        class="text-xs underline text-gray-600 hover:text-gray-800"
        @click="isOpen = !isOpen"
      >
        {{ isOpen ? '非表示にする' : '表示する' }}
      </button>
    </div>
    <div v-if="isOpen" class="space-y-2">
      <EventsMyEventApplicationItem
        v-for="application in applications"
        :key="application.id"
        :application="application"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface EventApplication {
  id: number
  event_id: number
  event_title: string
  start_date: string
  end_date: string | null
  status: number
  applied_at: Date
}

const props = defineProps<{
  applications: EventApplication[]
}>()

const isOpen = ref(true)
</script>
