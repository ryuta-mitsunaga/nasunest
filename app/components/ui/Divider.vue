<template>
  <div
    :class="[widthClass, colorClass, heightClass]"
    class="rounded-full"
  ></div>
</template>

<script setup lang="ts">
// 共通の下線コンポーネント
interface Props {
  widthClass?: string
  colorClass?: string
  heightClass?: string
}

const props = defineProps<Props>()

const widthClass = computed(() => {
  return props.widthClass || 'w-full'
})

const heightClass = computed(() => {
  return props.heightClass || 'h-[2px]'
})

const colorClass = computed(() => {
  return props.colorClass || 'bg-[#c5ac9d]'
})
</script>
