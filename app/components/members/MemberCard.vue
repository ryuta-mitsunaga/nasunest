<template>
  <UiFadeInCard>
    <div class="member-card flex items-center justify-center text-[#2E5E3E]">
      <div class="w-full max-w-56 flex flex-col">
        <!-- 名前 -->
        <p class="text-lg font-bold mb-2 tracking-tight text-left">
          {{ mission }}
        </p>
        <UiDivider />

        <!-- ポートレート画像 -->
        <div class="flex justify-center mt-4">
          <div
            class="w-full max-w-56 aspect-square mb-4 overflow-hidden bg-gray-50 flex items-center justify-center"
          >
            <img
              v-if="icon"
              :src="icon"
              :alt="`${nameSei} ${nameMei}`"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-gray-300 text-sm"
            >
              画像なし
            </div>
          </div>
        </div>

        <div class="flex flex-col">
          <!-- 名前 -->
          <p class="text-md font-bold leading-relaxed text-left">
            {{ displayName }}
          </p>
          <!-- 活動詳細 -->
          <p v-if="description" class="text-sm leading-relaxed text-left mt-1">
            {{ description }}
          </p>
        </div>
      </div>
    </div>
  </UiFadeInCard>
</template>

<script setup lang="ts">
interface Props {
  nameSei: string
  nameMei: string
  mission: string
  description: string
  icon?: string | null
}

const props = defineProps<Props>()

const displayName = computed(() => {
  return `${props.nameSei} ${props.nameMei}`
})
</script>

<style scoped></style>
