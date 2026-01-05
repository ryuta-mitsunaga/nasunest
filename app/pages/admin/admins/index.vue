<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-bold">管理者管理</h1>
      <UButton color="primary" @click="openCreateModal">新規作成</UButton>
    </div>

    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">管理者一覧</h2>
      </template>

      <div v-if="loading" class="text-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
      </div>

      <UTable v-else :data="admins" :columns="columns" class="w-full">
        <template #id-cell="{ row }">
          {{ admins.indexOf(row.original) + 1 }}
        </template>
        <template #login_id-cell="{ row }">
          {{ row.original.login_id }}
        </template>
        <template #permissions-cell="{ row }">
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="permission in row.original.permissions"
              :key="permission.id"
              color="primary"
              variant="soft"
            >
              {{ permission.name }}
            </UBadge>
          </div>
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

    <!-- 作成・編集モーダル -->
    <UModal v-model:open="isModalOpen">
      <template #header>
        <h3 class="text-xl font-semibold">
          {{ editingAdmin ? '管理者編集' : '管理者作成' }}
        </h3>
      </template>

      <template #body>
        <UForm :state="form" @submit="handleSubmit" class="space-y-4">
          <UFormField
            v-if="!editingAdmin"
            label="ログインID"
            name="login_id"
            required
          >
            <UInput v-model="form.login_id" placeholder="管理者ID" />
          </UFormField>

          <UFormField
            v-if="!editingAdmin"
            label="パスワード"
            name="password"
            required
          >
            <UInput
              v-model="form.password"
              type="password"
              placeholder="パスワード（8文字以上）"
            />
          </UFormField>

          <UFormField label="権限" name="permissions">
            <div class="space-y-2">
              <UCheckbox
                v-for="permission in permissions"
                :key="permission.id"
                :id="`permission-${permission.id}`"
                :model-value="isPermissionChecked(permission.id)"
                :label="permission.name"
                @update:model-value="
                  val => togglePermission(permission.id, val)
                "
              />
            </div>
          </UFormField>

          <div class="flex gap-2 justify-end">
            <UButton variant="soft" @click="closeModal">キャンセル</UButton>
            <UButton type="submit" :loading="submitting">
              {{ editingAdmin ? '更新' : '作成' }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useCustomToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'

definePageMeta({
  layout: 'admin',
})

interface Admin {
  id: number
  login_id: string
  permissions: Array<{
    id: number
    code: string
    name: string
  }>
  createdAt: string
  updatedAt: string
}

interface Permission {
  id: number
  code: string
  name: string
  description: string | null
}

const toast = useCustomToast()
const { confirm } = useConfirm()

const admins = ref<Admin[]>([])
const permissions = ref<Permission[]>([])
const loading = ref(true)
const isModalOpen = ref(false)
const editingAdmin = ref<Admin | null>(null)
const submitting = ref(false)

const form = reactive({
  login_id: '',
  password: '',
  permission_ids: [] as number[],
})

const columns: TableColumn<Admin>[] = [
  { accessorKey: 'id', header: 'No.' },
  { accessorKey: 'login_id', header: 'ログインID' },
  { accessorKey: 'permissions', header: '権限' },
  { accessorKey: 'actions', header: '操作' },
]

const fetchAdmins = async () => {
  loading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: Admin[] }>(
      '/api/admin/admins',
      {
        credentials: 'include',
      }
    )
    admins.value = response.data || []
  } catch (error) {
    console.error('管理者取得エラー:', error)
    toast.error('管理者の取得に失敗しました')
  } finally {
    loading.value = false
  }
}

const fetchPermissions = async () => {
  try {
    const response = await $fetch<{ success: boolean; data: Permission[] }>(
      '/api/admin/permissions',
      {
        credentials: 'include',
      }
    )
    permissions.value = response.data || []
  } catch (error) {
    console.error('権限取得エラー:', error)
    toast.error('権限の取得に失敗しました')
  }
}

const openCreateModal = () => {
  editingAdmin.value = null
  form.login_id = ''
  form.password = ''
  form.permission_ids = []
  isModalOpen.value = true
}

const openEditModal = (admin: Admin) => {
  editingAdmin.value = admin
  form.login_id = admin.login_id
  form.password = ''
  form.permission_ids = admin.permissions.map(p => p.id)
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingAdmin.value = null
  form.login_id = ''
  form.password = ''
  form.permission_ids = []
}

const isPermissionChecked = (permissionId: number) => {
  return form.permission_ids.includes(permissionId)
}

const togglePermission = (permissionId: number, checked: boolean | string) => {
  const isChecked = !!checked
  const index = form.permission_ids.indexOf(permissionId)
  if (isChecked && index === -1) {
    form.permission_ids.push(permissionId)
  } else if (!isChecked && index > -1) {
    form.permission_ids.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!editingAdmin.value) {
    // 作成時のみバリデーション
    if (!form.login_id) {
      toast.error('ログインIDを入力してください')
      return
    }

    if (!form.password) {
      toast.error('パスワードを入力してください')
      return
    }

    if (form.password.length < 8) {
      toast.error('パスワードは8文字以上で入力してください')
      return
    }
  }

  submitting.value = true
  try {
    const body: any = {
      permission_ids: form.permission_ids,
    }

    if (!editingAdmin.value) {
      // 作成時のみログインIDとパスワードを含める
      body.login_id = form.login_id
      body.password = form.password
    }

    if (editingAdmin.value) {
      await $fetch(`/api/admin/admins/${editingAdmin.value.id}`, {
        method: 'PUT',
        credentials: 'include',
        body,
      })
      toast.success('管理者を更新しました')
    } else {
      await $fetch('/api/admin/admins', {
        method: 'POST',
        credentials: 'include',
        body,
      })
      toast.success('管理者を作成しました')
    }

    closeModal()
    await fetchAdmins()
  } catch (error: any) {
    console.error('保存エラー:', error)
    toast.error(error.data?.message || error.message || '保存に失敗しました')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: number) => {
  const confirmed = await confirm({
    message: '本当に削除しますか？',
    type: 'danger',
    confirmText: '削除',
    cancelText: 'キャンセル',
  })
  if (!confirmed) return

  try {
    await $fetch(`/api/admin/admins/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    toast.success('管理者を削除しました')
    await fetchAdmins()
  } catch (error: any) {
    console.error('削除エラー:', error)
    toast.error(error.data?.message || error.message || '削除に失敗しました')
  }
}

onMounted(() => {
  fetchAdmins()
  fetchPermissions()
})
</script>
