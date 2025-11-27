<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">管理者招待</h1>
      <p class="text-gray-600 mt-2">新しい管理者を招待するためのURLを発行します</p>
    </div>

    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">招待URL発行</h2>
      </template>

      <div class="space-y-4">
        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          :title="error"
        />

        <UAlert
          v-if="successMessage"
          color="success"
          variant="soft"
          :title="successMessage"
        />

        <div v-if="invitationUrl" class="space-y-4">
          <UFormField label="招待URL">
            <div class="flex gap-2">
              <UInput
                :model-value="invitationUrl"
                readonly
                class="flex-1"
              />
              <UButton
                color="primary"
                @click="copyUrl"
                :disabled="copying"
              >
                {{ copying ? 'コピー中...' : 'コピー' }}
              </UButton>
            </div>
          </UFormField>

          <UAlert
            color="info"
            variant="soft"
            title="このURLは7日間有効です。期限切れの場合は新しいURLを発行してください。"
          />
        </div>

        <div class="flex justify-end">
          <UButton
            color="primary"
            @click="generateInvitation"
            :loading="loading"
            :disabled="loading"
          >
            招待URLを発行
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useCustomToast } from '~/composables/useToast'

definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

const toast = useCustomToast()

const loading = ref(false)
const copying = ref(false)
const error = ref('')
const successMessage = ref('')
const invitationUrl = ref('')

const generateInvitation = async () => {
  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const response = await $fetch<{
      success: boolean
      data: {
        invitation: any
        invitationUrl: string
      }
    }>('/api/admin/invitations', {
      method: 'POST',
    })

    if (response.success) {
      invitationUrl.value = response.data.invitationUrl
      successMessage.value = '招待URLを発行しました'
      toast.success('招待URLを発行しました')
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || '招待URLの発行に失敗しました'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const copyUrl = async () => {
  if (!invitationUrl.value) return

  copying.value = true
  try {
    await navigator.clipboard.writeText(invitationUrl.value)
    toast.success('URLをクリップボードにコピーしました')
  } catch (err) {
    toast.error('コピーに失敗しました')
  } finally {
    copying.value = false
  }
}
</script>

