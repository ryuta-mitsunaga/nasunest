<template>
  <div>
    <h2 class="text-xl md:text-3xl font-bold mb-2" :class="textColorClass">
      {{ title }}
      <slot v-if="!title" />
    </h2>
    <UiDivider colorClass="bg-[#F1C40F]" heightClass="h-[6px]" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  textColorClass?: string
}

withDefaults(defineProps<Props>(), {
  textColorClass: 'text-white',
})
</script>
