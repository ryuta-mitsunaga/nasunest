/**
 * 管理画面クイックメニューの共通定義
 */
export interface QuickMenuItem {
  /** カードのメインタイトル */
  label: string
  /** カードに表示する説明テキスト */
  cardText: string
  /** リンク先URL */
  to: string
  permission?: string | null
}

export const QUICK_MENU_ITEMS: QuickMenuItem[] = [
  {
    label: 'イベントを作成する',
    cardText: '新しいイベントを登録して参加者を募集しましょう',
    to: '/admin/events/create',
    permission: 'event_management',
  },
]
