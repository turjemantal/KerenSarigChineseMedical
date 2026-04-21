import { useState } from 'react'
import { Enso, Icon, Button } from './shared'
import { saveAdminToken } from '../auth'

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!password.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) { setError('סיסמה שגויה'); return }
      const { token } = await res.json()
      saveAdminToken(token)
      onSuccess()
    } catch {
      setError('שגיאה בהתחברות, נסו שוב')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#1C2A24' }}>
      <div className="w-full max-w-[380px] px-8 py-12" style={{ background: '#F5F1EA', borderRadius: 2 }}>
        <div className="flex items-center gap-3 mb-10">
          <Enso size={34} />
          <div className="leading-none">
            <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20 }}>קרן שריג</div>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', color: '#4A6B5C', marginTop: 3 }}>ממשק ניהול</div>
          </div>
        </div>

        <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 400 }}>כניסה למנהל</h2>
        <p className="mt-2" style={{ fontSize: 14, color: '#4A6B5C', lineHeight: 1.6 }}>הזינו את סיסמת הניהול כדי להמשיך.</p>

        <div className="mt-8 space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="field-input"
            placeholder="••••••••"
            autoFocus
            style={{ fontSize: 18, letterSpacing: '0.2em' }}
          />
          {error && <div style={{ fontSize: 13, color: '#C4634A' }}>{error}</div>}
          <Button variant="primary" onClick={handleLogin} disabled={loading || !password.trim()} className="w-full">
            {loading ? 'מתחבר…' : 'כניסה'} <Icon.ArrowLeft />
          </Button>
        </div>
      </div>
    </div>
  )
}
