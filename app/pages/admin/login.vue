<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-center">管理者ログイン</h1>
      </template>

      <UForm :state="form" @submit="onSubmit" class="space-y-4">
        <UFormField label="ID" name="id" required>
          <UInput v-model="form.id" placeholder="管理者ID" />
        </UFormField>

        <UFormField label="パスワード" name="password" required>
          <UInput
            v-model="form.password"
            type="password"
            placeholder="パスワード"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          :loading="loading"
          :disabled="loading"
        >
          ログイン
        </UButton>
      </UForm>

      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        :title="error"
        class="mt-4"
      />
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const form = reactive({
  id: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

const onSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/admin/login', {
      method: 'POST',
      body: form,
    })

    if ((response as any).success) {
      await navigateTo('/admin')
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'ログインに失敗しました'
  } finally {
    loading.value = false
  }
}
</script>

