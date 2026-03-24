import { LineOfficialAccount, User } from '~~/server/database'
import { pushLineMessage } from '~~/server/lib/line'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function pushLineOfficialAccountNotice(
  lineUserId: string,
  text: string
): Promise<void> {
  if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) return
  try {
    await pushLineMessage({
      to: lineUserId,
      messages: [{ type: 'text', text }],
    })
  } catch (e) {
    console.error('LINE push (line_official_accounts):', e)
  }
}

/** メールアドレスが新規登録・更新されたときのみ LINE push（友だち追加のみでは送らない） */
function notifyTextOnCreate(input: UpsertLineOfficialAccountInput): string | null {
  const active = input.isActive ?? input.lastEventType !== 'unfollow'
  if (!active) return null
  const hasEmail = input.email != null && input.email !== ''
  if (!hasEmail) return null
  if (input.lastEventType === 'user_registration') {
    return 'ユーザー登録とLINEの連携が完了しました。'
  }
  return 'メールアドレスの登録を受け付けました。'
}

function notifyTextOnUpdate(
  patch: Record<string, unknown>,
  input: UpsertLineOfficialAccountInput,
  previousEmail: string | null
): string | null {
  if (input.lastEventType === 'unfollow') return null
  if (patch.is_active === false) return null
  if (!('email' in patch)) return null
  const nextEmail = patch.email as string
  if (nextEmail === previousEmail) return null
  return 'メールアドレスの登録を受け付けました。'
}

function extractEmailFromText(text: string): string | null {
  const m = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/)
  if (!m) return null
  return EMAIL_REGEX.test(m[0]) ? m[0] : null
}

export type UpsertLineOfficialAccountInput = {
  lineUserId: string
  lastEventType: string
  /** 指定時のみ上書き（省略時は既存の email を維持） */
  email?: string | null
  /** 指定時のみ上書き（省略時は既存の user_id を維持） */
  userId?: number | bigint | null
  isActive?: boolean
}

/**
 * line_user_id をキーに insert または update（同一 userId は常に1行）
 */
export async function upsertLineOfficialAccount(
  input: UpsertLineOfficialAccountInput
): Promise<void> {
  const { lineUserId, lastEventType } = input
  const isActive =
    input.isActive ?? (lastEventType === 'unfollow' ? false : true)

  const existing = await LineOfficialAccount.findOne({
    where: { line_user_id: lineUserId },
  })

  const patch: Record<string, unknown> = {
    last_event_type: lastEventType,
    is_active: isActive,
  }
  if (input.email != null && input.email !== '') {
    patch.email = input.email
  }
  if (input.userId != null) {
    patch.user_id = Number(input.userId)
  }

  if (existing) {
    const previousEmail = existing.email
    await existing.update(patch)
    const msg = notifyTextOnUpdate(patch, input, previousEmail)
    if (msg) await pushLineOfficialAccountNotice(lineUserId, msg)
    return
  }

  await LineOfficialAccount.create({
    line_user_id: lineUserId,
    email: input.email ?? null,
    user_id: input.userId != null ? Number(input.userId) : null,
    last_event_type: lastEventType,
    is_active: isActive,
  })

  const createdMsg = notifyTextOnCreate(input)
  if (createdMsg) await pushLineOfficialAccountNotice(lineUserId, createdMsg)
}

/**
 * テキストメッセージからメールを推定し、users と突合して user_id を付与できる場合は付与する
 */
export async function upsertLineOfficialAccountFromMessage(input: {
  lineUserId: string
  messageText: string | null | undefined
}): Promise<void> {
  const text = (input.messageText ?? '').trim()
  const extracted = text ? extractEmailFromText(text) : null
  let email: string | null = null
  let userId: number | null = null
  if (extracted) {
    email = extracted
    const user = await User.findOne({ where: { email } })
    if (user) userId = Number(user.dataValues.id)
  }

  await upsertLineOfficialAccount({
    lineUserId: input.lineUserId,
    lastEventType: 'message',
    ...(email
      ? { email, ...(userId != null ? { userId } : {}) }
      : {}),
  })
}
