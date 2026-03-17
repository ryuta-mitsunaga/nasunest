<template>
  <footer class="pt-12 pb-6">
    <div class="flex justify-center px-4">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <UiSnsLink
            type="instagram"
            href="https://www.instagram.com/nasunest.info/"
            label="Instagram"
            aria-label="NasuNest Instagram"
          />
          <UiSnsLink
            type="line"
            href="https://lin.ee/VLzjPvj"
            label="LINE公式アカウント"
            aria-label="LINE公式アカウント"
          />
          <p class="text-xs md:text-sm opacity-80">
            © 2025 NasuNest All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>
