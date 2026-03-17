<template>
  <section
    v-if="visibleItems.length > 0"
    class="bg-gray-50/80 border-b border-gray-100"
    aria-label="クイックメニュー"
  >
    <div class="container mx-auto px-4 py-4">
      <h2
        class="mb-3 inline-block border-b-2 border-primary-400 bg-primary-50/80 px-3 py-1.5 text-sm font-medium text-gray-700"
      >
        クイックメニュー
      </h2>
      <AdminQuickMenuItemList :items="visibleItems" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { QuickMenuItem } from '~/constants/admin-quick-menu'
import { QUICK_MENU_ITEMS } from '~/constants/admin-quick-menu'

interface Props {
  items?: QuickMenuItem[]
}

const props = withDefaults(defineProps<Props>(), {
  items: () => QUICK_MENU_ITEMS,
})

const { data: adminData } = await useFetch<{
  success: boolean
  data: { isMaster: boolean; permissions: { code: string }[] }
}>('/api/admin/me', {
  default: () => ({
    success: false,
    data: { isMaster: false, permissions: [] },
  }),
})

const permissionCodes = computed(() => {
  if (!adminData.value?.data?.permissions) return []
  return adminData.value.data.permissions.map(p => p.code)
})

const visibleItems = computed(() => {
  const isMaster = adminData.value?.data?.isMaster ?? false
  const codes = permissionCodes.value
  return props.items.filter(item => {
    if (!item.permission) return true
    if (isMaster) return true
    return codes.includes(item.permission)
  })
})
</script>
