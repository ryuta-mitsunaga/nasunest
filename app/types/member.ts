/**
 * メンバー関連の型定義
 */

/**
 * フロントエンド用のメンバー型（APIレスポンス用）
 * iconはBase64文字列として返される
 */
export interface Member {
  id: number
  name_sei: string
  name_mei: string
  start_date: string
  end_date: string | null
  mission: string
  description: string
  icon: string
  x_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  createdAt?: string
  updatedAt?: string
}

/**
 * メンバー一覧取得APIのレスポンス型
 */
export interface MembersResponse {
  success: boolean
  data: Member[]
}

/**
 * メンバー取得APIのレスポンス型
 */
export interface MemberResponse {
  success: boolean
  data: Member
}

