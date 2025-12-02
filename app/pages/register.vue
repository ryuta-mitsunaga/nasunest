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

      <!-- 登録フォーム -->
      <UCard class="shadow-lg">
        <template #header>
          <h1
            class="text-2xl font-bold text-center"
            style="color: #2e5e3e; font-family: 'Kosugi Maru', sans-serif"
          >
            ユーザー登録
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
              placeholder="8文字以上"
              size="lg"
            />
          </UFormField>

          <UFormField
            label="パスワード（再入力）"
            name="passwordConfirm"
            required
            :error="passwordMismatch ? 'パスワードが一致しません' : undefined"
          >
            <UInput
              v-model="form.passwordConfirm"
              type="password"
              placeholder="パスワードを再入力"
              size="lg"
            />
          </UFormField>

          <UFormField label="性" name="name_sei" required>
            <UInput v-model="form.name_sei" placeholder="山田" size="lg" />
          </UFormField>

          <UFormField label="名" name="name_mei" required>
            <UInput v-model="form.name_mei" placeholder="太郎" size="lg" />
          </UFormField>

          <UFormField label="表示名" name="display_name" required>
            <UInput
              v-model="form.display_name"
              placeholder="やまだ たろう"
              size="lg"
            />
          </UFormField>

          <UFormField label="年齢" name="age">
            <UInput
              v-model.number="form.age"
              type="number"
              placeholder="30"
              size="lg"
              :min="0"
              :max="150"
            />
          </UFormField>

          <UFormField label="郵便番号" name="postal_code">
            <div class="flex gap-2">
              <UInput
                v-model="form.postal_code"
                placeholder="329-3211"
                size="lg"
                @blur="handlePostalCodeBlur"
                @input="handlePostalCodeInput"
                class="flex-1"
              />
              <UButton
                type="button"
                size="lg"
                :loading="postalCodeLoading"
                :disabled="!form.postal_code || postalCodeLoading"
                @click="searchPostalCode"
                style="background-color: #2e5e3e; color: white"
              >
                検索
              </UButton>
            </div>
          </UFormField>

          <UFormField label="住所" name="address">
            <UInput
              v-model="form.address"
              placeholder="栃木県那須町..."
              size="lg"
            />
          </UFormField>

          <UButton
            type="submit"
            block
            size="lg"
            :loading="loading"
            :disabled="loading"
            style="background-color: #2e5e3e; color: white"
            class="hover:opacity-80 transition-opacity"
          >
            登録
          </UButton>
        </UForm>

        <UAlert
          v-if="error"
          color="red"
          variant="soft"
          :title="error"
          class="mt-4"
        />

        <!-- ログインページへのリンク -->
        <div class="mt-6 text-center space-y-2">
          <p class="text-sm" style="color: #2e5e3e">
            既にアカウントをお持ちの方は
            <NuxtLink
              to="/login"
              class="underline hover:opacity-70 transition-opacity"
            >
              こちらからログイン
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

const form = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
  name_sei: '',
  name_mei: '',
  display_name: '',
  age: null as number | null,
  postal_code: '',
  address: '',
})

const loading = ref(false)
const error = ref('')
const postalCodeLoading = ref(false)
let postalCodeTimeout: NodeJS.Timeout | null = null

const passwordMismatch = computed(() => {
  return (
    form.passwordConfirm !== '' &&
    form.password !== '' &&
    form.password !== form.passwordConfirm
  )
})

// 郵便番号をハイフンなしの7桁に正規化
const normalizePostalCode = (code: string): string => {
  return code.replace(/-/g, '').replace(/\s/g, '')
}

// 郵便番号検索
const searchPostalCode = async () => {
  if (!form.postal_code) return

  postalCodeLoading.value = true
  try {
    const normalizedCode = normalizePostalCode(form.postal_code)
    if (normalizedCode.length !== 7) {
      error.value = '郵便番号は7桁で入力してください'
      postalCodeLoading.value = false
      return
    }

    const response = await $fetch<{
      success: boolean
      data: {
        postal_code: string
        prefecture: string
        city: string
        town: string
        address: string
      }
    }>(`/api/public/postal-code/${normalizedCode}`)

    if (response.success && response.data) {
      form.address = response.data.address
      // 郵便番号をハイフン付きにフォーマット（例: 329-3211）
      if (normalizedCode.length === 7) {
        form.postal_code = `${normalizedCode.slice(0, 3)}-${normalizedCode.slice(3)}`
      }
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || '住所の検索に失敗しました'
  } finally {
    postalCodeLoading.value = false
  }
}

// 郵便番号入力時の処理（7桁入力されたら自動検索）
const handlePostalCodeInput = () => {
  // 既存のタイマーをクリア
  if (postalCodeTimeout) {
    clearTimeout(postalCodeTimeout)
  }

  const normalizedCode = normalizePostalCode(form.postal_code)
  if (normalizedCode.length === 7) {
    // デバウンス処理（500ms後に検索）
    postalCodeTimeout = setTimeout(() => {
      if (normalizePostalCode(form.postal_code).length === 7) {
        searchPostalCode()
      }
    }, 500)
  }
}

// 郵便番号からフォーカスが外れた時の処理
const handlePostalCodeBlur = () => {
  const normalizedCode = normalizePostalCode(form.postal_code)
  if (normalizedCode.length === 7) {
    searchPostalCode()
  }
}

const onSubmit = async () => {
  loading.value = true
  error.value = ''

  // パスワード一致チェック
  if (form.password !== form.passwordConfirm) {
    error.value = 'パスワードが一致しません'
    loading.value = false
    return
  }

  try {
    // passwordConfirmは送信しない
    const { passwordConfirm, ...submitData } = form
    const response = await $fetch('/api/public/register', {
      method: 'POST',
      body: submitData,
    })

    if ((response as any).success) {
      // 登録成功後、ログインページにリダイレクト
      await navigateTo('/login')
    }
  } catch (err: any) {
    error.value =
      err.data?.message || err.message || 'ユーザー登録に失敗しました'
  } finally {
    loading.value = false
  }
}

// クリーンアップ
onBeforeUnmount(() => {
  if (postalCodeTimeout) {
    clearTimeout(postalCodeTimeout)
  }
})
</script>

<style scoped>
/* カスタムスタイルは必要に応じて追加 */
</style>
