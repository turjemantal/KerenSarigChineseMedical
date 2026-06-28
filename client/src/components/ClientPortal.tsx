import { useState, useEffect, useCallback } from 'react'
import { Enso, Button } from './shared'
import { Icon } from './icons'
import { getClient, clearAuth, saveAuth, hasValidClientToken, clientSessionExpired, clientFetch, CLIENT_UNAUTHORIZED_EVENT } from '../auth'
import type { ClientProfile } from '../auth'
import { AppointmentStatus, APPOINTMENT_STATUS_LABELS, APPOINTMENT_DURATION_MINUTES, FREE_CANCELLATION_HOURS, MS_PER_HOUR, PHONE_REGEX, UI_ERRORS } from '../constants'
import BookingModal from './BookingModal'
import ReschedulePicker from './ReschedulePicker'
import { AddToCalendarButton } from './AddToCalendarButton'

interface Appointment {
  _id: string
  treatment: string
  date: string
  time: string
  status: AppointmentStatus
  concern?: string
  notes?: string
}

function useMyAppointments(token: string | null) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    clientFetch('/api/appointments/mine')
      // Only overwrite the list on a genuine OK response. A transient failure
      // (rate-limit 429, a blip) must NOT blank the screen to "no appointments" —
      // keep whatever is already shown until the next successful refresh.
      .then(r => { if (!r.ok) throw new Error(`mine ${r.status}`); return r.json() })
      .then(data => setAppointments(Array.isArray(data) ? data : []))
      .catch(() => { /* keep the existing list */ })
      .finally(() => setLoading(false))
  }, [token])

  const patchAppointment = useCallback((id: string, changes: Partial<Appointment>) =>
    setAppointments(prev => prev.map(a => a._id === id ? { ...a, ...changes } : a)),
  [])

  useEffect(() => { refresh() }, [refresh])
  return { appointments, loading, refresh, patchAppointment }
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

// true while inside the charge window (less than the free window before the appt) —
// drives the cancel warning and hides "change time" (server enforces this too).
function withinChargeWindow(dateStr: string, time: string): boolean {
  const diff = new Date(`${dateStr}T${time}`).getTime() - Date.now()
  return diff > 0 && diff < FREE_CANCELLATION_HOURS * MS_PER_HOUR
}

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  ...APPOINTMENT_STATUS_LABELS,
  [AppointmentStatus.NoShow]: 'לא הגעתי',
  [AppointmentStatus.Rejected]: 'הבקשה נדחתה',
}
const STATUS_COLOR: Record<AppointmentStatus, { bg: string; fg: string }> = {
  [AppointmentStatus.Pending]:   { bg: '#FFF8E6', fg: '#7A5C00' },
  [AppointmentStatus.Scheduled]: { bg: '#E8F0EB', fg: '#2A5C3F' },
  [AppointmentStatus.Completed]: { bg: '#EBE4D6', fg: '#5C4A1E' },
  [AppointmentStatus.Cancelled]: { bg: '#F0EAEA', fg: '#5C2A2A' },
  [AppointmentStatus.Rejected]:  { bg: '#F0EAEA', fg: '#7A3030' },
  [AppointmentStatus.NoShow]:    { bg: '#FAE8E4', fg: '#8B2A15' },
}

// ── Login flow for portal ──────────────────────────────────────────────────────
function PortalLogin({ onLogin, expired = false }: { onLogin: (client: ClientProfile) => void; expired?: boolean }) {
  const [phase, setPhase] = useState<'phone' | 'otp' | 'name'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Chrome Android / Samsung Internet: auto-read OTP from incoming SMS
  // iOS Safari / Firefox use the autocomplete="one-time-code" attribute instead
  useEffect(() => {
    if (phase !== 'otp') return
    if (!('OTPCredential' in window)) return
    const controller = new AbortController()
    ;(navigator.credentials as CredentialsContainer & { get(o: object): Promise<{ code: string }> })
      .get({ otp: { transport: ['sms'] }, signal: controller.signal })
      .then((credential) => setOtp(credential.code))
      .catch(() => { /* dismissed, timed-out, or unsupported — silent no-op */ })
    return () => controller.abort()
  }, [phase])

  const normalize = (v: string) => v.replace(/\D/g, '')

  const sendOtp = async () => {
    const p = normalize(phone)
    if (!PHONE_REGEX.test(p)) { setError(UI_ERRORS.INVALID_PHONE); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p }),
      })
      if (!res.ok) throw new Error()
      setPhase('otp')
    } catch { setError(UI_ERRORS.OTP_SEND_FAILED) } finally { setLoading(false) }
  }

  const verifyOtp = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalize(phone), code: otp }),
      })
      if (!res.ok) { setError(UI_ERRORS.OTP_WRONG); return }
      const { token, client } = await res.json()
      saveAuth(token, client)
      // Collect the name ONCE here (new registrants have none) so booking never has
      // to ask later — and there's no mid-session token refresh during booking.
      if (!client.name) { setPhase('name'); return }
      onLogin(client)
    } catch { setError(UI_ERRORS.GENERIC) } finally { setLoading(false) }
  }

  const submitName = async () => {
    const n = name.trim()
    if (!n) return
    setLoading(true); setError('')
    try {
      const res = await clientFetch('/api/auth/me/name', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n }),
      })
      if (!res.ok) throw new Error()
      const { token, client } = await res.json()
      saveAuth(token, client)
      onLogin(client)
    } catch { setError(UI_ERRORS.GENERIC) } finally { setLoading(false) }
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

        {expired && (
          <div className="mb-5 px-3 py-2" style={{ background: '#FAE8E4', color: '#8B2A15', fontSize: 13, borderRadius: 2 }}>
            פג תוקף ההתחברות, יש להתחבר מחדש.
          </div>
        )}
        {phase === 'phone' && (
          <>
            <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 400 }}>כניסה לחשבון</h2>
            <p className="mt-2" style={{ fontSize: 14, color: '#4A6B5C', lineHeight: 1.6 }}>הזינו את מספר הטלפון הרשום לשליחת קוד אימות.</p>
            <div className="mt-8 space-y-4">
              <input value={phone} onChange={e => setPhone(e.target.value)}
                className="field-input" placeholder="050-0000000"
                style={{ direction: 'ltr', textAlign: 'right', fontSize: 18 }}
                onKeyDown={e => e.key === 'Enter' && sendOtp()} />
              {error && <div className="text-[13px]" style={{ color: '#C4634A' }}>{error}</div>}
              <Button variant="primary" pill onClick={sendOtp} disabled={loading} className="w-full">
                {loading ? 'שולח…' : 'שליחת קוד'} <Icon.ArrowLeft />
              </Button>
            </div>
          </>
        )}
        {phase === 'otp' && (
          <>
            <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 400 }}>קוד אימות</h2>
            <p className="mt-2" style={{ fontSize: 14, color: '#4A6B5C', lineHeight: 1.6 }}>
              שלחנו קוד ל-<span style={{ direction: 'ltr', display: 'inline-block', color: '#1C2A24' }}>{phone}</span>
            </p>
            <div className="mt-8 space-y-4">
              <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="field-input" placeholder="000000" autoFocus
                inputMode="numeric" autoComplete="one-time-code"
                style={{ direction: 'ltr', textAlign: 'center', fontSize: 28, letterSpacing: '0.4em' }}
                onKeyDown={e => e.key === 'Enter' && verifyOtp()} />
              {error && <div className="text-[13px]" style={{ color: '#C4634A' }}>{error}</div>}
              <Button variant="primary" pill onClick={verifyOtp} disabled={loading || otp.length < 6} className="w-full">
                {loading ? 'בודק…' : 'כניסה'} <Icon.ArrowLeft />
              </Button>
              <button onClick={() => { setPhase('phone'); setOtp(''); setError('') }} className="w-full text-center text-[13px] hover:underline" style={{ color: '#4A6B5C' }}>
                → שינוי מספר
              </button>
            </div>
          </>
        )}
        {phase === 'name' && (
          <>
            <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 400 }}>ברוכים הבאים!</h2>
            <p className="mt-2" style={{ fontSize: 14, color: '#4A6B5C', lineHeight: 1.6 }}>איך קוראים לכם? נשתמש בשם לתיאום הטיפולים.</p>
            <div className="mt-8 space-y-4">
              <input value={name} onChange={e => setName(e.target.value)} autoFocus
                className="field-input" placeholder="שם פרטי ושם משפחה"
                onKeyDown={e => e.key === 'Enter' && name.trim() && submitName()} />
              {error && <div className="text-[13px]" style={{ color: '#C4634A' }}>{error}</div>}
              <Button variant="primary" pill onClick={submitName} disabled={loading || !name.trim()} className="w-full">
                {loading ? 'שומר…' : 'המשך'} <Icon.ArrowLeft />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Name prompt — shown when a valid session exists but name was never collected ──
function PortalNamePrompt({ client, onSave }: { client: ClientProfile; onSave: (c: ClientProfile) => void }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    const n = name.trim()
    if (!n) return
    setLoading(true); setError('')
    try {
      const res = await clientFetch('/api/auth/me/name', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n }),
      })
      if (!res.ok) {
        // Server rejected → session is stale (user not in DB). Clear and re-login.
        clearAuth()
        window.dispatchEvent(new Event(CLIENT_UNAUTHORIZED_EVENT))
        return
      }
      const { token, client: updated } = await res.json()
      saveAuth(token, updated)
      onSave(updated)
    } catch { setError(UI_ERRORS.GENERIC) } finally { setLoading(false) }
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
        <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 400 }}>ברוכים הבאים!</h2>
        <p className="mt-2" style={{ fontSize: 14, color: '#4A6B5C', lineHeight: 1.6 }}>
          איך קוראים לכם? נשתמש בשם לתיאום הטיפולים.
          <span className="block mt-1" style={{ direction: 'ltr', color: '#1C2A24' }}>{client.phone}</span>
        </p>
        <div className="mt-8 space-y-4">
          <input value={name} onChange={e => setName(e.target.value)} autoFocus
            className="field-input" placeholder="שם פרטי ושם משפחה"
            onKeyDown={e => e.key === 'Enter' && name.trim() && submit()} />
          {error && <div className="text-[13px]" style={{ color: '#C4634A' }}>{error}</div>}
          <Button variant="primary" pill onClick={submit} disabled={loading || !name.trim()} className="w-full">
            {loading ? 'שומר…' : 'המשך'} <Icon.ArrowLeft />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Portal main view ───────────────────────────────────────────────────────────
export default function ClientPortal({ onExit }: { onExit: () => void }) {
  const [client, setClient] = useState<ClientProfile | null>(getClient)
  const [expired, setExpired] = useState(clientSessionExpired())
  const [booking, setBooking] = useState(false)
  const hasSession = hasValidClientToken()
  const { appointments, loading, refresh, patchAppointment } = useMyAppointments(client?.name && hasSession ? 'ok' : null)

  useEffect(() => {
    const onUnauthorized = () => { setClient(null); setExpired(true) }
    window.addEventListener(CLIENT_UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(CLIENT_UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const handleLogout = () => {
    clearAuth()
    setClient(null)
    onExit()
  }

  // ── appointment mutations — all use patchAppointment for instant in-place updates.
  // refresh() is reserved for after a new booking (new ID we can't predict locally).

  const cancelAppointment = async (id: string) => {
    const res = await clientFetch(`/api/appointments/${id}/cancel`, { method: 'PATCH' })
    if (res.ok) patchAppointment(id, { status: AppointmentStatus.Cancelled })
  }

  const rescheduleAppointment = async (id: string, date: string, time: string): Promise<{ ok: boolean; error?: string }> => {
    const res = await clientFetch(`/api/appointments/${id}/reschedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, time }),
    })
    if (res.ok) { patchAppointment(id, { date, time }); return { ok: true } }
    let error: string = UI_ERRORS.GENERIC
    try {
      const body = await res.json()
      const msg = Array.isArray(body?.message) ? body.message[0] : body?.message
      if (typeof msg === 'string') error = msg
    } catch { /* keep generic */ }
    return { ok: false, error }
  }

  if (!client || !hasSession) {
    return <PortalLogin expired={expired} onLogin={c => { setExpired(false); setClient(c) }} />
  }

  if (!client.name) {
    return <PortalNamePrompt client={client} onSave={setClient} />
  }

  const isUpcomingAppt = (a: Appointment) =>
    (a.status === AppointmentStatus.Scheduled || a.status === AppointmentStatus.Pending) &&
    isUpcoming(a.date, a.time)

  const upcoming = appointments.filter(isUpcomingAppt)
  const past = appointments
    .filter(a => !isUpcomingAppt(a))
    .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime())
    .slice(0, 10)

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
          {client.name && (
            <span className="hidden md:block" style={{ fontSize: 13.5 }}>{client.name}</span>
          )}
          <Button variant="primary" size="sm" pill onClick={() => setBooking(true)}>קביעת תור</Button>
          <Button variant="ghost" size="sm" pill onClick={handleLogout}>יציאה</Button>
          <button onClick={onExit} className="text-[13px] hover:underline" style={{ color: '#4A6B5C' }}>← לאתר</button>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-6 md:px-0 py-10">
        {/* greeting */}
        <div className="mb-10">
          <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 34, fontWeight: 400 }}>
            {client.name ? `שלום, ${client.name.split(' ')[0]}` : 'האזור האישי'}
          </h1>
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
                    <button onClick={() => setBooking(true)} style={{ color: '#1C2A24', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}>
                      קבעו תור חדש →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(a => (
                    <AppointmentCard
                      key={a._id}
                      appt={a}
                      onCancel={() => cancelAppointment(a._id)}
                      onReschedule={(date, time) => rescheduleAppointment(a._id, date, time)}
                      showCancel
                    />
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

      {/* BookingModal — reuse existing component; opens at schedule step since client is already logged in */}
      <BookingModal
        open={booking}
        onClose={() => { setBooking(false); refresh() }}
        onPortal={() => { setBooking(false); refresh() }}
      />
    </div>
  )
}

function AppointmentCard({ appt, onCancel, onReschedule, showCancel }: {
  appt: Appointment
  onCancel?: () => void
  onReschedule?: (date: string, time: string) => Promise<{ ok: boolean; error?: string }>
  showCancel?: boolean
}) {
  const [cancelPhase, setCancelPhase] = useState<'idle' | 'confirm' | 'warning'>('idle')
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const s = STATUS_COLOR[appt.status] || STATUS_COLOR[AppointmentStatus.Scheduled]
  // reschedule is only offered while still in the free window (server enforces it too)
  const canReschedule = !!onReschedule && !withinChargeWindow(appt.date, appt.time)

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
            <span>· {APPOINTMENT_DURATION_MINUTES} דקות</span>
          </div>
          {appt.concern && (
            <div className="mt-2" style={{ fontSize: 13, color: '#2A3D34' }}>״{appt.concern}״</div>
          )}
          {isUpcoming(appt.date, appt.time) &&
            (appt.status === AppointmentStatus.Pending || appt.status === AppointmentStatus.Scheduled) && (
            <div className="mt-3">
              <AddToCalendarButton date={appt.date} time={appt.time} />
            </div>
          )}
        </div>
      </div>

      {showCancel && (appt.status === AppointmentStatus.Scheduled || appt.status === AppointmentStatus.Pending) && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(28,42,36,0.08)' }}>
          {cancelPhase === 'idle' && !rescheduleOpen && (
            <div className="flex items-center gap-4">
              {canReschedule && (
                <button onClick={() => setRescheduleOpen(true)}
                  className="text-[13px] hover:underline" style={{ color: '#4A6B5C' }}>
                  שינוי מועד
                </button>
              )}
              <button onClick={() => setCancelPhase(appt.status === AppointmentStatus.Scheduled && withinChargeWindow(appt.date, appt.time) ? 'warning' : 'confirm')}
                className="text-[13px] hover:underline" style={{ color: '#4A6B5C' }}>
                ביטול התור
              </button>
            </div>
          )}
          {rescheduleOpen && onReschedule && (
            <ReschedulePicker
              onSubmit={onReschedule}
              onClose={() => setRescheduleOpen(false)}
            />
          )}
          {cancelPhase === 'confirm' && (
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 13, color: '#2A3D34' }}>לבטל את התור?</span>
              <button onClick={() => { onCancel?.(); setCancelPhase('idle') }} className="text-[13px] px-3 h-8" style={{ background: '#C4634A', color: '#F5F1EA', borderRadius: 999, padding: '0 16px' }}>כן, בטל</button>
              <button onClick={() => setCancelPhase('idle')} className="text-[13px] hover:underline" style={{ color: '#4A6B5C' }}>חזרה</button>
            </div>
          )}
          {cancelPhase === 'warning' && (
            <div className="p-3 mb-3" style={{ background: '#FFF8E6', border: '1px solid #E8C84A', borderRadius: 2 }}>
              <div style={{ fontSize: 13, color: '#7A5C00', lineHeight: 1.6 }}>
                ביטול בפחות מ-{FREE_CANCELLATION_HOURS} שעות לפני הטיפול עשוי לגרור חיוב של 50% מעלות הטיפול.
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={() => { onCancel?.(); setCancelPhase('idle') }} className="text-[13px] px-3 h-8" style={{ background: '#C4634A', color: '#F5F1EA', borderRadius: 999, padding: '0 16px' }}>כן, בטל בכל זאת</button>
                <button onClick={() => setCancelPhase('idle')} className="text-[13px] hover:underline" style={{ color: '#4A6B5C' }}>חזרה</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

