<template>
  <!-- トップ専用: 白黒・ミニマル・シック（Inter / レイアウト top-layout-chic と連動） -->
  <main
    id="primary-content"
    class="top-page-root"
    tabindex="-1"
  >
    <TopHeroSection
      :news-items="heroNewsItems"
      :news-loading="heroNewsLoading"
    />
    <TopEventsSection
      :events="latestEvents"
      :loading="eventsLoading"
      :error="eventsError"
    />
    <TopEventReportSection
      :event-reports="eventReportsForSection"
      :loading="eventReportsLoading"
      :error="eventReportsError"
    />
    <TopNasuNestSection />
  </main>
</template>

<script setup lang="ts">
import type { Event } from '~/components/events/EventCard.vue'
import type { EventReport } from '~/components/events/EventReportCard.vue'
import type { HeroNewsItem } from '~/components/top/TopHeroNewsStripCard.vue'

definePageMeta({
  layout: 'top',
})

// SEO設定
const baseUrl = 'https://www.nasunest.com'

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&family=Zen+Maru+Gothic:wght@500;700&display=swap',
    },
  ],
  title:
    'NasuNest - 那須町の人がつながるきっかけを生み出す地域コミュニティプラットフォーム',
  meta: [
    {
      name: 'description',
      content:
        'NasuNestは、栃木県那須町の「人がつながるきっかけ」を生み出す地域コミュニティプラットフォーム。移住者・地域住民・観光者がイベント・体験・交流会を簡単に探して参加できます。',
    },
    {
      name: 'keywords',
      content:
        '那須,那須町,地域コミュニティ,移住,二地域居住,イベント,体験,交流会,ワークショップ,地域おこし協力隊,NasuNest,なすねすと,ナスネスト',
    },
    // Open Graph
    {
      property: 'og:title',
      content:
        'NasuNest - 那須町の人がつながるきっかけを生み出す地域コミュニティプラットフォーム',
    },
    {
      property: 'og:description',
      content:
        'NasuNestは、栃木県那須町の「人がつながるきっかけ」を生み出す地域コミュニティプラットフォーム。移住者・地域住民・観光者がイベント・体験・交流会を簡単に探して参加できます。',
    },
    {
      property: 'og:url',
      content: `${baseUrl}/`,
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:image',
      content: `${baseUrl}/img/title-logo.png`,
    },
    {
      property: 'og:image:width',
      content: '1200',
    },
    {
      property: 'og:image:height',
      content: '630',
    },
    {
      property: 'og:image:alt',
      content: 'NasuNest - 那須町の地域コミュニティプラットフォーム',
    },
    {
      property: 'og:site_name',
      content: 'NasuNest',
    },
    {
      property: 'og:locale',
      content: 'ja_JP',
    },
    // Twitter Card
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:title',
      content:
        'NasuNest - 那須町の人がつながるきっかけを生み出す地域コミュニティプラットフォーム',
    },
    {
      name: 'twitter:description',
      content:
        'NasuNestは、栃木県那須町の「人がつながるきっかけ」を生み出す地域コミュニティプラットフォーム。移住者・地域住民・観光者がイベント・体験・交流会を簡単に探して参加できます。',
    },
    {
      name: 'twitter:image',
      content: `${baseUrl}/img/title-logo.png`,
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'NasuNest',
        alternateName: 'ナスネスト',
        url: baseUrl,
        description:
          'NasuNestは、栃木県那須町の「人がつながるきっかけ」を生み出す地域コミュニティプラットフォーム。移住者・地域住民・観光者がイベント・体験・交流会を簡単に探して参加できます。',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/events?keyword={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        publisher: {
          '@type': 'Organization',
          name: 'NasuNest',
          alternateName: 'NasuNest',
          url: baseUrl,
        },
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@type': 'WebPage',
              '@id': `${baseUrl}/events`,
              name: 'イベント一覧',
              description: '那須町のイベント一覧です。',
            },
          },
          {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@type': 'WebPage',
              '@id': `${baseUrl}/chikiOkoshiMembers`,
              name: '地域おこし協力隊員一覧',
              description: '那須町の地域おこし協力隊員一覧です。',
            },
          },
        ],
      }),
    },
  ],
})

// イベントデータの取得
const eventsLoading = ref(true)
const eventsError = ref('')
const eventsList = ref<Event[]>([])

const { data, error: fetchError } = await useFetch<{
  success: boolean
  data: Event[]
}>('/api/public/events', {
  default: () => ({ success: true, data: [] }),
})

if (fetchError.value) {
  eventsError.value = 'イベントの取得に失敗しました'
} else if (data.value?.success && data.value.data) {
  eventsList.value = data.value.data
}

eventsLoading.value = false

const latestEvents = computed(() => eventsList.value.slice(0, 3))

const eventReportsForSection = computed(() =>
  eventReports.value.slice(0, 3)
)

// イベントレポートデータの取得
const eventReportsLoading = ref(true)
const eventReportsError = ref('')
const eventReports = ref<EventReport[]>([])

const { data: eventReportsData, error: eventReportsFetchError } =
  await useFetch<{
    success: boolean
    data: EventReport[]
  }>('/api/public/event-reports?limit=8', {
    default: () => ({ success: true, data: [] }),
  })

if (eventReportsFetchError.value) {
  eventReportsError.value = 'イベントレポートの取得に失敗しました'
} else if (eventReportsData.value?.success && eventReportsData.value.data) {
  eventReports.value = eventReportsData.value.data
}

eventReportsLoading.value = false

/** ヒーロー新着ストリップ用（イベント＋レポートを日付でマージ） */
const heroNewsLoading = computed(
  () => eventsLoading.value || eventReportsLoading.value
)

const heroNewsItems = computed((): HeroNewsItem[] => {
  const ev = eventsList.value.slice(0, 10).map(
    (e): HeroNewsItem => ({
      id: `e-${e.id}`,
      kind: 'event',
      title: e.title,
      to: `/events/${e.id}`,
      at: e.start_date,
      label: 'イベント',
      thumbnail: e.thumbnail,
    })
  )
  const rep = eventReports.value.map(
    (r): HeroNewsItem => ({
      id: `r-${r.id}`,
      kind: 'report',
      title: r.title,
      to: `/eventReports/${r.id}`,
      at: r.createdAt,
      label: 'レポート',
      thumbnail: r.thumbnail,
    })
  )
  return [...ev, ...rep]
    .sort(
      (a, b) =>
        new Date(b.at).getTime() - new Date(a.at).getTime()
    )
    .slice(0, 12)
})
</script>

<style scoped>
.top-page-root {
  font-family:
    'Inter',
    'Noto Sans JP',
    ui-sans-serif,
    system-ui,
    sans-serif;
}
</style>
