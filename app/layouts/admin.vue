<template>
  <UHeader title="管理者画面" to="/admin">
    <template #right>
      <div>
        <UButton color="error" variant="soft" @click="handleLogout">
          ログアウト
        </UButton>
      </div>
    </template>
  </UHeader>
  <slot />
</template>

<script setup lang="ts">
const handleLogout = async () => {
  await $fetch('/api/admin/logout', {
    method: 'POST',
  })
  await navigateTo('/admin/login')
}
</script>
