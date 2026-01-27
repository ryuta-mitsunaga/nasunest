import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

// dayjsプラグインを拡張（一度だけ実行される）
dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * UTCとtimezoneプラグインが設定済みのdayjsインスタンスをエクスポート
 * バックエンドで使用する場合は、このファイルからインポートしてください
 */
export default dayjs
