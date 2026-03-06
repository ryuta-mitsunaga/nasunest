<template>
  <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- ロゴ・タイトル -->
        <NuxtLink to="/admin" class="flex items-center gap-2">
          <h1 class="text-xl font-bold text-gray-900">管理者画面</h1>
        </NuxtLink>

        <!-- デスクトップメニュー -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="menu in menus"
            :key="menu.to"
            :to="menu.to"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive(menu.to)
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-700 hover:bg-gray-100',
            ]"
          >
            <div class="flex items-center gap-2">
              <UIcon :name="menu.icon" class="w-4 h-4" />
              <span>{{ menu.label }}</span>
            </div>
          </NuxtLink>
        </nav>

        <!-- 右側のアクション -->
        <div class="flex items-center gap-2">
          <!-- モバイルメニューボタン -->
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-bars-3"
            class="md:hidden"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          />
          <!-- 設定 -->
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-cog-6-tooth"
            :to="`/admin/settings`"
            class="hidden md:flex"
          >
            設定
          </UButton>
        </div>
      </div>

      <!-- モバイルメニュー -->
      <Transition name="slide-down">
        <div
          v-if="isMobileMenuOpen"
          class="md:hidden border-t border-gray-200 py-2"
        >
          <nav class="flex flex-col">
            <NuxtLink
              v-for="menu in menus"
              :key="menu.to"
              :to="menu.to"
              :class="[
                'px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                isActive(menu.to)
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100',
              ]"
              @click="isMobileMenuOpen = false"
            >
              <UIcon :name="menu.icon" class="w-5 h-5" />
              <span>{{ menu.label }}</span>
            </NuxtLink>
            <NuxtLink
              to="/admin/settings"
              class="mt-2 mx-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 text-gray-700 hover:bg-gray-100"
              @click="isMobileMenuOpen = false"
            >
              <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5" />
              <span>設定</span>
            </NuxtLink>
          </nav>
        </div>
      </Transition>
    </div>
  </header>
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
  isMaster: boolean
  permissions: Permission[]
}

const route = useRoute()

const isMobileMenuOpen = ref(false)
const adminPermissions = ref<string[]>([])

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

// メニュー定義（権限コードと紐付け）
const allMenus = [
  {
    label: 'ダッシュボード',
    to: '/admin',
    icon: 'i-heroicons-home',
    permission: null, // ダッシュボードは常に表示
  },
  {
    label: '協力隊員',
    to: '/admin/chikiOkoshiMembers',
    icon: 'i-heroicons-users',
    permission: 'member_management',
  },
  {
    label: 'フォーム',
    to: '/admin/forms',
    icon: 'i-heroicons-document-text',
    permission: 'form_management',
  },
  {
    label: 'イベント',
    to: '/admin/events',
    icon: 'i-heroicons-calendar',
    permission: 'event_management',
  },
  {
    label: 'イベントレポート',
    to: '/admin/eventReports',
    icon: 'i-heroicons-document-text',
    permission: 'event_management',
  },
  {
    label: '管理者招待',
    to: '/admin/invitations',
    icon: 'i-heroicons-user-plus',
    permission: 'invitation_management',
  },
  {
    label: '管理者管理',
    to: '/admin/admins',
    icon: 'i-heroicons-shield-check',
    permission: 'admin_management',
  },
  {
    label: 'マニュアル',
    to: '/admin/docs',
    icon: 'i-heroicons-book-open',
    permission: null, // 全員に表示
  },
]

// 権限チェック済みのメニュー
const menus = computed(() => {
  // マスターユーザーの場合は全てのメニューを表示
  if (adminData.value?.data?.isMaster) {
    return allMenus
  }
  return allMenus.filter(menu => {
    // 権限が設定されていない場合は常に表示
    if (!menu.permission) return true
    // 権限が設定されている場合は、権限を持っている場合のみ表示
    return permissionCodes.value.includes(menu.permission)
  })
})

const isActive = (path: string) => {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
  max-height: 500px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
