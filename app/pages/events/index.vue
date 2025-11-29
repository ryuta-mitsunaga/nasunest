<template>
  <div style="color: #2e5e3e">
    <UiPageTitle title="イベント一覧" />

    <!-- 検索コンポーネント -->
    <EventsEventSearch
      :categories="categories"
      :display-count="displayEvents.length"
      :total="totalCount"
      @search="handleSearch"
    />

    <EventsEventCardList
      :events="displayEvents"
      :error="error"
      :loading="loading || additionalLoading"
      :has-more="hasMore"
      @load-more="loadMore"
    />
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/components/events/EventCard.vue'

interface Category {
  id: number
  name: string
}

const currentPage = ref(1)
const hasMore = ref(true)
const limit = 12

// 検索条件
const searchFilters = reactive({
  keyword: '',
  categoryIds: [] as number[],
  startDate: '',
  endDate: '',
})

interface PaginationResponse {
  success: boolean
  data: Event[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// クエリ文字列を生成
const buildQueryString = (page: number) => {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  if (searchFilters.keyword) {
    params.append('keyword', searchFilters.keyword)
  }

  searchFilters.categoryIds.forEach(id => {
    params.append('categoryIds', id.toString())
  })

  if (searchFilters.startDate) {
    params.append('startDate', searchFilters.startDate)
  }

  if (searchFilters.endDate) {
    params.append('endDate', searchFilters.endDate)
  }

  return params.toString()
}

// イベント取得関数（共通化）
const getEvents = async (page: number): Promise<PaginationResponse> => {
  const queryString = buildQueryString(page)
  const response = await $fetch<PaginationResponse>(
    `/api/public/events?${queryString}`
  )

  if (response.success) {
    hasMore.value = response.pagination.hasMore
  }

  return response
}

// イベント取得URL（リアクティブ）
const eventsUrl = computed(() => {
  return `/api/public/events?${buildQueryString(currentPage.value)}`
})

// イベント取得（useAsyncData + $fetchでキャッシュ）
const {
  data: eventsData,
  error: eventsError,
  pending: eventsLoading,
  refresh: refreshEvents,
} = await useAsyncData<PaginationResponse>('events-list', () =>
  getEvents(currentPage.value)
)

// カテゴリ取得（useAsyncData + $fetchでキャッシュ）
const { data: categoriesData } = await useAsyncData<{
  success: boolean
  data: Category[]
}>('event-categories', () =>
  $fetch<{ success: boolean; data: Category[] }>('/api/event-categories')
)

// リアクティブな値を計算
const events = computed(() => {
  if (!eventsData.value?.success) return []
  return eventsData.value.data
})

const categories = computed(() => {
  if (!categoriesData.value?.success) return []
  return categoriesData.value.data || []
})

const error = computed(() => {
  if (eventsError.value) return 'イベントの取得に失敗しました'
  return ''
})

const loading = computed(() => eventsLoading.value)

// 無限スクロール用の追加読み込み
const additionalEvents = ref<Event[]>([])
const additionalLoading = ref(false)

const loadMore = async () => {
  if (loading.value || additionalLoading.value || !hasMore.value) return

  // 次のページに移動
  currentPage.value += 1

  additionalLoading.value = true

  try {
    const response = await getEvents(currentPage.value)

    if (response.success) {
      additionalEvents.value = [...additionalEvents.value, ...response.data]
      // hasMoreはgetEvents内で更新される
      // 無限スクロール時はcurrentPageを更新しない（refreshを防ぐため）
    }
  } catch (err) {
    console.error('イベント取得エラー:', err)
  } finally {
    additionalLoading.value = false
  }
}

// 検索条件が変わったときに再取得
const handleSearch = (filters: {
  keyword: string
  categoryIds: number[]
  startDate?: string
  endDate?: string
}) => {
  searchFilters.keyword = filters.keyword
  searchFilters.categoryIds = filters.categoryIds
  searchFilters.startDate = filters.startDate || ''
  searchFilters.endDate = filters.endDate || ''
  // 検索時は1ページ目から再取得
  currentPage.value = 1
  additionalEvents.value = []
  refreshEvents()
}

// 表示用のイベントリスト（追加読み込み分も含む）
const displayEvents = computed(() => {
  return [...events.value, ...additionalEvents.value]
})

// 総件数
const totalCount = computed(() => {
  return eventsData.value?.pagination?.total || 0
})
</script>
