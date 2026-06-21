import { useState, useEffect } from 'react'
import { MS_PER_DAY, UI_ERRORS, parseAvailability } from '../constants'

// Fetch the live booking horizon (days ahead) from the DB-backed public endpoint; on
// failure, fail-closed (0) rather than baking in a number — the server is the single
// source of truth (it never returns out-of-horizon availability anyway).
async function fetchBookingHorizon(): Promise<number> {
  try {
    const res = await fetch('/api/clinic-settings/public')
    if (res.ok) {
      const body = await res.json()
      if (typeof body?.bookingAheadDays === 'number') return body.bookingAheadDays
    }
  } catch { /* fall through to fail-closed */ }
  return 0
}

// Compact in-card picker for choosing a new appointment slot. Shared by the client
// portal (client reschedules own appointment) and the admin dashboard (admin moves any
// appointment). Reuses the server-authoritative availability endpoint — the SAME one
// the booking calendar uses — so only genuinely free slots are offered, accounting for
// closed days, blocks, taken slots, extras, and the configurable booking horizon.
const HEB_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const pad = (n: number) => String(n).padStart(2, '0')
const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const shortDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00')
  return `${HEB_DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`
}

export default function ReschedulePicker({ onSubmit, onClose }: {
  onSubmit: (date: string, time: string) => Promise<{ ok: boolean; error?: string }>
  onClose: () => void
}) {
  const [availability, setAvailability] = useState<Record<string, string[]>>({})
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const horizon = await fetchBookingHorizon()
      const from = toDateStr(new Date())
      const to = toDateStr(new Date(Date.now() + horizon * MS_PER_DAY))
      try {
        const res = await fetch(`/api/appointments/availability?from=${from}&to=${to}`)
        const data = res.ok ? await res.json() : {}
        if (!cancelled) setAvailability(parseAvailability(data))
      } catch {
        if (!cancelled) setAvailability({})
      }
    })()
    return () => { cancelled = true }
  }, [])

  const days = Object.keys(availability).sort()
  const times = date ? (availability[date] ?? []) : []

  const submit = async () => {
    if (!date || !time) return
    setSubmitting(true); setError('')
    const r = await onSubmit(date, time)
    setSubmitting(false)
    if (r.ok) {
      onClose()
    } else {
      setError(r.error || UI_ERRORS.GENERIC)
    }
  }

  return (
    <div className="p-4" style={{ background: '#FBF8F1', border: '1px solid rgba(28,42,36,0.12)', borderRadius: 2 }}>
      <div style={{ fontSize: 13, color: '#2A3D34', marginBottom: 10 }}>בחרו מועד חדש</div>
      {days.length === 0 ? (
        <div style={{ fontSize: 13, color: '#4A6B5C' }}>אין מועדים פנויים כרגע.</div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map(d => (
              <button key={d} onClick={() => { setDate(d); setTime('') }}
                className="shrink-0 px-3 h-9 text-[12.5px]"
                style={{ background: date === d ? '#1C2A24' : '#FFFFFF', color: date === d ? '#F5F1EA' : '#1C2A24', border: `1px solid ${date === d ? '#1C2A24' : 'rgba(28,42,36,0.15)'}`, borderRadius: 2, whiteSpace: 'nowrap' }}>
                {shortDate(d)}
              </button>
            ))}
          </div>
          {date && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {times.map(t => (
                <button key={t} onClick={() => setTime(t)} className="h-9 text-[12.5px]"
                  style={{ background: time === t ? '#1C2A24' : '#FFFFFF', color: time === t ? '#F5F1EA' : '#1C2A24', border: `1px solid ${time === t ? '#1C2A24' : 'rgba(28,42,36,0.15)'}`, borderRadius: 2, direction: 'ltr' }}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {error && <div className="mt-3 text-[12.5px]" style={{ color: '#C4634A' }}>{error}</div>}
      <div className="flex items-center gap-3 mt-4">
        <button disabled={!date || !time || submitting} onClick={submit}
          className="text-[13px] h-8" style={{ background: '#1C2A24', color: '#F5F1EA', borderRadius: 999, padding: '0 16px', opacity: (!date || !time || submitting) ? 0.5 : 1 }}>
          {submitting ? 'מעדכן…' : 'אישור מועד חדש'}
        </button>
        <button onClick={onClose} className="text-[13px] hover:underline" style={{ color: '#4A6B5C' }}>ביטול</button>
      </div>
    </div>
  )
}
