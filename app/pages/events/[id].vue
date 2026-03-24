<template>
  <div class="relative text-neutral-900">
    <div class="mb-6">
      <NuxtLink
        to="/events"
        class="mb-4 inline-flex items-center gap-2 text-sm text-neutral-900 hover:underline"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>イベント一覧に戻る</span>
      </NuxtLink>
      <UiPageTitle :title="event?.title || 'イベント詳細'" />
    </div>

    <div v-if="loading" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p>{{ error }}</p>
    </div>

    <div
      v-else-if="event"
      class="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm"
    >
      <!-- サムネイル画像 -->
      <div
        v-if="event.thumbnail"
        class="relative w-full overflow-hidden"
        style="aspect-ratio: 1.618 / 1"
      >
        <img
          :src="event.thumbnail"
          :alt="event.title"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- カテゴリ・参加者・日付（サムネイル上） -->
      <div class="px-6 pt-6 pb-2">
        <EventsEventDetailMeta
          :categories="event.categories"
          :participant-count="(event as any).participant_count"
          :capacity="(event as any).capacity"
          :has-form="!!(event.form_id || (event as any).form_link)"
          :start-date="event.start_date"
          :end-date="event.end_date"
        />
      </div>

      <!-- イベント情報 -->
      <div class="p-6 md:p-8 space-y-6">
        <!-- 本文（body_htmlでSSR、未変換時はEditorJSにフォールバック） -->
        <div v-if="(event as any).body_html">
          <EditorJsHtmlViewer :html="(event as any).body_html" />
        </div>
        <div v-else-if="event.body">
          <AdminEditorJsEditor :data="event.body" :read-only="true" />
        </div>

        <!-- 場所情報 -->
        <div v-if="event.location_name" class="space-y-2">
          <h2 class="text-lg font-bold text-neutral-900">場所</h2>
          <div class="flex items-start gap-2 text-neutral-900">
            <svg
              class="w-5 h-5 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div>
              <p class="font-semibold">{{ event.location_name }}</p>
              <p
                v-if="event.location_address"
                class="text-sm mt-1"
                style="color: #8c5a3c"
              >
                {{ event.location_address }}
              </p>
            </div>
          </div>
          <a
            v-if="event.location_url"
            :href="event.location_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-sm text-neutral-900 hover:underline"
          >
            <span>地図を見る</span>
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>

        <!-- 作成者 -->
        <EventsEventCreator
          class="justify-end"
          :creator="event.creator"
          size="xl"
        />

        <!-- イベントレポート -->
        <div v-if="event.event_reports?.length" class="space-y-2">
          <h2 class="text-lg font-bold text-neutral-900">イベントレポート</h2>
          <ul class="space-y-2">
            <li v-for="report in event.event_reports" :key="report.id">
              <NuxtLink
                :to="`/eventReports/${report.id}`"
                class="inline-flex items-center gap-2 text-sm text-neutral-900 hover:underline"
              >
                <svg
                  class="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>{{ report.title }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- フォームリンク -->
        <div
          v-if="showCtaButton && (event.form_id || (event as any).form_link)"
          ref="ctaButtonContainer"
          class="pt-4"
        >
          <div class="space-y-3">
            <template v-if="isApplyCapacityFull">
              <button
                type="button"
                disabled
                class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-[#f4d35e] px-6 py-3 text-base font-medium text-neutral-900 opacity-50 shadow-sm transition-all duration-200 md:w-auto"
              >
                <span>定員に達しました</span>
              </button>
            </template>
            <template v-else-if="isLoginRequiredForApply">
              <button
                type="button"
                disabled
                class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-[#f4d35e] px-6 py-3 text-base font-medium text-neutral-900 opacity-50 shadow-sm transition-all duration-200 md:w-auto"
              >
                <p>
                  申し込みには<br />
                  <span class="font-bold">ログイン</span>が必須です。
                </p>
              </button>
              <div class="text-center md:text-left">
                <NuxtLink
                  :to="loginWithRedirectTo"
                  class="inline-flex items-center gap-1 text-sm text-neutral-900 hover:underline"
                >
                  <span>ログイン画面へ</span>
                  <svg
                    class="w-4 h-4"
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
            </template>
            <div v-else class="w-full md:w-auto">
              <EventsEventActionButton
                :button-text="event.cta_button_text"
                @click="handleCtaClick"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-if="showCtaButton">
      <!-- 固定CTAボタン（画面下部） -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="translate-y-full opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-full opacity-0"
      >
        <div
          v-if="
            showFixedCta && event && (event.form_id || (event as any).form_link)
          "
          class="fixed bottom-4 left-0 right-0 z-50 mx-auto w-3/4 max-w-xl"
        >
          <div class="max-w-7xl mx-auto">
            <div class="space-y-3">
              <template v-if="isApplyCapacityFull">
                <button
                  type="button"
                  disabled
                  class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-[#f4d35e] px-6 py-3 text-base font-medium text-neutral-900 opacity-50 shadow-sm transition-all duration-200"
                >
                  <span>定員に達しました</span>
                </button>
              </template>
              <template v-else-if="isLoginRequiredForApply">
                <button
                  type="button"
                  disabled
                  class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-[#f4d35e] px-6 py-3 text-base font-medium text-neutral-900 opacity-50 shadow-sm transition-all duration-200"
                >
                  <p>
                    <span class="font-bold">ログイン</span>が必須です。
                  </p>
                </button>
                <div class="text-center mt-2">
                  <NuxtLink
                    :to="loginWithRedirectTo"
                    class="inline-flex items-center gap-1 text-sm text-neutral-900 hover:underline"
                  >
                    <span>ログイン画面へ</span>
                    <svg
                      class="w-4 h-4"
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
              </template>
              <div v-else class="w-full">
                <EventsEventActionButton
                  :button-text="event.cta_button_text"
                  @click="handleCtaClick"
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </template>
  </div>
</template>

<script setup lang="ts">
interface EventReport {
  id: number
  title: string
  thumbnail: string | null
  createdAt: string
}

interface Event {
  id: number
  title: string
  form_id: number | null
  form_link?: string | null
  start_date: string
  end_date: string | null
  description: string
  body: string | null
  location_name: string | null
  location_address: string | null
  location_url: string | null
  thumbnail: string | null
  cta_button_text: string | null
  approval_type: number | null
  categories?: Array<{
    id: number
    name: string
  }>
  status: 'published' | 'unpublished' | 'closed' | 'recruitment_closed'
  creator?: { icon_url: string } | null
  event_reports?: EventReport[]
  body_html?: string | null
}

const route = useRoute()
const { isAuthenticated } = useAuth()
const eventId = computed(() => {
  const id = route.params.id
  if (Array.isArray(id)) {
    return id[0] || ''
  }
  return id || ''
})

const loading = ref(true)
const error = ref('')
const event = ref<Event | null>(null)
const ctaButtonContainer = ref<HTMLElement | null>(null)
const showFixedCta = ref(false)

const loginWithRedirectTo = computed(
  () => `/login?redirect=${encodeURIComponent(route.fullPath)}`
)

const isApplyCapacityFull = computed(
  () => (event.value as any)?.is_full === true
)

const isLoginRequiredForApply = computed(() => {
  const e = event.value
  if (!e) return false
  const at = e.approval_type
  return (at === 0 || at === 1) && !isAuthenticated.value
})

const handleCtaClick = () => {
  if (event.value?.form_link) {
    if (typeof window !== 'undefined') {
      window.open(event.value.form_link, '_blank', 'noopener,noreferrer')
    } else {
      navigateTo(event.value.form_link, { external: true })
    }
    return
  }
  navigateTo(`/forms/${event.value?.form_id}?event_id=${event.value?.id}`)
}

// CTAボタンの表示状態を監視
onMounted(() => {
  if (!ctaButtonContainer.value || typeof window === 'undefined') return

  const observer = new IntersectionObserver(
    entries => {
      // CTAボタンが画面外に出た場合、固定CTAを表示
      if (entries[0]) {
        showFixedCta.value = !entries[0].isIntersecting
      }
    },
    {
      threshold: 0,
      rootMargin: '0px',
    }
  )

  observer.observe(ctaButtonContainer.value)

  onBeforeUnmount(() => {
    observer.disconnect()
  })
})

const { data } = await useFetch<{ success: boolean; data: Event }>(
  `/api/public/events/${eventId.value}`
)

if (data.value?.success && data.value.data) {
  event.value = data.value.data
  // bodyが文字列の場合はパース
  if (event.value.body && typeof event.value.body === 'string') {
    try {
      event.value.body = JSON.parse(event.value.body)
    } catch (e) {
      console.error('Body parse error:', e)
      event.value.body = null
    }
  }
} else {
  error.value = 'イベントが見つかりません'
}

loading.value = false

const baseUrl = 'https://www.nasunest.com'

// 日時をISO 8601形式に変換
const formatDateForOGP = (dateString: string | null): string | null => {
  if (!dateString) return null
  return new Date(dateString).toISOString()
}

// EditorJSのbodyからテキストを抽出
const extractTextFromEditorJS = (body: any): string => {
  if (!body) return ''

  // 文字列の場合はパースを試みる
  let parsedBody = body
  if (typeof body === 'string') {
    try {
      parsedBody = JSON.parse(body)
    } catch {
      return ''
    }
  }

  // blocksが存在しない場合は空文字を返す
  if (!parsedBody?.blocks || !Array.isArray(parsedBody.blocks)) {
    return ''
  }

  const texts: string[] = []

  for (const block of parsedBody.blocks) {
    if (!block.data) continue

    switch (block.type) {
      case 'paragraph':
        if (block.data.text) {
          // HTMLタグを除去してテキストのみ抽出
          const text = block.data.text.replace(/<[^>]*>/g, '').trim()
          if (text) texts.push(text)
        }
        break
      case 'header':
        if (block.data.text) {
          const text = block.data.text.replace(/<[^>]*>/g, '').trim()
          if (text) texts.push(text)
        }
        break
      case 'list':
        if (block.data.items && Array.isArray(block.data.items)) {
          for (const item of block.data.items) {
            // itemが文字列でない場合は文字列に変換
            const itemText =
              typeof item === 'string' ? item : String(item || '')
            const text = itemText.replace(/<[^>]*>/g, '').trim()
            if (text) texts.push(text)
          }
        }
        break
      case 'quote':
        if (block.data.text) {
          const text = block.data.text.replace(/<[^>]*>/g, '').trim()
          if (text) texts.push(text)
        }
        break
    }
  }

  return texts.join(' ').substring(0, 160)
}

// SEO設定
useHead({
  title: computed(
    () => `${event.value?.title || 'イベント詳細'}｜那須町のイベント`
  ),
  meta: computed(() => {
    const eventTitle = event.value?.title || 'イベント詳細'
    // bodyからテキストを抽出してdescriptionに使用
    const eventDescription =
      extractTextFromEditorJS(event.value?.body) ||
      '那須町のイベント情報詳細ページです。'
    const eventImage = event.value?.thumbnail || `${baseUrl}/img/title-logo.png`
    const eventUrl = `${baseUrl}/events/${eventId.value}`
    const startTime = formatDateForOGP(event.value?.start_date || null)
    const endTime = formatDateForOGP(event.value?.end_date || null)
    const location = event.value?.location_name || event.value?.location_address

    // カテゴリ名をキーワードに追加
    const categoryKeywords =
      event.value?.categories?.map(cat => cat.name).join(', ') || ''
    const keywords = [
      '那須',
      '那須町',
      'イベント',
      eventTitle,
      categoryKeywords,
      '移住',
      '二地域居住',
      '地域コミュニティ',
      '地域おこし協力隊',
      'NasuNest',
      'なすねすと',
      'ナスネスト',
    ]
      .filter(Boolean)
      .join(', ')

    const metaTags: any[] = [
      {
        name: 'description',
        content: eventDescription,
      },
      {
        name: 'keywords',
        content: keywords,
      },
      // Open Graph
      {
        property: 'og:title',
        content: `${eventTitle}｜那須町のイベント | NasuNest`,
      },
      {
        property: 'og:description',
        content: eventDescription,
      },
      {
        property: 'og:image',
        content: eventImage,
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
        content: eventTitle,
      },
      {
        property: 'og:url',
        content: eventUrl,
      },
      {
        property: 'og:type',
        content: 'event',
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
        content: `${eventTitle}｜那須町のイベント | NasuNest`,
      },
      {
        name: 'twitter:description',
        content: eventDescription,
      },
      {
        name: 'twitter:image',
        content: eventImage,
      },
    ]

    // イベント開始時刻
    if (startTime) {
      metaTags.push({
        property: 'event:start_time',
        content: startTime,
      })
    }

    // イベント終了時刻
    if (endTime) {
      metaTags.push({
        property: 'event:end_time',
        content: endTime,
      })
    }

    // イベント場所
    if (location) {
      metaTags.push({
        property: 'event:location',
        content: location,
      })
    }

    return metaTags
  }),
  link: computed(() => [
    {
      rel: 'canonical',
      href: `${baseUrl}/events/${eventId.value}`,
    },
  ]),
  script: computed(() => {
    if (!event.value) return []

    // 構造化データ（JSON-LD）を追加
    const eventSchema = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.value.title,
      description:
        extractTextFromEditorJS(event.value.body) || '那須町のイベント情報',
      startDate: event.value.start_date,
      endDate: event.value.end_date || event.value.start_date,
      image: event.value.thumbnail || `${baseUrl}/img/title-logo.png`,
      location: event.value.location_name
        ? {
            '@type': 'Place',
            name: event.value.location_name,
            address: event.value.location_address
              ? {
                  '@type': 'PostalAddress',
                  streetAddress: event.value.location_address,
                }
              : undefined,
          }
        : undefined,
      organizer: {
        '@type': 'Organization',
        name: 'NasuNest',
        url: baseUrl,
      },
      url: `${baseUrl}/events/${eventId.value}`,
    }

    return [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(eventSchema),
      },
    ]
  }),
})

const showCtaButton = computed(() => {
  return (
    event.value?.status !== 'recruitment_closed' &&
    event.value?.status !== 'closed'
  )
})
</script>
