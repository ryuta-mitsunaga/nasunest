<template>
  <div class="public-site-layout min-h-screen bg-white text-neutral-900 antialiased">
    <NuxtLoadingIndicator />
    <UiNavigation />
    <div class="min-h-screen">
      <div
        class="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 md:pt-[3.75rem] lg:px-8"
      >
        <slot />
      </div>
    </div>
    <TopFooter />
  </div>
</template>

<script setup lang="ts"></script>
