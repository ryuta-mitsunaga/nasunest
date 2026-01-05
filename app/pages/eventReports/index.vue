<template>
  <div style="color: #2e5e3e">
    <UiPageTitle title="イベントレポート一覧" />

    <EventsEventReportCardList
      :event-reports="displayEventReports"
      :error="error"
      :loading="loading || additionalLoading"
      :has-more="hasMore"
      @load-more="loadMore"
    />
  </div>
</template>

<script setup lang="ts">
import type { EventReport } from '~/components/events/EventReportCard.vue'

const baseUrl = 'https://www.nasunest.com'

// SEO設定
useHead({
  title: 'イベントレポート一覧',
  meta: [
    {
      name: 'description',
      content:
        '那須町のイベントレポート一覧。開催されたイベントの様子やレポートを確認できます。',
    },
    {
      property: 'og:title',
      content: 'イベントレポート一覧 | NasuNest',
    },
    {
      property: 'og:description',
      content:
        '那須町のイベントレポート一覧。開催されたイベントの様子やレポートを確認できます。',
    },
    { property: 'og:url', content: `${baseUrl}/eventReports` },
    { property: 'og:type', content: 'website' },
  ],
})

const currentPage = ref(1)
const hasMore = ref(true)
const limit = 12

interface PaginationResponse {
  success: boolean
  data: EventReport[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// イベントレポート取得関数
const getEventReports = async (page: number): Promise<PaginationResponse> => {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  const response = await $fetch<PaginationResponse>(
    `/api/public/event-reports?${params.toString()}`
  )

  if (response.success) {
    hasMore.value = response.pagination.hasMore
  }

  return response
}

// イベントレポート取得（useAsyncData + $fetchでキャッシュ）
const {
  data: eventReportsData,
  error: eventReportsError,
  pending: eventReportsLoading,
} = await useAsyncData<PaginationResponse>('event-reports-list', () =>
  getEventReports(currentPage.value)
)

// リアクティブな値を計算
const eventReports = computed(() => {
  if (!eventReportsData.value?.success) return []
  return eventReportsData.value.data
})

const error = computed(() => {
  if (eventReportsError.value) return 'イベントレポートの取得に失敗しました'
  return ''
})

const loading = computed(() => eventReportsLoading.value)

// 無限スクロール用の追加読み込み
const additionalEventReports = ref<EventReport[]>([])
const additionalLoading = ref(false)

const loadMore = async () => {
  if (loading.value || additionalLoading.value || !hasMore.value) return

  // 次のページに移動
  currentPage.value += 1

  additionalLoading.value = true

  try {
    const response = await getEventReports(currentPage.value)

    if (response.success) {
      additionalEventReports.value = [
        ...additionalEventReports.value,
        ...response.data,
      ]
    }
  } catch (err) {
    console.error('イベントレポート取得エラー:', err)
  } finally {
    additionalLoading.value = false
  }
}

// 表示用のイベントレポートリスト（追加読み込み分も含む）
const displayEventReports = computed(() => {
  return [...eventReports.value, ...additionalEventReports.value]
})
</script>
