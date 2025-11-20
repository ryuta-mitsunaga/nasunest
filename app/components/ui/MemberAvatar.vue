<template>
  <div class="relative group">
    <div
      :class="[
        'rounded-full overflow-hidden border-2 border-white shadow-md transition-transform duration-200',
        size === 'sm' ? 'w-12 h-12' : size === 'md' ? 'w-16 h-16' : 'w-20 h-20',
        'group-hover:scale-110 group-hover:z-10'
      ]"
    >
      <img
        v-if="icon"
        :src="icon"
        :alt="`${nameSei} ${nameMei}`"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400"
      >
        <span class="text-xs">{{ nameSei.charAt(0) }}</span>
      </div>
    </div>
    
    <!-- ホバー時のポップアップ -->
    <div
      class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20"
    >
      <div class="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
        <div class="font-semibold">{{ nameSei }} {{ nameMei }}</div>
        <div class="text-gray-300 mt-1">{{ mission }}</div>
        <!-- 矢印 -->
        <div class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div class="w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AvatarSize } from '~/types'

interface Props {
  icon?: string | null
  nameSei: string
  nameMei: string
  mission: string
  size?: AvatarSize
}

withDefaults(defineProps<Props>(), {
  icon: null,
  size: 'md',
})
</script>

