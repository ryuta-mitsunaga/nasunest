import crypto from 'crypto'

// 環境変数から暗号化キーを取得（32バイト = 256ビット）
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }
  
  // キーが32バイト未満の場合はハッシュ化して32バイトにする
  if (key.length < 32) {
    return crypto.createHash('sha256').update(key).digest()
  }
  
  // 32バイト以上の場合、最初の32バイトを使用
  return Buffer.from(key.slice(0, 32), 'utf-8')
}

// 暗号化アルゴリズム
const ALGORITHM = 'aes-256-gcm'

/**
 * IDを暗号化して文字列として返す
 */
export const encryptId = (id: number): string => {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(16) // 初期化ベクトル（16バイト）
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  // IDを文字列に変換して暗号化
  const encrypted = Buffer.concat([
    cipher.update(String(id), 'utf-8'),
    cipher.final(),
  ])
  
  // 認証タグを取得
  const authTag = cipher.getAuthTag()
  
  // IV + 認証タグ + 暗号化データを結合してBase64エンコード
  const combined = Buffer.concat([iv, authTag, encrypted])
  return combined.toString('base64')
}

/**
 * 暗号化された文字列を復号化してIDを取得
 */
export const decryptId = (encryptedId: string): number | null => {
  try {
    const key = getEncryptionKey()
    const combined = Buffer.from(encryptedId, 'base64')
    
    // IV（16バイト）、認証タグ（16バイト）、暗号化データに分割
    const iv = combined.slice(0, 16)
    const authTag = combined.slice(16, 32)
    const encrypted = combined.slice(32)
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    
    // 復号化
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ])
    
    const id = parseInt(decrypted.toString('utf-8'), 10)
    if (isNaN(id)) {
      return null
    }
    
    return id
  } catch (error) {
    // 復号化に失敗した場合（無効なトークン、改ざんなど）
    return null
  }
}

