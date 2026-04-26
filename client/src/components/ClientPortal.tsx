import { useState, useEffect } from 'react'
import { Enso, Button, Avatar } from './shared'
import { Icon } from './icons'
import { getClient, getToken, clearAuth, authHeader, saveAuth } from '../auth'
import type { ClientProfile } from '../auth'

interface Appointment {
  _id: string
  treatment: string
  date: string
  time: string
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'noshow'
  concern?: string
  notes?: string
}

function useMyAppointments(token: string | null) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = () => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    fetch('/api/appointments/mine', { headers: authHeader() })
      .then(r => r.ok ? r.json() : [])
      .then(setAppointments)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(refresh, [token])
  return { appointments, loading, refresh }
}

const HEB_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']
const HEB_DAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `יום ${HEB_DAYS[d.getDay()]}, ${d.getDate()} ב${HEB_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function isUpcoming(dateStr: string, time: string): boolean {
  const d = new Date(`${dateStr}T${time}`)
  return d > new Date()
}

function isWithin24Hours(dateStr: string, time: string): boolean {
  const diff = new Date(`${dateStr}T${time}`).getTime() - Date.now()
  return diff > 0 && diff < 24 * 60 * 60 * 1000
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'ממתין לאישור', scheduled: 'מאושר', completed: 'הושלם', cancelled: 'בוטל', noshow: 'לא הגעתי',
}
const STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
  pending:   { bg: '#FFF8E6', fg: '#7A5C00' },
  scheduled: { bg: '#E8F0EB', fg: '#2A5C3F' },
  completed: { bg: '#EBE4D6', fg: '#5C4A1E' },
  cancelled: { bg: '#F0EAEA', fg: '#5C2A2A' },
  noshow:    { bg: '#FAE8E4', fg: '#8B2A15' },
}

// ── Login flow for portal ──────────────────────────────────────────────────────
function PortalLogin({ onLogin }: { onLogin: (client: ClientProfile) => void }) {
  const [phase, setPhase] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const normalize = (v: string) => v.replace(/\D/g, '')

  const sendOtp = async () => {
    const p = normalize(phone)
    if (!/^05\d{8}$/.test(p)) { setError('אנא הזינו מספר טלפון ישראלי תקין (05X-XXXXXXX)'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p }),
      })
      if (!res.ok) throw new Error()
      setPhase('otp')
    } catch { setError('שגיאה בשליחת הקוד') } finally { setLoading(false) }
  }

  const verifyOtp = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalize(phone), code: otp }),
      })
      if (!res.ok) { setError('הקוד שגוי, נסו שוב'); return }
      const { token, client } = await res.json()
      saveAuth(token, client)
      onLogin(client)
    } catch { setError('שגיאה, נסו שוב') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F1EA' }}>
      <div className="w-full max-w-[400px] p-8">
        <div className="flex items-center gap-3 mb-10">
          <Enso size={36} />
          <div>
            <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22 }}>קרן שריג</div>
            <div style={{ fontSize: 11, letterSpacing: '0.18em', color: '#4A6B5C' }}>האזור האישי</div>
          </div>
        </div>

        {phase === 'phone' ? (
          <>
            <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 400 }}>כניסה לחשבון</h2>
            <p className="mt-2" style={{ fontSize: 14, color: '#4A6B5C', lineHeight: 1.6 }}>הזינו את מספר הטלפון הרשום לשליחת קוד אימות.</p>
            <div className="mt-8 space-y-4">
              <input value={phone} onChange={e => setPhone(e.target.value)}
                className="field-input" placeholder="050-0000000"
                style={{ direction: 'ltr', textAlign: 'right', fontSize: 18 }}
                onKeyDown={e => e.key === 'Enter' && sendOtp()} />
              {error && <div className="text-[13px]" style={{ color: '#C4634A' }}>{error}</div>}
              <Button variant="primary" onClick={sendOtp} disabled={loading} className="w-full">
                {loading ? 'שולח…' : 'שליחת קוד'} <Icon.ArrowLeft />
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 400 }}>קוד אימות</h2>
            <p className="mt-2" style={{ fontSize: 14, color: '#4A6B5C', lineHeight: 1.6 }}>
              שלחנו קוד ל-<span style={{ direction: 'ltr', display: 'inline-block', color: '#1C2A24' }}>{phone}</span>
            </p>
            <div className="mt-8 space-y-4">
              <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="field-input" placeholder="000000" autoFocus
                style={{ direction: 'ltr', textAlign: 'center', fontSize: 28, letterSpacing: '0.4em' }}
                onKeyDown={e => e.key === 'Enter' && verifyOtp()} />
              {error && <div className="text-[13px]" style={{ color: '#C4634A' }}>{error}</div>}
              <Button variant="primary" onClick={verifyOtp} disabled={loading || otp.length < 6} className="w-full">
                {loading ? 'בודק…' : 'כניסה'} <Icon.ArrowLeft />
              </Button>
              <button onClick={() => { setPhase('phone'); setOtp(''); setError('') }} className="w-full text-center text-[13px] hover:underline" style={{ color: '#4A6B5C' }}>
                → שינוי מספר
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Portal main view ───────────────────────────────────────────────────────────
export default function ClientPortal({ onExit }: { onExit: () => void }) {
  const [client, setClient] = useState<ClientProfile | null>(getClient)
  const token = getToken()
  const { appointments, loading, refresh } = useMyAppointments(client ? token : null)

  const handleLogout = () => {
    clearAuth()
    setClient(null)
    onExit()
  }

  const cancelAppointment = async (id: string) => {
    await fetch(`/api/appointments/${id}/cancel`, { method: 'PATCH', headers: authHeader() })
    refresh()
  }

  if (!client || !token) {
    return <PortalLogin onLogin={c => setClient(c)} />
  }

  const upcoming = appointments.filter(a => (a.status === 'scheduled' || a.status === 'pending') && isUpcoming(a.date, a.time))
  const past = appointments.filter(a => !upcoming.includes(a))

  return (
    <div className="min-h-screen" style={{ background: '#F5F1EA', color: '#1C2A24' }}>
      {/* header */}
      <header className="sticky top-0 z-10 px-6 md:px-12 py-5 flex items-center justify-between" style={{ background: '#F5F1EA', borderBottom: '1px solid rgba(28,42,36,0.1)' }}>
        <div className="flex items-center gap-3">
          <Enso size={30} />
          <div>
            <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20 }}>קרן שריג</div>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', color: '#4A6B5C' }}>האזור האישי</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Avatar name={client.name || client.phone} size={32} />
            <span style={{ fontSize: 13.5 }}>{client.name || client.phone}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>יציאה</Button>
          <button onClick={onExit} className="text-[13px] hover:underline" style={{ color: '#4A6B5C' }}>← לאתר</button>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-6 md:px-0 py-10">
        {/* greeting */}
        <div className="mb-10">
          <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 34, fontWeight: 400 }}>
            {client.name ? `שלום, ${client.name.split(' ')[0]}` : 'האזור האישי'}
          </h1>
          <div className="mt-1 flex items-center gap-2" style={{ fontSize: 13.5, color: '#4A6B5C' }}>
            <Icon.Phone s={13} />
            <span style={{ direction: 'ltr' }}>{client.phone}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center" style={{ color: '#4A6B5C', fontSize: 14 }}>טוען…</div>
        ) : (
          <>
            {/* upcoming */}
            <section className="mb-10">
              <div style={{ fontSize: 11.5, letterSpacing: '0.18em', color: '#4A6B5C', marginBottom: 16 }}>תורים קרובים</div>
              {upcoming.length === 0 ? (
                <div className="p-8 text-center" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2 }}>
                  <div style={{ fontSize: 14, color: '#4A6B5C', lineHeight: 1.7 }}>
                    אין תורים מתוזמנים.
                    <br />
                    <a href="/" style={{ color: '#1C2A24', textDecoration: 'underline' }}>קבעו תור חדש →</a>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(a => (
                    <AppointmentCard key={a._id} appt={a} onCancel={() => cancelAppointment(a._id)} showCancel />
                  ))}
                </div>
              )}
            </section>

            {/* history */}
            {past.length > 0 && (
              <section>
                <div style={{ fontSize: 11.5, letterSpacing: '0.18em', color: '#4A6B5C', marginBottom: 16 }}>היסטוריה</div>
                <div className="space-y-3">
                  {past.map(a => (
                    <AppointmentCard key={a._id} appt={a} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function AppointmentCard({ appt, onCancel, showCancel }: { appt: Appointment; onCancel?: () => void; showCancel?: boolean }) {
  const [cancelPhase, setCancelPhase] = useState<'idle' | 'confirm' | 'warning'>('idle')
  const s = STATUS_COLOR[appt.status] || STATUS_COLOR.scheduled

  return (
    <div className="p-5" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2 }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span style={{ background: s.bg, color: s.fg, fontSize: 11.5, padding: '3px 9px', borderRadius: 12, fontWeight: 500 }}>
              {STATUS_LABEL[appt.status]}
            </span>
          </div>
          <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20 }}>{formatDate(appt.date)}</div>
          <div className="mt-1 flex items-center gap-2" style={{ fontSize: 13.5, color: '#4A6B5C' }}>
            <Icon.Clock s={13} />
            <span style={{ direction: 'ltr' }}>{appt.time}</span>
            <span>· 50 דקות</span>
          </div>
          {appt.concern && (
            <div className="mt-2" style={{ fontSize: 13, color: '#2A3D34' }}>״{appt.concern}״</div>
          )}
        </div>
      </div>

      {showCancel && (appt.status === 'scheduled' || appt.status === 'pending') && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(28,42,36,0.08)' }}>
          {cancelPhase === 'idle' && (
            <button onClick={() => setCancelPhase(isWithin24Hours(appt.date, appt.time) ? 'warning' : 'confirm')}
              className="text-[13px] hover:underline" style={{ color: '#4A6B5C' }}>
              ביטול התור
            </button>
          )}
          {cancelPhase === 'confirm' && (
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 13, color: '#2A3D34' }}>לבטל את התור?</span>
              <button onClick={() => { onCancel?.(); setCancelPhase('idle') }} className="text-[13px] px-3 h-8" style={{ background: '#C4634A', color: '#F5F1EA', borderRadius: 2 }}>כן, בטל</button>
              <button onClick={() => setCancelPhase('idle')} className="text-[13px] hover:underline" style={{ color: '#4A6B5C' }}>חזרה</button>
            </div>
          )}
          {cancelPhase === 'warning' && (
            <div className="p-3 mb-3" style={{ background: '#FFF8E6', border: '1px solid #E8C84A', borderRadius: 2 }}>
              <div style={{ fontSize: 13, color: '#7A5C00', lineHeight: 1.6 }}>
                ביטול בפחות מ-24 שעות לפני הטיפול עשוי לגרור חיוב של 50% מעלות הטיפול.
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={() => { onCancel?.(); setCancelPhase('idle') }} className="text-[13px] px-3 h-8" style={{ background: '#C4634A', color: '#F5F1EA', borderRadius: 2 }}>כן, בטל בכל זאת</button>
                <button onClick={() => setCancelPhase('idle')} className="text-[13px] hover:underline" style={{ color: '#4A6B5C' }}>חזרה</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
