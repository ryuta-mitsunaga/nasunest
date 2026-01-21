<template>
  <UCard class="mb-6">
    <template #header>
      <div
        class="flex items-center justify-between cursor-pointer"
        @click="toggleOpen()"
      >
        <h3 class="text-lg font-semibold">イベントを検索</h3>
        <UIcon
          :name="isOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
          class="w-5 h-5 transition-transform"
        />
      </div>
    </template>

    <Transition name="slide-down">
      <div v-if="isOpen" class="space-y-4">
        <!-- フリーワード検索 -->
        <UFormField label="キーワード検索" name="keyword">
          <UInput
            v-model="searchForm.keyword"
            placeholder="イベント名、説明で検索"
            @input="handleSearch"
          >
          </UInput>
        </UFormField>

        <!-- カテゴリ選択 -->
        <UFormField label="カテゴリ" name="categories">
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="category in categories"
              :key="category.id"
              :variant="isCategorySelected(category.id) ? 'solid' : 'soft'"
              :color="isCategorySelected(category.id) ? 'primary' : 'neutral'"
              size="sm"
              @click="toggleCategory(category.id)"
            >
              {{ category.name }}
            </UButton>
          </div>
        </UFormField>

        <!-- 開催日絞り込み -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="開催開始日（以降）" name="startDate">
            <UInput
              v-model="searchForm.startDate"
              type="date"
              placeholder="開始日"
              @change="handleSearch"
            />
          </UFormField>

          <UFormField label="開催終了日（以前）" name="endDate">
            <UInput
              v-model="searchForm.endDate"
              type="date"
              placeholder="終了日"
              @change="handleSearch"
            />
          </UFormField>
        </div>

        <!-- イベント表示オプション -->
        <div class="space-y-2">
          <UCheckbox
            v-model="searchForm.onlyOpen"
            label="募集中のイベントのみ"
            @update:model-value="handleSearch"
          />
        </div>

        <!-- 検索条件リセット -->
        <div v-if="hasActiveFilters" class="flex justify-end">
          <UButton variant="soft" size="sm" @click="resetFilters">
            検索条件をリセット
          </UButton>
        </div>

        <!-- 条件にマッチしたイベントの総数 -->
        <div class="pt-2 border-t border-gray-200">
          <p class="text-sm text-gray-600">
            条件にマッチしたイベント:
            <span class="font-semibold">{{ total }}</span
            >件
          </p>
        </div>
      </div>
    </Transition>
  </UCard>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onBeforeUnmount } from 'vue'

interface Category {
  id: number
  name: string
}

interface Props {
  categories: Category[]
  displayCount?: number
  total?: number
}

interface Emits {
  (
    e: 'search',
    filters: {
      keyword: string
      categoryIds: number[]
      startDate?: string
      endDate?: string
      onlyOpen?: boolean
    }
  ): void
}

const props = withDefaults(defineProps<Props>(), {
  displayCount: 0,
  total: 0,
})

const emit = defineEmits<Emits>()

const isOpen = ref(true)

const searchForm = reactive({
  keyword: '',
  categoryIds: [] as number[],
  startDate: '',
  endDate: '',
  onlyOpen: false,
})

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const isCategorySelected = (categoryId: number) => {
  return searchForm.categoryIds.includes(categoryId)
}

const toggleCategory = (categoryId: number) => {
  if (isCategorySelected(categoryId)) {
    searchForm.categoryIds = searchForm.categoryIds.filter(
      id => id !== categoryId
    )
  } else {
    searchForm.categoryIds.push(categoryId)
  }
  handleSearch()
}

const hasActiveFilters = computed(() => {
  return (
    searchForm.keyword.trim() !== '' ||
    searchForm.categoryIds.length > 0 ||
    searchForm.startDate !== '' ||
    searchForm.endDate !== '' ||
    searchForm.onlyOpen
  )
})

const resetFilters = () => {
  searchForm.keyword = ''
  searchForm.categoryIds = []
  searchForm.startDate = ''
  searchForm.endDate = ''
  searchForm.onlyOpen = false
  handleSearch()
}

// デバウンス処理
let searchTimeout: NodeJS.Timeout | null = null

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    emit('search', {
      keyword: searchForm.keyword.trim(),
      categoryIds: searchForm.categoryIds,
      startDate: searchForm.startDate || undefined,
      endDate: searchForm.endDate || undefined,
      onlyOpen: searchForm.onlyOpen || undefined,
    })
  }, 800)
}

onBeforeUnmount(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

<style scoped>
/* スライドダウンアニメーション */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
  overflow: hidden;
}

.slide-down-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}

.slide-down-leave-from {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}

.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
</style>
