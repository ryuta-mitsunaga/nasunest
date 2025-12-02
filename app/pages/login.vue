<template>
  <div
    class="min-h-screen bg-page-bg flex items-center justify-center py-12 px-4"
  >
    <div class="w-full max-w-md">
      <!-- ロゴ -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block">
          <img
            src="/img/title-logo.png"
            alt="NasuNestタイトルロゴ"
            class="w-32 md:w-40 mx-auto hover:opacity-70 transition-opacity"
          />
        </NuxtLink>
      </div>

      <!-- ログインフォーム -->
      <UCard class="shadow-lg">
        <template #header>
          <h1
            class="text-2xl font-bold text-center"
            style="color: #2e5e3e; font-family: 'Kosugi Maru', sans-serif"
          >
            ログイン
          </h1>
        </template>

        <UForm :state="form" @submit="onSubmit" class="space-y-6">
          <UFormField label="メールアドレス" name="email" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="example@email.com"
              size="lg"
            />
          </UFormField>

          <UFormField label="パスワード" name="password" required>
            <UInput
              v-model="form.password"
              type="password"
              placeholder="パスワード"
              size="lg"
            />
          </UFormField>

          <UButton
            type="submit"
            block
            size="lg"
            :loading="authLoading"
            :disabled="authLoading"
            style="background-color: #2e5e3e; color: white"
            class="hover:opacity-80 transition-opacity"
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

        <!-- 登録ページへのリンク -->
        <div class="mt-6 text-center space-y-2">
          <p class="text-sm" style="color: #2e5e3e">
            アカウントをお持ちでない方は
            <NuxtLink
              to="/register"
              class="underline hover:opacity-70 transition-opacity"
            >
              こちらから登録
            </NuxtLink>
          </p>
          <NuxtLink
            to="/"
            class="text-sm hover:opacity-70 transition-opacity block"
            style="color: #2e5e3e"
          >
            トップページに戻る
          </NuxtLink>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { login, loading: authLoading } = useAuth()
const route = useRoute()

const form = reactive({
  email: '',
  password: '',
})

const error = ref('')

const onSubmit = async () => {
  error.value = ''

  const result = await login(form.email, form.password)

  if (result.success) {
    // ログイン成功後、トップページまたは元のページにリダイレクト
    const redirectTo = route.query.redirect as string | undefined
    await navigateTo(redirectTo || '/')
  } else {
    error.value = result.error || 'ログインに失敗しました'
  }
}
</script>

<style scoped>
/* カスタムスタイルは必要に応じて追加 */
</style>
