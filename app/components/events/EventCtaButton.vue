<template>
  <div class="space-y-3">
    <!-- 未ログインかつ手動承認（ログイン必須）の場合 -->
    <template v-if="approvalType === 1 && !isAuthenticated">
      <button
        disabled
        :class="[
          'inline-flex items-center justify-center px-6 py-3 rounded-lg text-base font-medium transition-all duration-200 shadow-sm opacity-50 cursor-not-allowed',
          fullWidth ? 'w-full' : 'w-full md:w-auto',
        ]"
        style="background-color: #f4d35e; color: #2e5e3e"
      >
        <p>
          <template v-if="!compact"> 申し込みには<br /> </template>
          <span class="font-bold">ログイン</span>が必須です。
        </p>
      </button>
      <div :class="compact ? 'text-center mt-2' : 'text-center md:text-left'">
        <NuxtLink
          :to="`/login?redirect=${encodeURIComponent(redirectPath)}`"
          class="inline-flex items-center gap-1 text-sm hover:underline"
          style="color: #2e5e3e"
        >
          <span>ログイン画面へ</span>
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </NuxtLink>
      </div>
    </template>
    <!-- ログイン済み、またはログイン不要の場合 -->
    <template v-else>
      <button
        @click="handleClick"
        :class="[
          'inline-flex items-center justify-center px-6 py-3 rounded-lg text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md',
          fullWidth ? 'w-full' : 'w-full md:w-auto',
        ]"
        style="background-color: #f4d35e; color: #2e5e3e"
      >
        <span>{{ buttonText || '参加申し込み' }}</span>
        <svg
          class="w-5 h-5 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
interface Props {
  approvalType: number | null
  isAuthenticated: boolean
  buttonText?: string | null
  redirectPath: string
  fullWidth?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: null,
  fullWidth: false,
  compact: false,
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>
