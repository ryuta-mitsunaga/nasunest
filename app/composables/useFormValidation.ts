/**
 * フォームバリデーション用のcomposable
 * required項目の未入力時にスクロール・フォーカスを行う
 */

export interface ValidationRule {
  field: string
  required?: boolean
  validator?: (value: any) => boolean | string
  errorMessage?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  firstErrorField?: string
}

/**
 * フォームバリデーション用のcomposable
 */
export function useFormValidation<T extends Record<string, any>>(
  form: T,
  rules: ValidationRule[]
) {
  const errors = ref<Record<string, string>>({})

  /**
   * バリデーションを実行
   */
  const validate = (): ValidationResult => {
    errors.value = {}
    const validationErrors: Record<string, string> = {}

    for (const rule of rules) {
      const value = form[rule.field]

      // requiredチェック
      if (rule.required) {
        let isValid = false

        if (value === null || value === undefined) {
          isValid = false
        } else if (typeof value === 'string') {
          isValid = value.trim() !== ''
        } else if (typeof value === 'number') {
          isValid = !isNaN(value)
        } else if (Array.isArray(value)) {
          isValid = value.length > 0
        } else if (typeof value === 'boolean') {
          isValid = true // booleanは常に有効
        } else {
          isValid = !!value
        }

        if (!isValid) {
          const errorMsg = rule.errorMessage || 'この項目は必須です'
          validationErrors[rule.field] = errorMsg
        }
      }

      // カスタムバリデーター
      if (rule.validator && !validationErrors[rule.field]) {
        const result = rule.validator(value)
        if (result !== true) {
          validationErrors[rule.field] =
            typeof result === 'string' ? result : '入力値が無効です'
        }
      }
    }

    errors.value = validationErrors

    const firstErrorField = Object.keys(validationErrors)[0]

    return {
      isValid: Object.keys(validationErrors).length === 0,
      errors: validationErrors,
      firstErrorField,
    }
  }

  /**
   * 最初のエラーフィールドにスクロール・フォーカス
   */
  const scrollToFirstError = (fieldNameSelector?: (field: string) => string) => {
    const firstErrorField = Object.keys(errors.value)[0]
    if (!firstErrorField) return

    // セレクターを生成
    const selector = fieldNameSelector
      ? fieldNameSelector(firstErrorField)
      : `[name="${firstErrorField}"]`

    // 要素を検索
    const element = document.querySelector(selector) as HTMLElement
    if (!element) {
      console.warn(`要素が見つかりません: ${selector}`)
      return
    }

    // スクロール
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // フォーカス（少し遅延を入れてスクロール後にフォーカス）
    setTimeout(() => {
      // input要素を探す
      const inputElement =
        element.querySelector('input') ||
        element.querySelector('textarea') ||
        element.querySelector('select') ||
        element

      if (inputElement && 'focus' in inputElement) {
        inputElement.focus()
      }
    }, 300)
  }

  /**
   * バリデーションを実行し、エラーがあればスクロール
   */
  const validateAndScroll = (
    fieldNameSelector?: (field: string) => string
  ): boolean => {
    const result = validate()
    if (!result.isValid) {
      scrollToFirstError(fieldNameSelector)
    }
    return result.isValid
  }

  /**
   * 特定のフィールドのエラーをクリア
   */
  const clearError = (field: string) => {
    if (errors.value[field]) {
      delete errors.value[field]
    }
  }

  /**
   * すべてのエラーをクリア
   */
  const clearAllErrors = () => {
    errors.value = {}
  }

  return {
    errors: readonly(errors),
    validate,
    scrollToFirstError,
    validateAndScroll,
    clearError,
    clearAllErrors,
  }
}

