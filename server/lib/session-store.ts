import crypto from 'crypto'

type SessionType = 'admin' | 'user'

interface BaseSession {
  id: number
  type: SessionType
  createdAt: number
  // 有効期限（ミリ秒）。例: 7日
  expiresAt: number
}

type AdminSession = BaseSession & { type: 'admin' }
type UserSession = BaseSession & { type: 'user' }

type Session = AdminSession | UserSession

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7日間

const sessions = new Map<string, Session>()

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

export const sessionStore = {
  createAdminSession(adminId: number): string {
    const token = generateToken()
    const now = Date.now()

    const session: AdminSession = {
      id: adminId,
      type: 'admin',
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    }

    sessions.set(token, session)
    return token
  },

  createUserSession(userId: number): string {
    const token = generateToken()
    const now = Date.now()

    const session: UserSession = {
      id: userId,
      type: 'user',
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    }

    sessions.set(token, session)
    return token
  },

  getAdminSession(token: string): AdminSession | null {
    const session = sessions.get(token)
    if (!session || session.type !== 'admin') return null

    if (session.expiresAt < Date.now()) {
      sessions.delete(token)
      return null
    }

    return session
  },

  getUserSession(token: string): UserSession | null {
    const session = sessions.get(token)
    if (!session || session.type !== 'user') return null

    if (session.expiresAt < Date.now()) {
      sessions.delete(token)
      return null
    }

    return session
  },

  deleteSession(token: string) {
    sessions.delete(token)
  },
}


