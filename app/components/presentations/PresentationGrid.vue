<template>
  <NuxtLink :to="to" class="grid grid-cols-3 gap-4">
    <!-- 1行目: 3列 -->
    <img :src="images[0]" class="w-full aspect-square object-cover" />
    <img :src="images[1]" class="w-full aspect-square object-cover" />
    <img :src="images[2]" class="w-full aspect-square object-cover" />
    <!-- 2行目: 1列目と2列目を結合（大きな写真） -->
    <img
      :src="images[3]"
      :alt="`${title}-4`"
      class="w-full aspect-[2/1] object-cover col-span-2"
    />
    <!-- 2行目: 3列目 -->
    <div
      class="w-full aspect-[2/1] flex items-center justify-center text-2xl font-bold"
    >
      {{ title }}
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  images: string[5]
  title: string
  to: string
}

defineProps<Props>()
</script>
