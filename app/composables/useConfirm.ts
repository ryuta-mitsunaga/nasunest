export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

const confirmState = ref<{
  isOpen: boolean
  options: ConfirmOptions | null
  resolve: ((value: boolean) => void) | null
}>({
  isOpen: false,
  options: null,
  resolve: null,
})

export const useConfirm = () => {
  const confirm = (options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      const opts: ConfirmOptions =
        typeof options === 'string' ? { message: options } : options

      confirmState.value = {
        isOpen: true,
        options: {
          title: opts.title || '確認',
          message: opts.message,
          confirmText: opts.confirmText || 'OK',
          cancelText: opts.cancelText || 'キャンセル',
          type: opts.type || 'warning',
        },
        resolve,
      }
    })
  }

  const handleConfirm = () => {
    if (confirmState.value.resolve) {
      confirmState.value.resolve(true)
    }
    confirmState.value.isOpen = false
    confirmState.value.options = null
    confirmState.value.resolve = null
  }

  const handleCancel = () => {
    if (confirmState.value.resolve) {
      confirmState.value.resolve(false)
    }
    confirmState.value.isOpen = false
    confirmState.value.options = null
    confirmState.value.resolve = null
  }

  return {
    confirmState: readonly(confirmState),
    confirm,
    handleConfirm,
    handleCancel,
  }
}

