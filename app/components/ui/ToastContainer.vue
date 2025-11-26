<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md w-full pointer-events-none"
    >
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto"
        >
          <UCard
            :class="[
              'shadow-lg',
              toast.type === 'success' && 'bg-green-50 border-green-200',
              toast.type === 'error' && 'bg-red-50 border-red-200',
              toast.type === 'warning' && 'bg-yellow-50 border-yellow-200',
              toast.type === 'info' && 'bg-blue-50 border-blue-200',
            ]"
          >
            <div class="flex items-start gap-3 p-4">
              <UIcon
                :name="getIconName(toast.type)"
                :class="[
                  'flex-shrink-0 mt-0.5',
                  toast.type === 'success' && 'text-green-600',
                  toast.type === 'error' && 'text-red-600',
                  toast.type === 'warning' && 'text-yellow-600',
                  toast.type === 'info' && 'text-blue-600',
                ]"
              />
              <div class="flex-1 min-w-0">
                <p
                  :class="[
                    'text-sm font-medium',
                    toast.type === 'success' && 'text-green-800',
                    toast.type === 'error' && 'text-red-800',
                    toast.type === 'warning' && 'text-yellow-800',
                    toast.type === 'info' && 'text-blue-800',
                  ]"
                >
                  {{ toast.message }}
                </p>
              </div>
              <UButton
                variant="ghost"
                size="xs"
                icon="i-heroicons-x-mark"
                @click="removeToast(toast.id)"
                :class="[
                  'flex-shrink-0',
                  toast.type === 'success' && 'text-green-600 hover:text-green-800',
                  toast.type === 'error' && 'text-red-600 hover:text-red-800',
                  toast.type === 'warning' && 'text-yellow-600 hover:text-yellow-800',
                  toast.type === 'info' && 'text-blue-600 hover:text-blue-800',
                ]"
              />
            </div>
          </UCard>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ToastType } from '~/composables/useToast'

const { toasts, removeToast } = useCustomToast()

const getIconName = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'i-heroicons-check-circle'
    case 'error':
      return 'i-heroicons-x-circle'
    case 'warning':
      return 'i-heroicons-exclamation-triangle'
    case 'info':
      return 'i-heroicons-information-circle'
    default:
      return 'i-heroicons-information-circle'
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>

