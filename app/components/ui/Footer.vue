<template>
  <footer class="bg-page-bg py-6">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="text-center md:text-left">
          <p class="text-sm md:text-base font-medium mb-2">
            那須町地域おこし協力隊 光永龍太
          </p>
          <p class="text-xs md:text-sm opacity-80">
            © {{ currentYear }} 那須町地域おこし協力隊 光永龍太 All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>
