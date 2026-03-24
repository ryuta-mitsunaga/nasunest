<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UiToastContainer />
  <UiConfirmDialog />
</template>

<script setup lang="ts">
const { clearPublicFormSessionStorage } = usePublicFormDraft()

onMounted(() => {
  clearPublicFormSessionStorage()
})
</script>
