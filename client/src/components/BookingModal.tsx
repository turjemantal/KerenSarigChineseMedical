import { useState, useEffect, useRef } from 'react'
import { Enso, Chop, Icon, Button, Label, FormField } from './shared'
import { getClient, getToken, saveAuth, authHeader } from '../auth'
import type { ClientProfile } from '../auth'

// ── types ──────────────────────────────────────────────────────────────────────
interface BookingData {
  date: Date | null
  time: string | null
  concern: string
  name: string
  notes: string
}

type ModalStep = 'phone' | 'otp' | 'schedule' | 'details' | 'confirm' | 'done'

// ── main modal ─────────────────────────────────────────────────────────────────
export default function BookingModal({ open, onClose, onPortal }: { open: boolean; onClose: () => void; onPortal?: () => void }) {
  const existingClient = getClient()
  const isLoggedIn = !!getToken() && !!existingClient

  const [step, setStep] = useState<ModalStep>(isLoggedIn ? 'schedule' : 'phone')
  const [client, setClient] = useState<ClientProfile | null>(existingClient)
  const [submitting, setSubmitting] = useState(false)
  const [data, setData] = useState<BookingData>({
    date: null, time: null,
    concern: '',
    name: existingClient?.name || '', notes: '',
  })

  useEffect(() => {
    if (open) {
      const c = getClient()
      setClient(c)
      setData(d => ({ ...d, name: c?.name || '' }))
      setStep(getToken() && c ? 'schedule' : 'phone')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const update = (k: keyof BookingData, v: BookingData[keyof BookingData]) =>
    setData(d => ({ ...d, [k]: v }))

  const handleBooked = async () => {
    if (!data.date || !data.time) return
    const d = data.date
    const pad = (n: number) => String(n).padStart(2, '0')
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    setSubmitting(true)
    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          concern: data.concern,
          date: dateStr,
          time: data.time,
          notes: data.notes,
        }),
      })
    } catch { /* non-blocking */ } finally {
      setSubmitting(false)
      setStep('done')
    }
  }

  const sidebarSteps: { id: ModalStep; label: string }[] = [
    { id: 'schedule', label: 'בחירת מועד' },
    { id: 'details', label: 'פרטים' },
    { id: 'confirm', label: 'אישור' },
  ]
  const activeIdx = sidebarSteps.findIndex(s => s.id === step)

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: 'rgba(28,42,36,0.55)', backdropFilter: 'blur(4px)', animation: 'fadeIn 200ms ease-out' }}
      onClick={onClose}>
      <div className="relative w-full md:max-w-[920px] max-h-[95vh] overflow-hidden flex flex-col md:flex-row"
        style={{ background: '#F5F1EA', borderRadius: 2, animation: 'slideUp 260ms cubic-bezier(.2,.8,.2,1)' }}
        onClick={e => e.stopPropagation()}>

        {/* sidebar — shown only after auth */}
        {(step === 'schedule' || step === 'details' || step === 'confirm' || step === 'done') && (
          <div className="hidden md:flex md:w-[300px] flex-col justify-between p-8" style={{ background: '#1C2A24', color: '#F5F1EA' }}>
            <div>
              <div className="flex items-center gap-3 mb-10">
                <Enso size={32} color="#F5F1EA" />
                <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20 }}>קרן שריג</div>
              </div>
              <div style={{ fontSize: 11.5, letterSpacing: '0.22em', color: '#B8C5B8' }}>קביעת תור</div>
              <h3 className="mt-3" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26, lineHeight: 1.2, fontWeight: 400 }}>
                {client?.name ? `שלום, ${client.name.split(' ')[0]}` : 'ברוכים הבאים'}
              </h3>
              <ol className="mt-10 space-y-5">
                {sidebarSteps.map((s, i) => (
                  <li key={s.id} className="flex items-start gap-3" style={{ opacity: activeIdx >= i ? 1 : 0.4 }}>
                    <span className="flex items-center justify-center" style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: activeIdx > i ? '#C4634A' : activeIdx === i ? '#F5F1EA' : 'transparent',
                      color: activeIdx > i ? '#F5F1EA' : activeIdx === i ? '#1C2A24' : '#B8C5B8',
                      border: activeIdx < i ? '1px solid rgba(245,241,234,0.4)' : 'none',
                      fontSize: 11, fontWeight: 600, flexShrink: 0, marginTop: 1,
                    }}>
                      {activeIdx > i ? <Icon.Check s={12} /> : i + 1}
                    </span>
                    <div style={{ fontSize: 14 }}>{s.label}</div>
                  </li>
                ))}
              </ol>
            </div>
            <div style={{ fontSize: 12.5, color: '#B8C5B8', lineHeight: 1.6 }}>
              <div style={{ fontSize: 11, marginBottom: 4 }}>{client?.phone}</div>
              יש שאלות? <span style={{ color: '#F5F1EA', direction: 'ltr', display: 'inline-block' }}>050-9031503</span>
            </div>
          </div>
        )}

        {/* main content */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-6 md:px-10 pt-6 pb-2">
            <div />
            <button onClick={onClose} className="p-1 hover:opacity-60" aria-label="סגירה"><Icon.Close /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-6">
            {step === 'phone'    && <StepPhone    onNext={(c) => { setClient(c); setData(d => ({ ...d, name: c.name || '' })); setStep('schedule') }} />}
            {step === 'schedule' && <StepSchedule data={data} update={update} />}
            {step === 'details'  && <StepDetails  data={data} update={update} client={client} />}
            {step === 'confirm'  && <StepConfirm  data={data} client={client} />}
            {step === 'done'     && <StepDone data={data} client={client} onPortal={onPortal} />}
          </div>

          {/* footer navigation */}
          {step === 'schedule' && (
            <Footer>
              <button onClick={onClose} className="text-[14px] hover:underline" style={{ color: '#4A6B5C' }}>ביטול</button>
              <Button variant="primary" onClick={() => setStep('details')} disabled={!data.date || !data.time}>
                המשך <Icon.ArrowLeft />
              </Button>
            </Footer>
          )}
          {step === 'details' && (
            <Footer>
              <button onClick={() => setStep('schedule')} className="text-[14px] hover:underline" style={{ color: '#4A6B5C' }}>→ חזרה</button>
              <Button variant="primary" onClick={() => setStep('confirm')} disabled={!client?.name && !data.name.trim()}>
                המשך <Icon.ArrowLeft />
              </Button>
            </Footer>
          )}
          {step === 'confirm' && (
            <Footer>
              <button onClick={() => setStep('details')} className="text-[14px] hover:underline" style={{ color: '#4A6B5C' }}>→ חזרה</button>
              <Button variant="primary" onClick={handleBooked} disabled={submitting}>
                {submitting ? 'קובע תור…' : 'אישור התור'} <Icon.ArrowLeft />
              </Button>
            </Footer>
          )}
          {step === 'done' && (
            <Footer>
              <Button variant="primary" onClick={onClose}>סיום</Button>
            </Footer>
          )}
        </div>
      </div>
    </div>
  )
}

function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 md:px-10 py-5 flex items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(28,42,36,0.1)' }}>
      {children}
    </div>
  )
}

// ── Step: Phone + OTP + Name ───────────────────────────────────────────────────
function StepPhone({ onNext }: { onNext: (client: ClientProfile) => void }) {
  const [phase, setPhase] = useState<'phone' | 'otp' | 'name'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [verifiedClient, setVerifiedClient] = useState<ClientProfile | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const otpRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  const normalizePhone = (v: string) => v.replace(/\D/g, '')

  const sendOtp = async () => {
    const p = normalizePhone(phone)
    if (!/^05\d{8}$/.test(p)) { setError('אנא הזינו מספר טלפון ישראלי תקין (05X-XXXXXXX)'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p }),
      })
      if (!res.ok) throw new Error()
      setPhase('otp')
      setTimeout(() => otpRef.current?.focus(), 100)
    } catch { setError('שגיאה בשליחת הקוד, נסו שוב') } finally { setLoading(false) }
  }

  const verifyOtp = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizePhone(phone), code: otp }),
      })
      if (!res.ok) { setError('הקוד שגוי, נסו שוב'); return }
      const { token, client } = await res.json()
      saveAuth(token, client)
      if (!client.name) {
        setVerifiedClient(client)
        setPhase('name')
        setTimeout(() => nameRef.current?.focus(), 100)
      } else {
        onNext(client)
      }
    } catch { setError('שגיאה, נסו שוב') } finally { setLoading(false) }
  }

  const submitName = async () => {
    if (!name.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/me/name', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (res.ok) {
        const { token, client } = await res.json()
        saveAuth(token, client)
        onNext(client)
      } else {
        // proceed anyway with local name
        onNext({ ...verifiedClient!, name: name.trim() })
      }
    } catch { onNext({ ...verifiedClient!, name: name.trim() }) } finally { setLoading(false) }
  }

  return (
    <div className="py-8 max-w-[440px]">
      <h3 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 400 }}>קביעת תור</h3>

      {phase === 'phone' && (
        <>
          <p className="mt-3" style={{ fontSize: 14.5, lineHeight: 1.7, color: '#2A3D34' }}>
            הזינו את מספר הטלפון שלכם — נשלח קוד אימות קצר.
          </p>
          <div className="mt-8">
            <Label>מספר טלפון</Label>
            <input value={phone} onChange={e => setPhone(e.target.value)} autoFocus
              className="field-input mt-3" placeholder="050-0000000"
              style={{ direction: 'ltr', textAlign: 'right', fontSize: 18 }}
              onKeyDown={e => e.key === 'Enter' && sendOtp()} />
            {error && <div className="mt-2 text-[13px]" style={{ color: '#C4634A' }}>{error}</div>}
          </div>
          <div className="mt-6">
            <Button variant="primary" onClick={sendOtp} disabled={loading}>
              {loading ? 'שולח…' : 'שליחת קוד'} <Icon.ArrowLeft />
            </Button>
          </div>
        </>
      )}

      {phase === 'otp' && (
        <>
          <p className="mt-3" style={{ fontSize: 14.5, lineHeight: 1.7, color: '#2A3D34' }}>
            שלחנו קוד בן 6 ספרות למספר{' '}
            <span style={{ direction: 'ltr', display: 'inline-block', fontWeight: 600 }}>{phone}</span>.
          </p>
          <div className="mt-8">
            <Label>קוד אימות</Label>
            <input ref={otpRef} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="field-input mt-3" placeholder="000000"
              style={{ direction: 'ltr', textAlign: 'center', fontSize: 24, letterSpacing: '0.35em' }}
              onKeyDown={e => e.key === 'Enter' && otp.length === 6 && verifyOtp()} />
          </div>
          {error && <div className="mt-3 text-[13px]" style={{ color: '#C4634A' }}>{error}</div>}
          <div className="mt-6 flex items-center gap-4">
            <Button variant="primary" onClick={verifyOtp} disabled={loading || otp.length < 6}>
              {loading ? 'בודק…' : 'אימות'} <Icon.ArrowLeft />
            </Button>
            <button onClick={() => { setPhase('phone'); setOtp(''); setError('') }} className="text-[13px] hover:underline" style={{ color: '#4A6B5C' }}>
              → שנה מספר
            </button>
          </div>
          <p className="mt-4" style={{ fontSize: 12.5, color: '#4A6B5C' }}>לא קיבלתם? הקוד תקף ל-10 דקות.</p>
        </>
      )}

      {phase === 'name' && (
        <>
          <p className="mt-3" style={{ fontSize: 14.5, lineHeight: 1.7, color: '#2A3D34' }}>
            ברוכים הבאים! איך קוראים לכם?
          </p>
          <div className="mt-8">
            <Label>שם מלא</Label>
            <input ref={nameRef} value={name} onChange={e => setName(e.target.value)}
              className="field-input mt-3" placeholder="שם פרטי ושם משפחה"
              onKeyDown={e => e.key === 'Enter' && name.trim() && submitName()} />
          </div>
          {error && <div className="mt-3 text-[13px]" style={{ color: '#C4634A' }}>{error}</div>}
          <div className="mt-6">
            <Button variant="primary" onClick={submitName} disabled={loading || !name.trim()}>
              {loading ? 'שומר…' : 'המשך'} <Icon.ArrowLeft />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Step: Schedule (calendar + time) ──────────────────────────────────────────
function StepSchedule({ data, update }: { data: BookingData; update: (k: keyof BookingData, v: BookingData[keyof BookingData]) => void  }) {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [takenSlots, setTakenSlots] = useState<Set<string>>(new Set())
  const hebMonths = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay.getDay(); i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  useEffect(() => {
    if (!data.date) return
    const d = data.date
    const pad = (n: number) => String(n).padStart(2, '0')
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    fetch(`/api/appointments/availability/${dateStr}`)
      .then(r => r.json())
      .then((times: string[]) => setTakenSlots(new Set(times)))
      .catch(() => setTakenSlots(new Set()))
  }, [data.date])

  const isDisabled = (d: number | null) => {
    if (!d) return true
    const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d)
    return date < today || date.getDay() === 6
  }
  const isSelected = (d: number | null) => {
    if (!d || !data.date) return false
    return data.date.getFullYear() === viewMonth.getFullYear() &&
           data.date.getMonth() === viewMonth.getMonth() &&
           data.date.getDate() === d
  }
  const slots: Record<string, string[]> = {
    בוקר: ['09:00', '09:45', '10:30', '11:15'],
    'אחה״צ': ['13:30', '14:15', '15:00', '15:45', '16:30'],
    ערב: ['17:15', '18:00'],
  }

  return (
    <div className="py-6">
      <h3 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 400 }}>בחירת מועד</h3>
      <p className="mt-3" style={{ fontSize: 14.5, lineHeight: 1.7, color: '#2A3D34' }}>הפגישה נמשכת 60 דקות. תישלח תזכורת ב-SMS יום לפני.</p>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} className="w-8 h-8 flex items-center justify-center hover:bg-[#EBE4D6]" style={{ borderRadius: 2 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6 L15 12 L9 18" /></svg>
            </button>
            <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18 }}>{hebMonths[viewMonth.getMonth()]} {viewMonth.getFullYear()}</div>
            <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} className="w-8 h-8 flex items-center justify-center hover:bg-[#EBE4D6]" style={{ borderRadius: 2 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6 L9 12 L15 18" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'].map((d, i) => (
              <div key={i} className="text-center" style={{ fontSize: 11, letterSpacing: '0.1em', color: '#4A6B5C', padding: '6px 0' }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) => {
              const disabled = isDisabled(d)
              const selected = isSelected(d)
              return (
                <button key={i} disabled={disabled}
                  onClick={() => d && update('date', new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d))}
                  className="aspect-square flex items-center justify-center transition-all"
                  style={{ background: selected ? '#1C2A24' : 'transparent', color: selected ? '#F5F1EA' : disabled ? 'rgba(28,42,36,0.25)' : '#1C2A24', cursor: disabled ? 'default' : 'pointer', borderRadius: 2, fontFamily: "'Frank Ruhl Libre', serif", fontSize: 15 }}>
                  {d || ''}
                </button>
              )
            })}
          </div>
        </div>

        {/* Time slots */}
        <div>
          {!data.date ? (
            <div className="flex items-center justify-center h-full" style={{ minHeight: 260, border: '1px dashed rgba(28,42,36,0.2)', borderRadius: 2 }}>
              <div className="text-center" style={{ color: '#4A6B5C', fontSize: 13.5 }}>בחרו תאריך<br />כדי לראות שעות פנויות</div>
            </div>
          ) : (
            <div>
              {Object.entries(slots).map(([period, times]) => (
                <div key={period} className="mt-5">
                  <div style={{ fontSize: 12.5, color: '#4A6B5C', marginBottom: 8 }}>{period}</div>
                  <div className="grid grid-cols-4 gap-2">
                    {times.map(t => {
                      const isTaken = takenSlots.has(t)
                      const selected = data.time === t
                      return (
                        <button key={t} disabled={isTaken} onClick={() => update('time', t)}
                          className="h-10 text-[13px] transition-all"
                          style={{
                            background: selected ? '#1C2A24' : isTaken ? 'transparent' : '#FFFFFF',
                            color: selected ? '#F5F1EA' : isTaken ? 'rgba(28,42,36,0.25)' : '#1C2A24',
                            border: `1px solid ${selected ? '#1C2A24' : 'rgba(28,42,36,0.15)'}`,
                            textDecoration: isTaken ? 'line-through' : 'none',
                            cursor: isTaken ? 'default' : 'pointer', borderRadius: 2, direction: 'ltr',
                          }}>
                          {t}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Step: Details ──────────────────────────────────────────────────────────────
function StepDetails({ data, update, client }: { data: BookingData; update: (k: keyof BookingData, v: BookingData[keyof BookingData]) => void; client: ClientProfile | null }) {
  return (
    <div className="py-6">
      <h3 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 400 }}>פרטי הביקור</h3>
      <p className="mt-3" style={{ fontSize: 14.5, lineHeight: 1.7, color: '#2A3D34' }}>שאלה קצרה מראש עוזרת להתכונן לפגישה.</p>
      <div className="mt-8 space-y-5">
        {!client?.name && (
          <FormField label="שם מלא" required>
            <input value={data.name} onChange={e => update('name', e.target.value)} className="field-input" placeholder="שם פרטי ושם משפחה" />
          </FormField>
        )}
        <div>
          <Label>מה הסיבה לביקור?</Label>
          <textarea value={data.concern} onChange={e => update('concern', e.target.value)}
            placeholder="תיאור קצר — למשל: מעקב, כאב גב, המשך טיפול…" rows={4} dir="rtl"
            className="field-input mt-3" style={{ resize: 'none' }} />
        </div>
        <FormField label="הערות נוספות">
          <textarea value={data.notes} onChange={e => update('notes', e.target.value)}
            rows={3} className="field-input" placeholder="אופציונלי — בקשות מיוחדות, שינויים מאז הפגישה האחרונה…" style={{ resize: 'none' }} />
        </FormField>
      </div>
    </div>
  )
}

// ── Step: Confirm (review) ─────────────────────────────────────────────────────
function StepConfirm({ data, client }: { data: BookingData; client: ClientProfile | null }) {
  const hebMonths = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']
  const hebDays = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']
  const dateStr = data.date ? `יום ${hebDays[data.date.getDay()]}, ${data.date.getDate()} ב${hebMonths[data.date.getMonth()]} ${data.date.getFullYear()}` : ''

  return (
    <div className="py-6">
      <h3 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 400 }}>אישור התור</h3>
      <p className="mt-3" style={{ fontSize: 14.5, color: '#2A3D34' }}>בדקו שהפרטים נכונים לפני האישור.</p>
      <div className="mt-8 p-6" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22 }}>{dateStr}</div>
            {data.time && <div className="mt-1 flex items-center gap-2" style={{ fontSize: 14, color: '#2A3D34' }}><Icon.Clock s={14} /> <span style={{ direction: 'ltr' }}>{data.time}</span> · 50 דקות</div>}
          </div>
          <Chop char="約" size={60} rotate={4} />
        </div>
        <div className="mt-5 pt-5 space-y-1" style={{ borderTop: '1px solid rgba(28,42,36,0.1)', fontSize: 13, color: '#4A6B5C' }}>
          <div className="flex items-center gap-2"><Icon.Users s={13} /> {client?.name || data.name}</div>
          <div className="flex items-center gap-2"><Icon.Phone s={13} /> <span style={{ direction: 'ltr' }}>{client?.phone}</span></div>
          <div className="flex items-center gap-2"><Icon.Pin s={13} /> מזכרת בתיה</div>
          {data.concern && <div className="mt-2" style={{ color: '#2A3D34' }}>״{data.concern}״</div>}
        </div>
      </div>
    </div>
  )
}

// ── Step: Done ─────────────────────────────────────────────────────────────────
function StepDone({ data, client, onPortal }: { data: BookingData; client: ClientProfile | null; onPortal?: () => void }) {
  const hebMonths = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']
  const hebDays = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']
  const dateStr = data.date ? `יום ${hebDays[data.date.getDay()]}, ${data.date.getDate()} ב${hebMonths[data.date.getMonth()]}` : ''

  return (
    <div className="py-10 text-center max-w-[500px] mx-auto">
      <div className="mx-auto flex items-center justify-center" style={{ width: 76, height: 76, borderRadius: '50%', background: '#E8EDDF', color: '#4A6B5C' }}>
        <Icon.Check s={32} />
      </div>
      <h3 className="mt-6" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 34, fontWeight: 400 }}>הבקשה התקבלה.</h3>
      <p className="mt-3" style={{ fontSize: 14.5, lineHeight: 1.7, color: '#2A3D34' }}>
        תקבלו הודעת SMS ל-<b style={{ direction: 'ltr', display: 'inline-block' }}>{client?.phone}</b> ברגע שהתור יאושר על ידי הקליניקה.
      </p>
      <div className="mt-8 p-5 text-right" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2 }}>
        <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22 }}>{dateStr}</div>
        {data.time && <div className="mt-1" style={{ direction: 'ltr', textAlign: 'right', fontSize: 14, color: '#4A6B5C' }}>{data.time} · 50 דקות</div>}
      </div>
      <p className="mt-5" style={{ fontSize: 13, color: '#4A6B5C' }}>
        לניהול התורים שלך:{' '}
        {onPortal
          ? <button onClick={onPortal} style={{ color: '#1C2A24', textDecoration: 'underline' }}>האזור האישי</button>
          : <a href="/?portal" style={{ color: '#1C2A24', textDecoration: 'underline' }}>האזור האישי</a>
        }
      </p>
    </div>
  )
}
