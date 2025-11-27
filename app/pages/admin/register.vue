<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-center">管理者登録</h1>
      </template>

      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        :title="error"
        class="mb-4"
      />

      <UForm :state="form" @submit="onSubmit" class="space-y-4">
        <UFormField label="ログインID" name="login_id" required>
          <UInput
            v-model="form.login_id"
            placeholder="管理者ID"
            :disabled="loading || !isTokenValid"
          />
        </UFormField>

        <UFormField label="パスワード" name="password" required>
          <UInput
            v-model="form.password"
            type="password"
            placeholder="パスワード"
            :disabled="loading || !isTokenValid"
          />
        </UFormField>

        <UFormField label="パスワード（確認）" name="password_confirm" required>
          <UInput
            v-model="form.password_confirm"
            type="password"
            placeholder="パスワード（確認）"
            :disabled="loading || !isTokenValid"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          :loading="loading"
          :disabled="loading || !isTokenValid"
        >
          登録
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useCustomToast } from '~/composables/useToast'

definePageMeta({
  layout: false,
})

const toast = useCustomToast()
const route = useRoute()

const form = reactive({
  login_id: '',
  password: '',
  password_confirm: '',
})

const loading = ref(false)
const error = ref('')
const isTokenValid = ref(false)

// トークンの検証
const verifyToken = async () => {
  const token = route.query.token as string

  if (!token) {
    showError({
      statusCode: 400,
      statusMessage: '招待トークンが指定されていません',
    })
    return
  }

  try {
    const response = await $fetch<{
      success: boolean
      data: {
        valid: boolean
        invitation: any
      }
    }>(`/api/admin/invitations/verify?token=${token}`)

    if (response.success && response.data.valid) {
      isTokenValid.value = true
    } else {
      showError({
        statusCode: 400,
        statusMessage: '無効な招待トークンです',
      })
    }
  } catch (err: any) {
    showError({
      statusCode: err.statusCode || 400,
      statusMessage: err.statusMessage || '無効な招待トークンです',
    })
  }
}

// ページ読み込み時にトークンを検証
onMounted(() => {
  verifyToken()
})

const onSubmit = async () => {
  loading.value = true
  error.value = ''

  // バリデーション
  if (!form.login_id || !form.password || !form.password_confirm) {
    error.value = 'すべての項目を入力してください'
    loading.value = false
    return
  }

  if (form.password !== form.password_confirm) {
    error.value = 'パスワードが一致しません'
    loading.value = false
    return
  }

  if (form.password.length < 8) {
    error.value = 'パスワードは8文字以上で入力してください'
    loading.value = false
    return
  }

  const token = route.query.token as string
  if (!token) {
    error.value = '招待トークンが指定されていません'
    loading.value = false
    return
  }

  try {
    const response = await $fetch('/api/admin/register', {
      method: 'POST',
      body: {
        token,
        login_id: form.login_id,
        password: form.password,
      },
    })

    if ((response as any).success) {
      toast.success('管理者登録が完了しました')
      await navigateTo('/admin/login')
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || '登録に失敗しました'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>
