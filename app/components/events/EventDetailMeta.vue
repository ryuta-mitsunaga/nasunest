<template>
  <div class="flex flex-col gap-2 text-neutral-900">
    <!-- カテゴリ -->
    <EventsEventCategories :categories="categories" />

    <!-- 参加人数（フォーム登録時のみ） -->
    <div v-if="showParticipantCount" class="flex items-center gap-2">
      <svg
        class="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <span>
        <span class="font-bold">現在の参加者 {{ participantCount }}名</span>
        <template v-if="capacity">/ 定員{{ capacity }}名</template>
      </span>
    </div>

    <!-- 日付 -->
    <div class="flex items-center gap-2">
      <svg
        class="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span>{{ formattedStartDate }}</span>
      <span v-if="formattedEndDate && formattedEndDate !== formattedStartDate">
        〜 {{ formattedEndDate }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDayjs } from '~/composables/useDayjs'

const { dayjs } = useDayjs()

interface Category {
  id: number
  name: string
}

interface Props {
  categories?: Category[]
  participantCount?: number | null
  capacity?: number | null
  hasForm: boolean
  startDate: string
  endDate?: string | null
}

const props = defineProps<Props>()

const showParticipantCount = computed(
  () => props.hasForm && props.participantCount != null
)

const formatDate = (dateString: string) => {
  const date = dayjs.utc(dateString).tz('Asia/Tokyo')
  return date.isValid() ? date.format('YYYY年M月D日 HH:mm') : dateString
}

const formattedStartDate = computed(() => formatDate(props.startDate))

const formattedEndDate = computed(() =>
  props.endDate ? formatDate(props.endDate) : null
)
</script>
