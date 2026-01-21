type AnyError = any

/**
 * 管理画面で「取得に失敗した」系のエラーを、トーストではなくエラー画面で表示するためのヘルパー。
 */
export function useAdminErrorPage() {
  const showFetchErrorPage = (
    error: AnyError,
    fallbackMessage = 'データの取得に失敗しました'
  ) => {
    const statusCode =
      error?.data?.statusCode || error?.statusCode || error?.status || 500
    const statusMessage =
      error?.data?.statusMessage || error?.statusMessage || undefined
    const message = error?.data?.message || error?.message || fallbackMessage

    showError({
      statusCode,
      statusMessage: statusMessage || fallbackMessage,
      message,
    })
  }

  return { showFetchErrorPage }
}

