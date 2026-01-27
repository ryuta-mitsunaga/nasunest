import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// dayjsプラグインを拡張（一度だけ実行される）
dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * UTCとtimezoneプラグインが設定済みのdayjsインスタンスを返す
 * フロントエンドで使用する場合は、このcomposableを使用してください
 */
export const useDayjs = () => {
  /**
   * UTC日時をJSTに変換してdatetime-local形式に変換する関数
   * @param dateString UTC日時文字列（ISO 8601形式）
   * @returns datetime-local形式の文字列（YYYY-MM-DDTHH:mm）
   */
  const toDateTimeLocal = (
    dateString: string | null | undefined
  ): string => {
    if (!dateString) return ''
    // UTCとして解釈し、JSTに変換してdatetime-local形式に
    const date = dayjs.utc(dateString).tz('Asia/Tokyo')
    if (!date.isValid()) return ''
    return date.format('YYYY-MM-DDTHH:mm')
  }

  /**
   * JSTのdatetime-local形式をUTCに変換する関数
   * @param dateTimeLocal datetime-local形式の文字列（YYYY-MM-DDTHH:mm）
   * @returns UTC日時文字列（ISO 8601形式）
   */
  const toUTC = (
    dateTimeLocal: string | null | undefined
  ): string | null => {
    if (!dateTimeLocal || !dateTimeLocal.trim()) return null
    // JSTとして解釈し、UTCに変換
    const date = dayjs.tz(dateTimeLocal, 'Asia/Tokyo').utc()
    if (!date.isValid()) return null
    return date.toISOString()
  }

  return {
    dayjs,
    toDateTimeLocal,
    toUTC,
  }
}
