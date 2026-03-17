<template>
  <NuxtLoadingIndicator />
  <UiNavigation />
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-4">
      <slot />
    </div>
  </div>
  <UiFooter />
</template>

<script setup lang="ts"></script>
