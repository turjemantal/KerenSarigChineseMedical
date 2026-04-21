const TOKEN_KEY = 'kc_token'
const CLIENT_KEY = 'kc_client'

export interface ClientProfile {
  _id: string
  phone: string
  name?: string
  email?: string
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getClient(): ClientProfile | null {
  try {
    const s = localStorage.getItem(CLIENT_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function saveAuth(token: string, client: ClientProfile) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(CLIENT_KEY, JSON.stringify(client))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CLIENT_KEY)
}

export function authHeader(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const ADMIN_KEY = 'kc_admin_token'

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_KEY)
}

export function saveAdminToken(token: string) {
  localStorage.setItem(ADMIN_KEY, token)
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_KEY)
}
