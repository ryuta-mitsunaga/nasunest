<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <UButton variant="soft" :to="`/admin/forms/${formId}`" class="mb-4">
        <UIcon name="i-heroicons-arrow-left" />
        フォーム詳細に戻る
      </UButton>
      <h1 class="text-3xl font-bold">フォーム回答一覧（回答待ち）</h1>
    </div>

    <div v-if="loading" class="text-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
    </div>

    <UCard v-else>
      <template #header>
        <h2 class="text-xl font-semibold">
          回答待ち: {{ answers.length }}件
        </h2>
      </template>
      <div class="p-6">
        <div
          v-if="answers.length === 0"
          class="text-center py-8 text-gray-400"
        >
          回答待ちの申し込みはありません
        </div>
        <UTable v-else :data="answers" :columns="columns" class="w-full">
          <template #no-cell="{ row }">
            {{ answers.indexOf(row.original) + 1 }}
          </template>

          <template #id-cell="{ row }">
            <NuxtLink
              :to="`/admin/forms/${formId}/answers/${row.original.id}`"
              class="text-primary hover:underline font-medium"
            >
              #{{ row.original.id }}
            </NuxtLink>
          </template>

          <template #createdAt-cell="{ row }">
            <span class="text-xs text-gray-500">
              {{ formatDate(row.original.createdAt) }}
            </span>
          </template>

          <template #event_id-cell="{ row }">
            {{ row.original.event_id || 'なし' }}
          </template>

          <template #user_id-cell="{ row }">
            {{ row.original.user_id || 'なし' }}
          </template>

          <template #actions-cell="{ row }">
            <div class="flex gap-2 flex-wrap">
              <UButton
                color="primary"
                variant="soft"
                size="sm"
                :to="`/admin/forms/${formId}/answers/${row.original.id}`"
              >
                詳細
              </UButton>
              <UButton
                color="success"
                variant="soft"
                size="sm"
                @click="handleApprove(row.original.id)"
                :loading="processingAnswerId === row.original.id"
              >
                承認
              </UButton>
              <UButton
                color="error"
                variant="soft"
                size="sm"
                @click="handleReject(row.original.id)"
                :loading="processingAnswerId === row.original.id"
              >
                却下
              </UButton>
            </div>
          </template>
        </UTable>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  layout: 'admin',
})

interface FormAnswer {
  id: number
  form_id: number
  event_id: number | null
  user_id: number | null
  date: Date
  content: Record<string, any>
  status: number | null
  createdAt: Date
}

const route = useRoute()
const formId = computed(() => {
  const id = route.params.id
  if (Array.isArray(id)) {
    return id[0] || ''
  }
  return id || ''
})

const loading = ref(true)
const answers = ref<FormAnswer[]>([])
const processingAnswerId = ref<number | null>(null)
const { success: toastSuccess, error: toastError } = useCustomToast()

const columns: TableColumn<FormAnswer>[] = [
  { accessorKey: 'no', header: 'No.' },
  { accessorKey: 'id', header: '回答ID' },
  { accessorKey: 'createdAt', header: '回答日時' },
  { accessorKey: 'event_id', header: 'イベントID' },
  { accessorKey: 'user_id', header: 'ユーザーID' },
  { accessorKey: 'actions', header: '操作' },
]

const fetchAnswers = async () => {
  loading.value = true
  try {
    const response = await $fetch<{
      success: boolean
      data: FormAnswer[]
    }>(`/api/forms/${formId.value}/answers?status=0`, {
      credentials: 'include',
    })
    answers.value = response.data || []
  } catch (error) {
    console.error('回答取得エラー:', error)
    toastError('回答の取得に失敗しました')
  } finally {
    loading.value = false
  }
}

const handleApprove = async (answerId: number) => {
  processingAnswerId.value = answerId
  try {
    await $fetch(`/api/admin/forms/${formId.value}/answers/${answerId}`, {
      method: 'PUT',
      credentials: 'include',
      body: {
        status: 1, // OK
      },
    })
    toastSuccess('承認しました')
    await fetchAnswers()
  } catch (error) {
    console.error('承認エラー:', error)
    toastError('承認に失敗しました')
  } finally {
    processingAnswerId.value = null
  }
}

const handleReject = async (answerId: number) => {
  processingAnswerId.value = answerId
  try {
    await $fetch(`/api/admin/forms/${formId.value}/answers/${answerId}`, {
      method: 'PUT',
      credentials: 'include',
      body: {
        status: 2, // NG
      },
    })
    toastSuccess('却下しました')
    await fetchAnswers()
  } catch (error) {
    console.error('却下エラー:', error)
    toastError('却下に失敗しました')
  } finally {
    processingAnswerId.value = null
  }
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  fetchAnswers()
})
</script>

