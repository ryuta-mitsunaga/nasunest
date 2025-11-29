<template>
  <div ref="categorySelectorRef" class="space-y-2 relative">
    <!-- 選択されたカテゴリのラベル表示 -->
    <div v-if="selectedCategories.length > 0" class="flex flex-wrap gap-2 mb-2">
      <div
        v-for="category in selectedCategories"
        :key="category.id"
        class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300"
      >
        <span>{{ category.name }}</span>
        <UIcon
          name="i-heroicons-x-mark"
          class="w-3 h-3 cursor-pointer hover:opacity-70"
          @click="removeCategory(category.id)"
        />
      </div>
    </div>

    <!-- 入力ボックスとサジェスト -->
    <div ref="inputContainerRef" class="relative">
      <UInput
        v-model="searchQuery"
        placeholder="カテゴリを検索または追加"
        @input="handleInput"
        @focus="showSuggestions = true"
        @keydown.escape="showSuggestions = false"
      />

      <!-- サジェストドロップダウン -->
      <div
        v-if="
          showSuggestions &&
          (filteredCategories.length > 0 || searchQuery.trim())
        "
        ref="suggestionsRef"
        class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <!-- 既存カテゴリのサジェスト -->
        <div
          v-for="category in filteredCategories"
          :key="category.id"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          @click="selectCategory(category)"
        >
          <span>{{ category.name }}</span>
        </div>

        <!-- 新規カテゴリ追加オプション -->
        <div
          v-if="searchQuery.trim() && !exactMatch"
          class="px-4 py-2 hover:bg-blue-50 cursor-pointer border-t border-gray-200 flex items-center gap-2 text-blue-600"
          @click="addNewCategory"
        >
          <UIcon name="i-heroicons-plus" class="w-4 h-4" />
          <span>「{{ searchQuery.trim() }}」を追加</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

interface Category {
  id: number
  name: string
}

interface Props {
  categories: Category[]
  selectedCategoryIds: number[]
}

interface Emits {
  (e: 'update:selectedCategoryIds', ids: number[]): void
  (e: 'add-category', name: string): Promise<Category>
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchQuery = ref('')
const showSuggestions = ref(false)

// 選択されたカテゴリ
const selectedCategories = computed(() => {
  return props.categories.filter(cat =>
    props.selectedCategoryIds.includes(cat.id)
  )
})

// フィルタリングされたカテゴリ（検索クエリに一致する、かつ未選択のもの）
const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.categories.filter(
      cat => !props.selectedCategoryIds.includes(cat.id)
    )
  }

  const query = searchQuery.value.toLowerCase().trim()
  return props.categories.filter(
    cat =>
      !props.selectedCategoryIds.includes(cat.id) &&
      cat.name.toLowerCase().includes(query)
  )
})

// 完全一致チェック
const exactMatch = computed(() => {
  if (!searchQuery.value.trim()) return false
  const query = searchQuery.value.trim()
  return props.categories.some(
    cat => cat.name.toLowerCase() === query.toLowerCase()
  )
})

const handleInput = () => {
  if (searchQuery.value.trim()) {
    showSuggestions.value = true
  }
}

const handleEnter = () => {
  if (filteredCategories.value.length > 0 && filteredCategories.value[0]) {
    selectCategory(filteredCategories.value[0])
  } else if (searchQuery.value.trim() && !exactMatch.value) {
    addNewCategory()
  }
}

const selectCategory = (category: Category) => {
  if (!props.selectedCategoryIds.includes(category.id)) {
    const newIds = [...props.selectedCategoryIds, category.id]
    emit('update:selectedCategoryIds', newIds)
  }
  searchQuery.value = ''
  showSuggestions.value = false
}

const removeCategory = (categoryId: number) => {
  const newIds = props.selectedCategoryIds.filter(id => id !== categoryId)
  emit('update:selectedCategoryIds', newIds)
}

const addNewCategory = async () => {
  const categoryName = searchQuery.value.trim()
  if (!categoryName) return

  try {
    // 親コンポーネントのhandleAddCategoryを呼び出し
    const result = await emit('add-category', categoryName)

    // emitの戻り値は配列なので、最初の要素を取得
    let newCategory: Category | null = null
    if (Array.isArray(result)) {
      newCategory = result[0] as Category
    } else if (result && typeof result === 'object' && 'id' in result) {
      newCategory = result as Category
    }

    if (newCategory) {
      // カテゴリを選択状態にする
      const newIds = [...props.selectedCategoryIds, newCategory.id]
      emit('update:selectedCategoryIds', newIds)
      searchQuery.value = ''
      showSuggestions.value = false
    }
  } catch (error) {
    console.error('カテゴリ追加エラー:', error)
  }
}

// 外部クリックでサジェストを閉じる
const categorySelectorRef = ref<HTMLElement | null>(null)
const inputContainerRef = ref<HTMLElement | null>(null)
const suggestionsRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement

  // カテゴリセレクター全体、入力コンテナ、サジェストドロップダウンのいずれにも含まれていない場合
  const isOutside =
    categorySelectorRef.value &&
    inputContainerRef.value &&
    !categorySelectorRef.value.contains(target) &&
    !inputContainerRef.value.contains(target) &&
    !(suggestionsRef.value && suggestionsRef.value.contains(target))

  if (isOutside) {
    showSuggestions.value = false
  }
}

onMounted(() => {
  // 少し遅延させて、イベントリスナーを追加（他のクリックイベントと競合しないように）
  nextTick(() => {
    document.addEventListener('click', handleClickOutside, true)
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<style scoped>
/* カスタムスタイルがあれば追加 */
</style>
