/** 公開フォームのフィールド定義（API content.fields と揃える） */
export interface PublicFormField {
  id: string
  type: string
  label: string
  options?: string[] | { date: string; time: string }[]
}

export interface DateOption {
  date: string
  time: string
}

export function formatDateOptionLabel(dateOption: DateOption): string {
  if (!dateOption.date || !dateOption.time) {
    return ''
  }
  const date = new Date(`${dateOption.date}T${dateOption.time}`)
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = weekdays[date.getDay()]
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}/${day}(${weekday}) ${hours}:${minutes}～`
}

/** 確認画面・管理画面風の表示用文字列 */
export function formatPublicFormAnswerForDisplay(
  field: PublicFormField,
  value: unknown
): string {
  if (value === undefined || value === null || value === '') {
    return '（未入力）'
  }

  if (field.type === 'checkbox') {
    if (Array.isArray(value)) {
      return value.length ? value.join('、') : '（未入力）'
    }
    return String(value)
  }

  if (field.type === 'date-picker') {
    if (!Array.isArray(value) || value.length === 0) {
      return '（未入力）'
    }
    return value
      .map((stored: string) => {
        const [date, time] = String(stored).split('T')
        if (date && time) {
          return formatDateOptionLabel({ date, time })
        }
        return String(stored)
      })
      .filter(Boolean)
      .join('、')
  }

  if (Array.isArray(value)) {
    return value.join('、')
  }

  return String(value)
}
