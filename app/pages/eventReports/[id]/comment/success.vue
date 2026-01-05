<template>
  <div class="container mx-auto p-6">
    <UCard class="text-center">
      <div class="py-12">
        <UIcon
          name="i-heroicons-check-circle"
          class="text-6xl text-green-500 mx-auto mb-4"
        />
        <h2 class="text-2xl font-bold mb-2" style="color: #2e5e3e">
          コメント送信完了
        </h2>
        <p class="text-gray-600 mb-6">ご協力ありがとうございました。</p>
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
