<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">フォーム管理</h1>
      <UButton to="/admin/forms/create">新規作成</UButton>
    </div>

    <UCard>
      <div v-if="loading" class="text-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
      </div>

      <UTable v-else :data="forms" :columns="columns" class="w-full">
        <template #id-cell="{ row }">
          {{ forms.indexOf(row.original) + 1 }}
        </template>
        <template #published_start-cell="{ row }">
          {{ formatDate(row.original.published_start) }}
        </template>
        <template #published_end-cell="{ row }">
          {{ formatDate(row.original.published_end) }}
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton
              color="primary"
              variant="soft"
              size="sm"
              :to="`/admin/forms/${row.original.id}`"
            >
              詳細
            </UButton>
            <UButton
              color="primary"
              variant="soft"
              size="sm"
              :to="`/admin/forms/${row.original.id}/edit`"
            >
              編集
            </UButton>
            <UButton
              color="secondary"
              variant="soft"
              size="sm"
              @click="handleCopy(row.original.id)"
            >
              コピー
            </UButton>
            <UButton
              color="error"
              variant="soft"
              size="sm"
              @click="handleDelete(row.original.id)"
            >
              削除
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  layout: 'admin',
})

interface Form {
  id: number
  name: string
  content: {
    fields: any[]
  }
  published_start: string | null
  published_end: string | null
  createdAt: string
}

const forms = ref<Form[]>([])
const loading = ref(true)

const columns: TableColumn<Form>[] = [
  { accessorKey: 'id', header: 'No.' },
  { accessorKey: 'name', header: 'フォーム名' },
  { accessorKey: 'published_start', header: '公開開始日' },
  { accessorKey: 'published_end', header: '公開終了日' },
  { accessorKey: 'createdAt', header: '作成日' },
  { accessorKey: 'actions', header: '操作' },
]

const fetchForms = async () => {
  loading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: Form[] }>(
      '/api/forms',
      {
        credentials: 'include',
      }
    )
    forms.value = response.data || []
  } catch (error) {
    console.error('フォーム取得エラー:', error)
  } finally {
    loading.value = false
  }
}

const { success: toastSuccess, error: toastError } = useCustomToast()
const { confirm } = useConfirm()

const handleCopy = async (id: number) => {
  try {
    await $fetch(`/api/forms/${id}/copy`, {
      method: 'POST',
      credentials: 'include',
    })
    await fetchForms()
    toastSuccess('フォームをコピーしました')
  } catch (error) {
    console.error('コピーエラー:', error)
    toastError('コピーに失敗しました')
  }
}

const handleDelete = async (id: number) => {
  const confirmed = await confirm({
    message: '本当に削除しますか？',
    type: 'danger',
    confirmText: '削除',
    cancelText: 'キャンセル',
  })
  if (!confirmed) return

  try {
    await $fetch(`/api/forms/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await fetchForms()
    toastSuccess('フォームを削除しました')
  } catch (error) {
    console.error('削除エラー:', error)
    toastError('削除に失敗しました')
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  fetchForms()
})
</script>
