<template>
  <div class="container mx-auto p-6">
    <UCard v-if="loading" class="p-8">
      <div class="text-center">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
      </div>
    </UCard>

    <UCard v-else-if="error" class="p-8">
      <div class="text-center">
        <p class="text-red-500">{{ error }}</p>
      </div>
    </UCard>

    <UCard v-else-if="eventReport">
      <template #header>
        <h2 class="text-xl font-semibold">{{ eventReport.title }}</h2>
      </template>

      <UForm :state="formState" @submit="handleSubmit" class="space-y-6 p-6">
        <UFormField label="メールアドレス" name="email" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="example@email.com"
          />
        </UFormField>

        <UFormField label="お名前（ニックネーム可）" name="name" required>
          <UInput v-model="form.name" placeholder="M.R 那須太郎" />
        </UFormField>

        <UFormField label="年齢" name="age">
          <USelect
            v-model="form.age"
            :items="ageOptions"
            placeholder="選択してください"
          />
        </UFormField>

        <UFormField label="性別" name="sex">
          <USelect
            v-model="form.sex"
            :items="sexOptions"
            placeholder="選択してください"
          />
        </UFormField>
        <UFormField label="お住まいの地域" name="area" required>
          <USelect
            v-model="form.area"
            :items="areaOptions"
            placeholder="選択してください"
          />
        </UFormField>

        <UFormField label="コメント" name="comment" required>
          <UTextarea
            v-model="form.comment"
            placeholder="コメントを入力してください"
            :rows="8"
          />
        </UFormField>

        <div class="flex gap-2 justify-end pt-4">
          <UButton type="submit" :loading="submitting">送信</UButton>
        </div>
      </UForm>
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

const { success: toastSuccess, error: toastError } = useCustomToast()

interface EventReport {
  id: number
  title: string
}

const form = reactive({
  email: '',
  name: '',
  age: '' as string,
  sex: '' as string,
  area: '',
  comment: '',
})

const submitting = ref(false)
const loading = ref(true)
const error = ref('')
const eventReport = ref<EventReport | null>(null)

const formState = computed(() => ({
  email: form.email,
  name: form.name,
  area: form.area,
  comment: form.comment,
}))

const ageOptions = [
  { label: '10代', value: '10代' },
  { label: '20代', value: '20代' },
  { label: '30代', value: '30代' },
  { label: '40代', value: '40代' },
  { label: '50代', value: '50代' },
  { label: '60代以上', value: '60代以上' },
]

const sexOptions = [
  { label: '男性', value: 'male' },
  { label: '女性', value: 'female' },
  { label: 'その他', value: 'other' },
]

const areaOptions = [
  { label: '栃木県(那須町)', value: '栃木県(那須町)' },
  { label: '栃木県(那須町以外)', value: '栃木県(那須町以外)' },
  { label: '栃木県以外', value: '栃木県以外' },
]

// トークンの検証とイベントレポート情報の取得
const verifyToken = async () => {
  if (!token.value) {
    error.value = 'トークンが指定されていません'
    loading.value = false
    return
  }

  try {
    const response = await $fetch<{
      success: boolean
      data: EventReport
    }>(
      `/api/public/event-reports/${id.value}/verify-token?token=${token.value}`
    )

    if (response.success && response.data) {
      eventReport.value = response.data
    } else {
      error.value = 'トークンが無効です'
    }
  } catch (err: any) {
    console.error('トークン検証エラー:', err)
    error.value = err.data?.message || 'トークンの検証に失敗しました'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (
    !form.email.trim() ||
    !form.name.trim() ||
    !form.area.trim() ||
    !form.comment.trim()
  ) {
    toastError('必須項目を入力してください')
    return
  }

  if (!token.value) {
    toastError('トークンが指定されていません')
    return
  }

  submitting.value = true
  try {
    await $fetch(`/api/public/event-reports/${id.value}/comments`, {
      method: 'POST',
      body: {
        token: token.value,
        email: form.email,
        name: form.name,
        age: form.age || null,
        sex: form.sex || null,
        area: form.area,
        comment: form.comment,
      },
    })

    // 送信完了画面に遷移
    await navigateTo(
      `/eventReports/${id.value}/comment/success?token=${token.value}`
    )
  } catch (err: any) {
    console.error('コメント送信エラー:', err)
    toastError(err.data?.message || 'コメントの送信に失敗しました')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  verifyToken()
})
</script>
