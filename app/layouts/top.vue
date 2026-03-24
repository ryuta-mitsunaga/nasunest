<template>
  <div
    class="top-layout-chic min-h-screen bg-white text-neutral-900 antialiased"
  >
    <UiNavigation />
    <div class="min-h-screen pt-14">
      <slot />
    </div>
    <TopFooter />
  </div>
</template>

<script setup lang="ts"></script>
