<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">設定</h1>
      <p class="text-gray-600 mt-2">管理画面の設定を行います。</p>
    </div>

    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">アカウント</h2>
      </template>

      <div class="p-6">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="font-medium text-gray-900">ログアウト</p>
            <p class="text-sm text-gray-600">
              管理者アカウントからログアウトします。
            </p>
          </div>
          <UButton color="error" :loading="loading" @click="handleLogout">
            <UIcon
              name="i-heroicons-arrow-right-on-rectangle"
              class="w-4 h-4 mr-2"
            />
            ログアウト
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const loading = ref(false)

const handleLogout = async () => {
  loading.value = true
  try {
    await $fetch('/api/admin/logout', { method: 'POST' })
    await navigateTo('/admin/login')
  } catch (error) {
    console.error('ログアウトエラー:', error)
  } finally {
    loading.value = false
  }
}
</script>
