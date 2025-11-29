<template>
  <div>
    <slot />
    <!-- 無限スクロール用のトリガー要素 -->
    <div
      v-if="hasMore"
      ref="loadMoreTrigger"
      class="flex justify-center items-center py-8 min-h-[100px]"
    >
      <div v-if="loading" class="flex items-center gap-2">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
        <span v-if="loadingText" class="text-sm" :style="{ color: loadingTextColor }">
          {{ loadingText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

interface Props {
  hasMore: boolean
  loading?: boolean
  loadingText?: string
  loadingTextColor?: string
  rootMargin?: string
}

interface Emits {
  (e: 'load-more'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingText: '読み込み中...',
  loadingTextColor: '#8c5a3c',
  rootMargin: '200px',
})

const emit = defineEmits<Emits>()

const loadMoreTrigger = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null

const setupObserver = async () => {
  if (!process.client) return

  // 既存のobserverをクリーンアップ
  if (observer) {
    observer.disconnect()
    observer = null
  }

  // DOM更新を待つ
  await nextTick()

  if (!loadMoreTrigger.value || !props.hasMore) {
    return
  }

  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && props.hasMore && !props.loading) {
          emit('load-more')
        }
      })
    },
    {
      rootMargin: props.rootMargin,
      threshold: 0.1,
    }
  )

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value)
  }
}

onMounted(() => {
  setupObserver()
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

// loadMoreTriggerが変更されたときに再監視
watch(loadMoreTrigger, async () => {
  await setupObserver()
})

// hasMoreが変更されたときに再監視
watch(
  () => props.hasMore,
  async (newVal) => {
    if (newVal) {
      await setupObserver()
    } else if (observer) {
      observer.disconnect()
      observer = null
    }
  }
)

// loadingがfalseになったときに再監視（読み込み完了後）
watch(
  () => props.loading,
  async (newVal) => {
    if (!newVal && props.hasMore) {
      await nextTick()
      await setupObserver()
    }
  }
)
</script>

