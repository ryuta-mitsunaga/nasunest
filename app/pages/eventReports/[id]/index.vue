<template>
  <div class="relative text-neutral-900">
    <NuxtLink
      to="/eventReports"
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
      <span>イベントレポート一覧に戻る</span>
    </NuxtLink>
    <template v-if="eventReport">
      <div class="mb-6">
        <!-- 作成日時 -->
        <div class="text-xs text-gray-500">
          {{ formatDateTime(eventReport.createdAt) }}
        </div>
        <!-- 関連イベント情報 -->
        <div
          v-if="eventReport.event"
          class="mb-4 text-gray-500 underline text-sm"
          style="text-decoration-skip-ink: none; text-underline-offset: 3px"
        >
          <NuxtLink
            :to="`/events/${eventReport.event.id}`"
            class="inline-flex items-center gap-1.5"
          >
            <span class="">{{ eventReport.event.title }}</span>
          </NuxtLink>
        </div>
        <UiPageTitle :title="eventReport.title || 'イベントレポート詳細'" />
      </div>

      <div v-if="loading" class="text-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p>{{ error }}</p>
      </div>

      <div
        v-else-if="eventReport"
        class="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm"
      >
        <!-- サムネイル画像 -->
        <div
          v-if="eventReport.thumbnail"
          class="relative w-full overflow-hidden"
          style="aspect-ratio: 1.618 / 1"
        >
          <img
            :src="eventReport.thumbnail"
            :alt="eventReport.title"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- イベントレポート情報 -->
        <div class="p-6 md:p-8 space-y-6">
          <!-- 本文（body_htmlでSSR、未変換時はEditorJSにフォールバック） -->
          <div v-if="eventReport.body_html">
            <EditorJsHtmlViewer :html="eventReport.body_html" />
          </div>
          <div v-else-if="parsedBody">
            <AdminEditorJsEditor :data="parsedBody" :read-only="true" />
          </div>
        </div>
      </div>

      <!-- 参加者のコメント -->
      <div v-if="!loading && !error" class="mt-8">
        <h2 class="mb-4 text-lg font-semibold text-neutral-900">参加者の声</h2>
        <div v-if="commentsLoading" class="text-center py-6">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl" />
        </div>
        <div
          v-else-if="comments.length === 0"
          class="text-center py-6 text-gray-400 text-sm"
        >
          コメントはまだありません
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="flex items-start gap-2"
          >
            <!-- アバター -->
            <div class="flex-shrink-0">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-white',
                  getAvatarClass(comment.sex),
                ]"
              >
                <UIcon :name="getAvatarIcon(comment.sex)" class="w-4 h-4" />
              </div>
            </div>

            <!-- コメント内容 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-sm font-medium text-neutral-900">
                  {{ comment.name }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <span v-if="comment.age">{{ comment.age }}</span>
                <span v-if="comment.sex">
                  {{
                    comment.sex === 'male'
                      ? '男性'
                      : comment.sex === 'female'
                        ? '女性'
                        : 'その他'
                  }}
                </span>
                <span v-if="comment.area">{{ comment.area }}</span>
              </div>
              <div
                class="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap break-words"
              >
                {{ comment.comment }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="text-center py-12">
        <p>イベントレポートが見つかりません</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { EventReport } from '~/components/events/EventReportCard.vue'

const route = useRoute()
const eventReportId = computed(() => {
  const id = route.params.id
  if (Array.isArray(id)) {
    return id[0] || ''
  }
  return id || ''
})

interface EventReportComment {
  id: number
  event_id: number
  email: string
  name: string
  age: string | null
  sex: string | null
  area: string
  comment: string
  createdAt: string
}

const loading = ref(true)
const error = ref('')
const eventReport = ref<EventReport | null>(null)
const comments = ref<EventReportComment[]>([])
const commentsLoading = ref(true)

const parsedBody = computed(() => {
  if (!eventReport.value?.body) return null
  try {
    return typeof eventReport.value.body === 'string'
      ? JSON.parse(eventReport.value.body)
      : eventReport.value.body
  } catch {
    return null
  }
})

const { data } = await useFetch<{ success: boolean; data: EventReport }>(
  `/api/public/event-reports/${eventReportId.value}`
)

if (data.value?.success && data.value.data) {
  eventReport.value = data.value.data
} else {
  error.value = 'イベントレポートが見つかりません'
}

loading.value = false

// コメント取得
const { data: commentsData } = await useFetch<{
  success: boolean
  data: EventReportComment[]
}>(`/api/public/event-reports/${eventReportId.value}/comments`, {
  default: () => ({ success: true, data: [] }),
})

if (commentsData.value?.success && commentsData.value.data) {
  comments.value = commentsData.value.data
}

commentsLoading.value = false

const baseUrl = 'https://www.nasunest.com'

// SEO設定
useHead({
  title: computed(() => eventReport.value?.title || 'イベントレポート詳細'),
  meta: computed(() => [
    {
      name: 'description',
      content:
        eventReport.value?.title || '那須町のイベントレポート詳細ページです。',
    },
    {
      name: 'keywords',
      content: [
        '那須',
        '那須町',
        'イベント',
        'イベントレポート',
        eventReport.value?.title,
        'NasuNest',
      ]
        .filter(Boolean)
        .join(','),
    },
    {
      property: 'og:title',
      content: `${
        eventReport.value?.title || 'イベントレポート詳細'
      } | NasuNest`,
    },
    {
      property: 'og:description',
      content:
        eventReport.value?.title || '那須町のイベントレポート詳細ページです。',
    },
    {
      property: 'og:image',
      content: eventReport.value?.thumbnail || `${baseUrl}/img/title-logo.png`,
    },
    {
      property: 'og:url',
      content: `${baseUrl}/eventReports/${eventReportId.value}`,
    },
    { property: 'og:type', content: 'article' },
  ]),
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getAvatarIcon = (sex: string | null) => {
  if (sex === 'male') {
    return 'i-heroicons-user'
  } else if (sex === 'female') {
    return 'i-heroicons-user'
  }
  return 'i-heroicons-user-circle'
}

const getAvatarClass = (sex: string | null) => {
  if (sex === 'male') {
    return 'bg-blue-500'
  } else if (sex === 'female') {
    return 'bg-pink-500'
  }
  return 'bg-gray-400'
}
</script>
