export interface PublicFormDraftPayload {
  formData: Record<string, any>
  consentAccepted: boolean
  eventId: string | null
}

/** 公開フォーム関連の sessionStorage キーはすべてこの接頭辞で始める */
export const PUBLIC_FORM_SESSION_PREFIX = 'nasunest_public_form_'

const DRAFT_KEY_PREFIX = `${PUBLIC_FORM_SESSION_PREFIX}draft_`

function draftKey(formId: string) {
  return `${DRAFT_KEY_PREFIX}${formId}`
}

/**
 * 公開フォーム用の sessionStorage をまとめて削除（アプリ起動時のリセット用）
 */
function clearPublicFormSessionStorage() {
  if (!import.meta.client) return
  const keys: string[] = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i)
    if (k?.startsWith(PUBLIC_FORM_SESSION_PREFIX)) {
      keys.push(k)
    }
  }
  for (const k of keys) {
    sessionStorage.removeItem(k)
  }
}

/**
 * 公開フォームの下書き（sessionStorage）。
 * setup の同期コンテキスト内で呼び出し、返却メソッドを利用してください。
 */
export function usePublicFormDraft() {
  function saveDraft(formId: string, payload: PublicFormDraftPayload) {
    if (!import.meta.client) return
    sessionStorage.setItem(draftKey(formId), JSON.stringify(payload))
  }

  function loadDraft(formId: string): PublicFormDraftPayload | null {
    if (!import.meta.client) return null
    try {
      const raw = sessionStorage.getItem(draftKey(formId))
      if (!raw) return null
      return JSON.parse(raw) as PublicFormDraftPayload
    } catch {
      return null
    }
  }

  function clearDraft(formId: string) {
    if (!import.meta.client) return
    sessionStorage.removeItem(draftKey(formId))
  }

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    clearPublicFormSessionStorage,
  }
}
