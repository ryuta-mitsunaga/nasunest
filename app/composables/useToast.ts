export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

const toasts = ref<Toast[]>([])

export const useCustomToast = () => {
  const addToast = (type: ToastType, message: string, duration = 5000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    toasts.value.push({
      id,
      type,
      message,
      duration,
    })

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => {
    return addToast('success', message, duration)
  }

  const error = (message: string, duration?: number) => {
    return addToast('error', message, duration)
  }

  const warning = (message: string, duration?: number) => {
    return addToast('warning', message, duration)
  }

  const info = (message: string, duration?: number) => {
    return addToast('info', message, duration)
  }

  return {
    toasts: readonly(toasts),
    success,
    error,
    warning,
    info,
    removeToast,
  }
}

