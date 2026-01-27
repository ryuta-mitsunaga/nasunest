import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// dayjsプラグインを拡張（一度だけ実行される）
dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * UTCとtimezoneプラグインが設定済みのdayjsインスタンスをエクスポート
 * バックエンドで使用する場合は、このファイルからインポートしてください
 */
export default dayjs
