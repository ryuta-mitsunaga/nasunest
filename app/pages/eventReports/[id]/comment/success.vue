<template>
  <div class="mx-auto max-w-lg px-4 py-6">
    <UCard class="border border-neutral-200/90 text-center shadow-sm">
      <div class="py-12">
        <UIcon
          name="i-heroicons-check-circle"
          class="mx-auto mb-4 text-6xl text-neutral-600"
        />
        <h2 class="mb-2 text-2xl font-bold text-neutral-900">コメント送信完了</h2>
        <p class="mb-6 text-neutral-600">ご協力ありがとうございました。</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.params.id as string)
const token = computed(() => {
  const queryToken = route.query.token
  if (typeof queryToken === 'string') {
    return queryToken
  }
  return ''
})

// トークンがない場合はエラー
if (!token.value) {
  throw createError({
    statusCode: 400,
    message: 'トークンが指定されていません',
  })
}
</script>
