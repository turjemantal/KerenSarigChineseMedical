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

export function adminAuthHeader(): Record<string, string> {
  const token = getAdminToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Session validity ────────────────────────────────────────────────────────────
// A stored JWT is only useful until its `exp`. Decode it locally so we never render
// an authed view (dashboard / portal) behind an already-expired token. Anything we
// can't parse is treated as expired/invalid.
function isJwtExpired(token: string): boolean {
  try {
    // JWTs are base64url — map back to standard base64 before decoding so payloads
    // containing '-' or '_' don't throw and get mistaken for an expired token.
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export function hasValidAdminToken(): boolean {
  const token = getAdminToken()
  return !!token && !isJwtExpired(token)
}

export function hasValidClientToken(): boolean {
  const token = getToken()
  return !!token && !isJwtExpired(token)
}

// A token is stored but no longer valid — used to show a "session expired" notice
// on a cold page load (the 401 path covers expiry that happens mid-session).
export function adminSessionExpired(): boolean {
  return !!getAdminToken() && !hasValidAdminToken()
}

export function clientSessionExpired(): boolean {
  return !!getToken() && !hasValidClientToken()
}

// Events fired when the server rejects a token (401). Views listen and drop back to
// their login screen instead of getting stuck behind dead requests.
export const ADMIN_UNAUTHORIZED_EVENT = 'admin-unauthorized'
export const CLIENT_UNAUTHORIZED_EVENT = 'client-unauthorized'

// Centralized authed fetch: injects the auth header and, on a 401, clears the
// session and announces it so the UI can return to login with a notice.
async function authedFetch(
  input: RequestInfo | URL,
  init: RequestInit,
  header: () => Record<string, string>,
  onUnauthorized: () => void,
): Promise<Response> {
  const res = await fetch(input, { ...init, headers: { ...(init.headers ?? {}), ...header() } })
  if (res.status === 401) onUnauthorized()
  return res
}

export function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  return authedFetch(input, init, adminAuthHeader, () => {
    clearAdminToken()
    window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT))
  })
}

export function clientFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  return authedFetch(input, init, authHeader, () => {
    clearAuth()
    window.dispatchEvent(new Event(CLIENT_UNAUTHORIZED_EVENT))
  })
}
