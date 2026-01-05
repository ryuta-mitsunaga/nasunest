<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-xl font-bold">管理画面</h1>
      <p class="text-gray-600 mt-2">各種管理機能にアクセスできます</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AdminDashboardCard
        v-for="card in visibleCards"
        :key="card.to"
        :title="card.title"
        :description="card.description"
        :icon="card.icon"
        :icon-color="card.iconColor"
        :to="card.to"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Permission {
  id: number
  code: string
  name: string
}

interface AdminData {
  id: number
  login_id: string
  permissions: Permission[]
}

definePageMeta({
  layout: 'admin',
})

// 管理者情報と権限を取得
const { data: adminData } = await useFetch<{
  success: boolean
  data: AdminData
}>('/api/admin/me', {
  default: () => ({
    success: false,
    data: { id: 0, login_id: '', permissions: [] },
  }),
})

// 権限コードのリストを取得
const permissionCodes = computed(() => {
  if (!adminData.value?.data?.permissions) return []
  return adminData.value.data.permissions.map(p => p.code)
})

// 権限チェック関数
const hasPermission = (permissionCode: string) => {
  return permissionCodes.value.includes(permissionCode)
}

// ダッシュボードカードの定義
const dashboardCards = [
  {
    title: '協力隊員管理',
    description:
      '地域おこし協力隊のメンバー情報を管理します。メンバーの追加、編集、削除が可能です。',
    icon: 'i-heroicons-users',
    iconColor: 'blue',
    to: '/admin/chikiOkoshiMembers',
    permission: 'member_management',
  },
  {
    title: 'フォーム管理',
    description:
      '各種フォームの設定と管理を行います。フォームの作成、編集、削除が可能です。',
    icon: 'i-heroicons-document-text',
    iconColor: 'green',
    to: '/admin/forms',
    permission: 'form_management',
  },
  {
    title: 'イベント管理',
    description:
      'イベント情報を管理します。イベントの作成、編集、削除が可能です。',
    icon: 'i-heroicons-calendar',
    iconColor: 'purple',
    to: '/admin/events',
    permission: 'event_management',
  },
  {
    title: '管理者招待',
    description:
      '新しい管理者を招待するためのURLを発行します。招待URLは7日間有効です。',
    icon: 'i-heroicons-user-plus',
    iconColor: 'orange',
    to: '/admin/invitations',
    permission: 'invitation_management',
  },
  {
    title: '管理者管理',
    description:
      '管理者アカウントの管理を行います。管理者の作成、編集、削除、権限の設定が可能です。',
    icon: 'i-heroicons-shield-check',
    iconColor: 'red',
    to: '/admin/admins',
    permission: 'admin_management',
  },
  {
    title: 'イベントレポート',
    description:
      'イベントのレポートを管理します。イベントレポートの作成、編集、削除が可能です。',
    icon: 'i-heroicons-document-text',
    iconColor: 'indigo',
    to: '/admin/eventReports',
    permission: 'event_management',
  },
]

// 表示可能なカードをフィルタリング
const visibleCards = computed(() => {
  return dashboardCards.filter(
    card => !card.permission || hasPermission(card.permission)
  )
})
</script>
