<template>
  <div
    class="event-card block cursor-pointer overflow-hidden rounded-xl border-2 border-neutral-200/80 bg-white shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-neutral-400 hover:shadow-md"
    :style="cardBorderStyle"
  >
    <NuxtLink
      :to="`/events/${event.id}`"
      class="group relative block h-full rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
    >
      <!-- 終了/募集終了のときはカード全体に薄グレーのオーバーレイを被せる -->
      <div
        v-if="isClosedOrRecruitmentClosed"
        class="pointer-events-none absolute inset-0 z-10 bg-black opacity-20"
      />
      <!-- 参加人数表示（右上） -->
      <div
        v-if="
          event.participant_count !== undefined && event.participant_count > 0
        "
        class="absolute right-2 top-2 z-20 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-sm font-medium"
        :style="{ color: participantColor }"
      >
        <UIcon name="i-heroicons-user" class="h-4 w-4" />
        <span>{{ event.participant_count }}名参加</span>
      </div>
      <!-- サムネイル画像 -->
      <div
        v-if="event.thumbnail"
        class="relative w-full overflow-hidden"
        style="aspect-ratio: 1.618 / 1"
      >
        <img
          :src="event.thumbnail"
          :alt="event.title"
          class="absolute h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
        />
      </div>

      <!-- サムネイルがない場合 -->
      <div
        v-else
        class="relative flex w-full items-center justify-center overflow-hidden bg-gray-200"
        style="aspect-ratio: 1.618 / 1"
      >
        <p class="text-sm text-gray-400">no photo</p>
      </div>

      <!-- カードボディ -->
      <div class="space-y-0 px-5 py-4">
        <div
          class="text-[11px] font-semibold uppercase tabular-nums tracking-wider"
          :style="{ color: dateColor }"
        >
          {{ formattedDateRange }}
        </div>
        <h2
          class="mt-2 line-clamp-3 text-lg font-bold leading-snug"
          :style="{ color: titleColor }"
        >
          {{ event.title }}
        </h2>
        <EventsEventCategories
          class="mt-3"
          :categories="event.categories"
        />
        <EventsEventCreator
          class="mt-4 justify-end"
          :creator="event.creator"
          size="md"
        />
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useDayjs } from '~/composables/useDayjs'

const { dayjs } = useDayjs()

export interface Event {
  id: number
  title: string
  form_id: number | null
  start_date: string
  end_date: string | null
  description: string
  location_name: string | null
  location_address: string | null
  location_url: string | null
  thumbnail: string | null
  cta_button_text: string | null
  status: 'published' | 'unpublished' | 'closed' | 'recruitment_closed'
  participant_count?: number
  creator?: { icon_url: string } | null
  categories?: Array<{
    id: number
    name: string
  }>
}

interface Props {
  event: Event
}

const props = defineProps<Props>()

const cardBorderStyle = computed(() => ({
  borderColor: props.event.form_id ? '#171717' : 'rgba(229, 229, 229, 0.8)',
}))

const participantColor = '#171717'
const titleColor = '#171717'
const dateColor = '#525252'

const formatDate = (dateString: string) => {
  const date = dayjs.utc(dateString).tz('Asia/Tokyo')
  if (!date.isValid()) return dateString
  return date.format('YYYY年M月D日 HH:mm')
}

const formattedDateRange = computed(() => {
  const start = dayjs.utc(props.event.start_date).tz('Asia/Tokyo')
  if (!start.isValid()) return formatDate(props.event.start_date)
  let s = start.format('YYYY.MM.DD HH:mm')
  if (
    props.event.end_date &&
    props.event.end_date !== props.event.start_date
  ) {
    const end = dayjs.utc(props.event.end_date).tz('Asia/Tokyo')
    if (end.isValid()) s += ` — ${end.format('MM.DD')}`
  }
  return s
})

const isClosed = computed(() => props.event.status === 'closed')

const isRecruitmentClosed = computed(
  () => props.event.status === 'recruitment_closed'
)

const isClosedOrRecruitmentClosed = computed(
  () => isClosed.value || isRecruitmentClosed.value
)
</script>

`defineProps` を二重にしてしまった。修正します。

<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace