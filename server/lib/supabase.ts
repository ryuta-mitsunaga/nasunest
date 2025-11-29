import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 環境変数から Supabase の URL と service_role キーを取得
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 必要な環境変数が設定されていることを確認
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Supabase環境変数が設定されていません。SUPABASE_URLとSUPABASE_SERVICE_ROLE_KEYを設定してください。'
  )
}

// service_role キーを使用して Supabase クライアントを作成
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

