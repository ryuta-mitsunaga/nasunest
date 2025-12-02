<template>
  <div class="container mx-auto p-6">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">協力隊員管理</h2>
          <UButton @click="openCreateModal">新規作成</UButton>
        </div>
      </template>

      <div v-if="loading" class="text-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
      </div>

      <UTable v-else :data="members" :columns="columns" class="w-full">
        <template #icon-cell="{ row }">
          <div
            v-if="row.original.icon && typeof row.original.icon === 'string'"
            class="w-12 h-12"
          >
            <img
              :src="row.original.icon as string"
              alt="アイコン"
              class="w-full h-full object-cover rounded"
            />
          </div>
          <span v-else class="text-gray-400">-</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton
              color="primary"
              variant="soft"
              size="sm"
              @click="openEditModal(row.original)"
            >
              編集
            </UButton>
            <UButton
              color="error"
              variant="soft"
              size="sm"
              @click="handleDelete(row.original.id)"
            >
              削除
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>
    <!-- 作成/編集モーダル -->
    <UModal v-model:open="isModalOpen">
      <template #header>
        <h3 class="text-xl font-semibold">
          {{ editingMember ? 'メンバー編集' : '新規メンバー作成' }}
        </h3>
      </template>

      <template #body>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
          <!-- フォーム -->
          <div>
            <UForm :state="memberForm" @submit="handleSubmit" class="space-y-4">
              <UFormField label="姓" name="name_sei" required>
                <UInput v-model="memberForm.name_sei" />
              </UFormField>

              <UFormField label="名" name="name_mei" required>
                <UInput v-model="memberForm.name_mei" />
              </UFormField>

              <UFormField label="開始日" name="start_date" required>
                <UInput v-model="memberForm.start_date" type="date" />
              </UFormField>

              <UFormField label="終了日" name="end_date">
                <UInput v-model="memberForm.end_date" type="date" />
              </UFormField>

              <UFormField label="ミッション" name="mission" required>
                <UInput v-model="memberForm.mission" />
              </UFormField>

              <UFormField label="説明" name="description" required>
                <UTextarea v-model="memberForm.description" />
              </UFormField>

              <UFormField label="アイコン" name="icon">
                <div class="space-y-4">
                  <div v-if="iconPreview" class="flex items-center gap-4">
                    <div class="w-24 h-24 border rounded overflow-hidden">
                      <img
                        :src="iconPreview"
                        alt="プレビュー"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <UButton
                      color="error"
                      variant="soft"
                      size="sm"
                      @click="clearIcon"
                    >
                      削除
                    </UButton>
                  </div>
                  <UInput
                    type="file"
                    accept="image/*"
                    @change="handleIconUpload"
                  />
                </div>
              </UFormField>

              <UFormField label="X URL" name="x_url">
                <UInput
                  v-model="memberForm.x_url"
                  placeholder="https://x.com/..."
                />
              </UFormField>

              <UFormField label="Instagram URL" name="instagram_url">
                <UInput
                  v-model="memberForm.instagram_url"
                  placeholder="https://www.instagram.com/..."
                />
              </UFormField>

              <UFormField label="Facebook URL" name="facebook_url">
                <UInput
                  v-model="memberForm.facebook_url"
                  placeholder="https://www.facebook.com/..."
                />
              </UFormField>

              <div class="flex gap-2 justify-end">
                <UButton variant="soft" @click="closeModal">キャンセル</UButton>
                <UButton type="submit" :loading="submitting">
                  {{ editingMember ? '更新' : '作成' }}
                </UButton>
              </div>
            </UForm>
          </div>

          <!-- プレビュー -->
          <div class="lg:sticky lg:top-4 lg:self-start">
            <div class="mb-2">
              <h4 class="text-sm font-semibold text-gray-700">プレビュー</h4>
            </div>
            <div class="border rounded-lg p-4 bg-gray-50">
              <MembersMemberCard
                :name-sei="memberForm.name_sei || '姓'"
                :name-mei="memberForm.name_mei || '名'"
                :mission="memberForm.mission || 'ミッション'"
                :description="memberForm.description || '説明'"
                :icon="iconPreview"
                :x-url="memberForm.x_url"
                :instagram-url="memberForm.instagram_url"
                :facebook-url="memberForm.facebook_url"
              />
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { Member } from '~/types'

definePageMeta({
  layout: 'admin',
})

const { success: toastSuccess, error: toastError } = useCustomToast()
const { confirm } = useConfirm()

const members = ref<Member[]>([])
const loading = ref(true)
const isModalOpen = ref(false)
const editingMember = ref<any>(null)
const submitting = ref(false)
const iconPreview = ref<string | null>(null)

const memberForm = reactive({
  name_sei: '',
  name_mei: '',
  start_date: '',
  end_date: '',
  mission: '',
  description: '',
  icon: null as string | null,
  x_url: '',
  instagram_url: '',
  facebook_url: '',
})

const columns: TableColumn<Member>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name_sei', header: '姓' },
  { accessorKey: 'name_mei', header: '名' },
  { accessorKey: 'start_date', header: '開始日' },
  { accessorKey: 'end_date', header: '終了日' },
  { accessorKey: 'mission', header: 'ミッション' },
  { accessorKey: 'description', header: '説明' },
  { accessorKey: 'icon', header: 'アイコン' },
  { accessorKey: 'actions', header: '操作' },
]

const fetchMembers = async () => {
  loading.value = true
  try {
    const response = await $fetch<Member[]>('/api/members')
    members.value = (response as any).data || []
  } catch (error) {
    console.error('メンバー取得エラー:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingMember.value = null
  iconPreview.value = null
  Object.assign(memberForm, {
    name_sei: '',
    name_mei: '',
    start_date: '',
    end_date: '',
    mission: '',
    description: '',
    icon: null,
    x_url: '',
    instagram_url: '',
    facebook_url: '',
  })
  isModalOpen.value = true
}

const openEditModal = (member: any) => {
  editingMember.value = member
  memberForm.name_sei = member.name_sei
  memberForm.name_mei = member.name_mei
  memberForm.start_date = member.start_date
  memberForm.end_date = member.end_date || ''
  memberForm.mission = member.mission
  memberForm.description = member.description
  memberForm.icon = member.icon || null
  memberForm.x_url = member.x_url || ''
  memberForm.instagram_url = member.instagram_url || ''
  memberForm.facebook_url = member.facebook_url || ''
  iconPreview.value = member.icon || null

  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingMember.value = null
  iconPreview.value = null
}

const handleIconUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      iconPreview.value = result
      memberForm.icon = result
    }
    reader.readAsDataURL(file)
  }
}

const clearIcon = () => {
  iconPreview.value = null
  memberForm.icon = null
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (editingMember.value) {
      await $fetch(`/api/members/${editingMember.value.id}`, {
        method: 'PUT',
        body: memberForm,
      })
    } else {
      await $fetch('/api/members', {
        method: 'POST',
        body: memberForm,
      })
    }
    closeModal()
    await fetchMembers()
    toastSuccess('保存しました')
  } catch (error) {
    console.error('保存エラー:', error)
    toastError('保存に失敗しました')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: number | string) => {
  const confirmed = await confirm({
    message: '本当に削除しますか？',
    type: 'danger',
    confirmText: '削除',
    cancelText: 'キャンセル',
  })
  if (!confirmed) return

  try {
    await $fetch(`/api/members/${id}`, {
      method: 'DELETE',
    })
    await fetchMembers()
    toastSuccess('削除しました')
  } catch (error) {
    console.error('削除エラー:', error)
    toastError('削除に失敗しました')
  }
}

const handleLogout = async () => {
  try {
    await $fetch('/api/admin/logout', {
      method: 'POST',
    })
    await navigateTo('/admin/login')
  } catch (error) {
    console.error('ログアウトエラー:', error)
  }
}

onMounted(() => {
  fetchMembers()
})
</script>

