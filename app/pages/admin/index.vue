<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">管理画面</h1>
      <p class="text-gray-600 mt-2">各種管理機能にアクセスできます</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- メンバー管理カード -->
      <UCard
        class="hover:shadow-lg transition-shadow cursor-pointer"
        @click="navigateTo('/admin/member')"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-users" class="text-2xl text-blue-600" />
            <h2 class="text-xl font-semibold">メンバー管理</h2>
          </div>
        </template>
        <div class="p-4">
          <p class="text-gray-600">
            地域おこし協力隊のメンバー情報を管理します。メンバーの追加、編集、削除が可能です。
          </p>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <UButton color="primary" variant="soft">
              管理画面へ
              <UIcon name="i-heroicons-arrow-right" class="ml-2" />
            </UButton>
          </div>
        </template>
      </UCard>

      <!-- フォーム管理カード -->
      <UCard
        class="hover:shadow-lg transition-shadow cursor-pointer"
        @click="navigateTo('/admin/forms')"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon
              name="i-heroicons-document-text"
              class="text-2xl text-green-600"
            />
            <h2 class="text-xl font-semibold">フォーム管理</h2>
          </div>
        </template>
        <div class="p-4">
          <p class="text-gray-600">
            各種フォームの設定と管理を行います。フォームの作成、編集、削除が可能です。
          </p>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <UButton color="primary" variant="soft">
              管理画面へ
              <UIcon name="i-heroicons-arrow-right" class="ml-2" />
            </UButton>
          </div>
        </template>
      </UCard>

      <!-- イベント管理カード -->
      <UCard
        class="hover:shadow-lg transition-shadow cursor-pointer"
        @click="navigateTo('/admin/events')"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon
              name="i-heroicons-calendar"
              class="text-2xl text-purple-600"
            />
            <h2 class="text-xl font-semibold">イベント管理</h2>
          </div>
        </template>
        <div class="p-4">
          <p class="text-gray-600">
            イベント情報を管理します。イベントの作成、編集、削除が可能です。
          </p>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <UButton color="primary" variant="soft">
              管理画面へ
              <UIcon name="i-heroicons-arrow-right" class="ml-2" />
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})
</script>
