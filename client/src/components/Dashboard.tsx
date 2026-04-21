import { useState, useEffect } from 'react'
import { Enso, Icon, Button, Avatar } from './shared'
import { clearAdminToken } from '../auth'

// ---------- Types ----------
interface Lead {
  _id: string
  name: string
  phone: string
  concern: string
  treatment: string
  status: 'new' | 'contacted' | 'booked' | 'closed'
  source: string
  createdAt: string
  email?: string
  notes?: string
}

interface Appointment {
  _id: string
  name: string
  phone: string
  treatment: string
  date: string
  time: string
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'noshow'
  concern?: string
  notes?: string
}

// ---------- Hooks ----------
function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const refresh = () => {
    setLoading(true)
    fetch('/api/leads')
      .then(r => r.json())
      .then(setLeads)
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(refresh, [])
  return { leads, loading, refresh }
}

function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const refresh = () => {
    setLoading(true)
    fetch('/api/appointments')
      .then(r => r.json())
      .then(setAppointments)
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(refresh, [])
  return { appointments, loading, refresh }
}

// ---------- Helpers ----------
function localDateStr(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function todayStr() {
  return localDateStr(new Date())
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function formatDate(d: Date): string {
  return localDateStr(d)
}

const HEB_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
const HEB_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

function hebDateLabel(d: Date): string {
  return `${HEB_DAYS[d.getDay()]} ${d.getDate()}`
}

function hebFullDate(d: Date): string {
  return `${d.getDate()} ב${HEB_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

const APPOINTMENT_COLOR = '#4A6B5C'

function timeToDecimal(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

const DURATION_HOURS = 50 / 60

// ---------- Badge ----------
function Badge({ children, tone }: { children: React.ReactNode; tone: string }) {
  const tones: Record<string, { bg: string; fg: string }> = {
    new:        { bg: '#E8F0EB', fg: '#2A5C3F' },
    contacted:  { bg: '#EBE4D6', fg: '#5C4A1E' },
    booked:     { bg: '#E8EDDF', fg: '#3A5C2A' },
    closed:     { bg: '#F0EAEA', fg: '#5C2A2A' },
    urgent:     { bg: '#FAE8E4', fg: '#8B2A15' },
    pending:    { bg: '#FFF8E6', fg: '#7A5C00' },
    scheduled:  { bg: '#E8F0EB', fg: '#2A5C3F' },
    completed:  { bg: '#EBE4D6', fg: '#5C4A1E' },
    cancelled:  { bg: '#F0EAEA', fg: '#5C2A2A' },
    noshow:     { bg: '#FAE8E4', fg: '#8B2A15' },
  }
  const t = tones[tone] || { bg: '#EBE4D6', fg: '#4A3A1E' }
  return (
    <span style={{ background: t.bg, color: t.fg, fontSize: 11.5, padding: '3px 9px', borderRadius: 12, fontWeight: 500, whiteSpace: 'nowrap' as const }}>
      {children}
    </span>
  )
}

// ---------- Panel ----------
function Panel({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2 }}>
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(28,42,36,0.08)' }}>
        <h3 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18, fontWeight: 400 }}>{title}</h3>
        {right}
      </div>
      <div className="px-5 py-2">{children}</div>
    </section>
  )
}

// ---------- Kpi ----------
function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: string }) {
  const tones: Record<string, { bg: string; fg: string; subFg: string }> = {
    moss:    { bg: '#4A6B5C', fg: '#F5F1EA', subFg: '#B8C5B8' },
    seal:    { bg: '#C4634A', fg: '#F5F1EA', subFg: '#F4DDD5' },
    default: { bg: '#FFFFFF', fg: '#1C2A24', subFg: '#4A6B5C' },
  }
  const t = tones[tone || 'default']
  return (
    <div className="p-5" style={{ background: t.bg, borderRadius: 2, border: tone ? 'none' : '1px solid rgba(28,42,36,0.1)' }}>
      <div style={{ fontSize: 11.5, letterSpacing: '0.12em', color: t.subFg }}>{label}</div>
      <div className="mt-3" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 36, fontWeight: 400, color: t.fg, lineHeight: 1 }}>{value}</div>
      <div className="mt-2" style={{ fontSize: 12.5, color: t.subFg }}>{sub}</div>
    </div>
  )
}

// ---------- Drawer ----------
function Drawer({ children, onClose, title, wide }: { children: React.ReactNode; onClose: () => void; title: string; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-start" style={{ background: 'rgba(28,42,36,0.45)', backdropFilter: 'blur(3px)' }} onClick={onClose}>
      <div className="h-full overflow-y-auto" style={{ width: wide ? 'min(640px, 100%)' : 'min(460px, 100%)', background: '#F5F1EA' }} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4" style={{ background: '#F5F1EA', borderBottom: '1px solid rgba(28,42,36,0.1)' }}>
          <div style={{ fontSize: 11.5, letterSpacing: '0.18em', color: '#4A6B5C' }}>{title}</div>
          <button onClick={onClose} className="p-1"><Icon.Close /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ---------- KV ----------
function KV({ k, v, icon, multi }: { k: string; v: React.ReactNode; icon?: string; multi?: boolean }) {
  const Ico = icon ? (Icon as Record<string, React.ComponentType<{ s?: number }>>)[icon] : null
  return (
    <div className="py-3" style={{ borderBottom: '1px solid rgba(28,42,36,0.08)' }}>
      <div style={{ fontSize: 11.5, letterSpacing: '0.12em', color: '#4A6B5C' }}>{k}</div>
      <div className="mt-1 flex items-start gap-2" style={{ fontSize: multi ? 14 : 15, lineHeight: 1.6 }}>
        {Ico && <span style={{ color: '#4A6B5C', marginTop: 3 }}><Ico /></span>}
        {v}
      </div>
    </div>
  )
}

// ---------- TopBar ----------
function TopBar({ view, onOpenNav }: { view: string; onOpenNav: () => void }) {
  const now = new Date()
  const titles: Record<string, string> = {
    today:        `היום — ${hebDateLabel(now)}, ${hebFullDate(now)}`,
    leads:        'פניות חדשות',
    calendar:     'יומן טיפולים',
    appointments: 'ניהול תורים',
    patients:     'מטופלים',
    settings:     'הגדרות',
  }
  return (
    <div className="px-6 md:px-10 py-5 flex items-center justify-between gap-6" style={{ borderBottom: '1px solid rgba(28,42,36,0.1)', background: '#F5F1EA' }}>
      <div className="flex items-center gap-4 min-w-0">
        <button className="md:hidden" onClick={onOpenNav}><Icon.Menu /></button>
        <h1 className="truncate" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26, fontWeight: 400, letterSpacing: '-0.01em' }}>
          {titles[view] || view}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 h-10" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.15)', borderRadius: 2, width: 280 }}>
          <Icon.Search s={16} />
          <input placeholder="חיפוש מטופלים, פניות…" className="flex-1 bg-transparent outline-none text-[13px]" />
        </div>
      </div>
    </div>
  )
}

// ---------- Sidebar ----------
function Sidebar({ view, setView, onExit, open, onClose }: { view: string; setView: (v: string) => void; onExit: () => void; open: boolean; onClose: () => void }) {
  const items = [
    { id: 'today',        label: 'היום',     icon: 'Dot' },
    { id: 'leads',        label: 'פניות',    icon: 'Inbox' },
    { id: 'calendar',     label: 'יומן',     icon: 'Calendar' },
    { id: 'appointments', label: 'תורים',    icon: 'Clock' },
    { id: 'patients',     label: 'מטופלים',  icon: 'Users' },
    { id: 'settings',     label: 'הגדרות',   icon: 'Settings' },
  ]
  return (
    <>
      {open && <div className="fixed inset-0 z-30 md:hidden" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />}
      <aside className={`fixed md:static z-40 md:z-auto top-0 bottom-0 right-0 flex flex-col transition-transform ${open ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
        style={{ width: 248, background: '#1C2A24', color: '#F5F1EA', flexShrink: 0 }}>
        <div className="px-6 pt-7 pb-8">
          <div className="flex items-center gap-3">
            <Enso size={30} color="#F5F1EA" />
            <div className="leading-none">
              <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18 }}>קרן שריג</div>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', color: '#B8C5B8', marginTop: 4 }}>ממשק ניהול</div>
            </div>
          </div>
        </div>
        <nav className="px-3 flex-1">
          {items.map(it => {
            const active = view === it.id
            const Ico = (Icon as Record<string, React.ComponentType<{ s?: number }>>)[it.icon]
            return (
              <button key={it.id} onClick={() => setView(it.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] transition-all mb-0.5"
                style={{
                  background: active ? 'rgba(245,241,234,0.08)' : 'transparent',
                  color: active ? '#F5F1EA' : '#B8C5B8',
                  borderRight: active ? '2px solid #C4634A' : '2px solid transparent',
                  paddingRight: active ? 10 : 12,
                  borderRadius: 2, textAlign: 'right',
                }}>
                {Ico && <Ico s={17} />}
                <span className="flex-1">{it.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="p-5 mt-auto" style={{ borderTop: '1px solid rgba(245,241,234,0.1)' }}>
          <div className="flex items-center gap-3">
            <Avatar name="קרן שריג" size={36} tone="#4A6B5C" />
            <div className="flex-1 leading-tight min-w-0">
              <div style={{ fontSize: 13, color: '#F5F1EA', fontWeight: 500 }}>קרן שריג</div>
              <div style={{ fontSize: 11, color: '#B8C5B8' }}>ממשק ניהול</div>
            </div>
          </div>
          <button onClick={onExit} className="w-full mt-4 text-right text-[12px] hover:text-[#F5F1EA]" style={{ color: '#B8C5B8' }}>
            → חזרה לאתר הציבורי
          </button>
          <button onClick={() => { clearAdminToken(); onExit() }} className="w-full mt-2 text-right text-[12px] hover:text-[#F5F1EA]" style={{ color: '#B8C5B8' }}>
            → יציאה מהמערכת
          </button>
        </div>
      </aside>
    </>
  )
}

// ---------- TodayView ----------
function TodayView({ appointments, leads }: { appointments: Appointment[]; leads: Lead[] }) {
  const today = todayStr()
  const todayAppts = appointments.filter(a => a.date === today && a.status !== 'cancelled').sort((a, b) => a.time.localeCompare(b.time))
  const newLeads = leads.filter(l => l.status === 'new')

  return (
    <div className="p-6 md:p-10">
      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Kpi label="טיפולים היום" value={String(todayAppts.length)} sub="מתוזמנים" tone="moss" />
          <Kpi label="ממתינים לאישור" value={String(appointments.filter(a => a.status === 'pending').length)} sub="דורשים אישור" tone="seal" />
          <Kpi label="פניות חדשות" value={String(newLeads.length)} sub="ממתינות לטיפול" />
          <Kpi label="סה״כ תורים" value={String(appointments.filter(a => a.status === 'scheduled').length)} sub="מאושרים" />
        </div>

        <div className="md:col-span-7">
          <Panel title="לוח הטיפולים היום">
            {todayAppts.length === 0 ? (
              <div className="py-8 text-center" style={{ color: '#4A6B5C', fontSize: 13.5 }}>אין תורים מתוזמנים להיום</div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(28,42,36,0.08)' }}>
                {todayAppts.map(a => (
                  <div key={a._id} className="py-3.5 flex items-center gap-4" style={{ borderBottom: '1px solid rgba(28,42,36,0.08)' }}>
                    <div className="w-[72px] shrink-0" style={{ direction: 'ltr', textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 19 }}>{a.time}</div>
                      <div style={{ fontSize: 10.5, color: '#4A6B5C', letterSpacing: '0.05em' }}>50 דקות</div>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <Avatar name={a.name} size={34} />
                      <div className="min-w-0">
                        <div className="truncate" style={{ fontSize: 14, fontWeight: 500 }}>{a.name}</div>
                        <div className="truncate" style={{ fontSize: 12.5, color: '#4A6B5C' }}>{a.concern}</div>
                      </div>
                    </div>
                    <Badge tone={a.status}>{({ pending: 'ממתין לאישור', scheduled: 'מאושר', completed: 'הושלם', cancelled: 'בוטל', noshow: 'לא הגיע' } as Record<string,string>)[a.status]}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="md:col-span-5">
          <Panel title="פניות חדשות" right={newLeads.length > 0 ? <Badge tone="urgent">{newLeads.length} לא נקראו</Badge> : undefined}>
            {newLeads.slice(0, 3).map(l => (
              <div key={l._id} className="py-3.5" style={{ borderBottom: '1px solid rgba(28,42,36,0.08)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{l.name}</div>
                  <span style={{ fontSize: 11.5, color: '#4A6B5C' }}>{new Date(l.createdAt).toLocaleDateString('he-IL')}</span>
                </div>
                <div className="mt-1 flex items-center gap-2" style={{ fontSize: 12, color: '#4A6B5C', direction: 'ltr', justifyContent: 'flex-end' }}>
                  <Icon.Phone s={11} /> {l.phone}
                </div>
                <p className="mt-2" style={{ fontSize: 13, lineHeight: 1.6, color: '#2A3D34' }}>״{l.concern}״</p>
              </div>
            ))}
            {newLeads.length === 0 && <div className="py-6 text-center" style={{ color: '#4A6B5C', fontSize: 13.5 }}>אין פניות חדשות</div>}
          </Panel>
        </div>
      </div>
    </div>
  )
}

// ---------- LeadsView ----------
function LeadsView({ leads, onSelect }: { leads: Lead[]; onSelect: (l: Lead) => void }) {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter)
  const counts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    booked: leads.filter(l => l.status === 'booked').length,
    closed: leads.filter(l => l.status === 'closed').length,
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {([['all','הכל'],['new','חדש'],['contacted','יצרתי קשר'],['booked','נקבע תור'],['closed','סגור']] as [string,string][]).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className="text-[13px] px-4 h-9 flex items-center gap-2"
            style={{ background: filter === k ? '#1C2A24' : 'transparent', color: filter === k ? '#F5F1EA' : '#1C2A24', border: `1px solid ${filter === k ? '#1C2A24' : 'rgba(28,42,36,0.15)'}`, borderRadius: 2 }}>
            {l} <span style={{ fontSize: 11, opacity: 0.7 }}>{counts[k as keyof typeof counts]}</span>
          </button>
        ))}
      </div>
      <div style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#EBE4D6' }}>
                {['שם', 'טלפון', 'תלונה', 'מקור', 'התקבל', 'סטטוס', ''].map(h => (
                  <th key={h} className="text-right px-5 py-3" style={{ fontSize: 11.5, letterSpacing: '0.1em', color: '#4A6B5C', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <tr key={l._id} onClick={() => onSelect(l)} className="cursor-pointer hover:bg-[#F5F1EA] transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(28,42,36,0.06)' : 'none' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={l.name} size={30} />
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{l.name}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4" style={{ fontSize: 13, color: '#2A3D34', direction: 'ltr', textAlign: 'right' }}>{l.phone}</td>
                  <td className="px-5 py-4 max-w-[280px]" style={{ fontSize: 13, color: '#2A3D34' }}><div className="truncate">{l.concern}</div></td>
                  <td className="px-5 py-4" style={{ fontSize: 12.5, color: '#4A6B5C' }}>{l.source}</td>
                  <td className="px-5 py-4" style={{ fontSize: 12.5, color: '#4A6B5C' }}>{new Date(l.createdAt).toLocaleDateString('he-IL')}</td>
                  <td className="px-5 py-4"><Badge tone={l.status}>{({ new: 'חדש', contacted: 'בקשר', booked: 'נקבע', closed: 'סגור' })[l.status]}</Badge></td>
                  <td className="px-5 py-4" style={{ color: '#4A6B5C' }}><Icon.ArrowLeft s={14} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center" style={{ color: '#4A6B5C', fontSize: 13.5 }}>אין פניות</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---------- LeadDrawer ----------
function LeadDrawer({ lead, onClose, onStatusChange }: { lead: Lead; onClose: () => void; onStatusChange: () => void }) {
  const [saving, setSaving] = useState(false)

  const updateStatus = async (status: string) => {
    setSaving(true)
    try {
      await fetch(`/api/leads/${lead._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      onStatusChange()
      onClose()
    } catch { } finally { setSaving(false) }
  }

  return (
    <Drawer onClose={onClose} title="פרטי פנייה">
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={lead.name} size={54} />
        <div>
          <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26 }}>{lead.name}</div>
          <div style={{ fontSize: 12.5, color: '#4A6B5C', marginTop: 2 }}>
            התקבל {new Date(lead.createdAt).toLocaleDateString('he-IL')} · {lead.source}
          </div>
        </div>
      </div>
      <div className="mb-6"><Badge tone={lead.status}>{({ new: 'חדש', contacted: 'בקשר', booked: 'נקבע', closed: 'סגור' })[lead.status]}</Badge></div>
      <KV k="טלפון" v={<span style={{ direction: 'ltr', display: 'inline-block' }}>{lead.phone}</span>} icon="Phone" />
      {lead.email && <KV k="אימייל" v={lead.email} />}
      <KV k="תלונה עיקרית" v={lead.concern} multi />
      {lead.notes && <KV k="הערות" v={lead.notes} multi />}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <Button variant="primary" onClick={() => updateStatus('contacted')} disabled={saving}>סימון ״בקשר״</Button>
        <Button variant="ghost" onClick={() => updateStatus('booked')} disabled={saving}>קביעת תור</Button>
      </div>
      <div className="mt-4">
        <Button variant="quiet" onClick={() => updateStatus('closed')} disabled={saving} className="w-full">סגירת פנייה</Button>
      </div>
    </Drawer>
  )
}

// ---------- CalendarView ----------
function CalendarView({ appointments }: { appointments: Appointment[] }) {
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(new Date()))
  const [now, setNow] = useState(new Date())
  const WORK_DAYS = 5
  const HOUR_H = 60
  const START_HOUR = 8
  const END_HOUR = 20
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
  const weekDays = Array.from({ length: WORK_DAYS }, (_, i) => addDays(weekStart, i))
  const weekEnd = addDays(weekStart, WORK_DAYS)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const weekAppts = appointments.filter(a => {
    const d = new Date(a.date + 'T00:00:00')
    return d >= weekStart && d < weekEnd && a.status !== 'cancelled'
  })

  const prevWeek = () => setWeekStart(d => addDays(d, -7))
  const nextWeek = () => setWeekStart(d => addDays(d, 7))
  const goToday = () => setWeekStart(getMondayOfWeek(new Date()))

  const weekLabel = `${hebFullDate(weekStart)} – ${hebFullDate(addDays(weekStart, WORK_DAYS - 1))}`
  const todayDateStr = todayStr()
  const nowDecimal = now.getHours() + now.getMinutes() / 60
  const showNowLine = nowDecimal >= START_HOUR && nowDecimal < END_HOUR

  const apptColor = (status: string) =>
    status === 'pending' ? { bg: '#B8893B', border: 'rgba(184,137,59,0.6)' } : { bg: '#4A6B5C', border: 'rgba(74,107,92,0.6)' }

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button onClick={prevWeek} className="w-9 h-9 flex items-center justify-center hover:bg-[#EBE4D6]" style={{ border: '1px solid rgba(28,42,36,0.15)', borderRadius: 2 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6 L15 12 L9 18" /></svg>
          </button>
          <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 21 }}>{weekLabel}</div>
          <button onClick={nextWeek} className="w-9 h-9 flex items-center justify-center hover:bg-[#EBE4D6]" style={{ border: '1px solid rgba(28,42,36,0.15)', borderRadius: 2 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6 L9 12 L15 18" /></svg>
          </button>
          <button onClick={goToday} className="h-9 px-3 text-[12px]" style={{ border: '1px solid rgba(28,42,36,0.15)', borderRadius: 2 }}>היום</button>
        </div>
        <div className="flex items-center gap-4 text-[11.5px]" style={{ color: '#4A6B5C' }}>
          <span className="flex items-center gap-1.5"><span style={{ width: 10, height: 10, background: '#4A6B5C', borderRadius: 2, display: 'inline-block' }} />מאושר</span>
          <span className="flex items-center gap-1.5"><span style={{ width: 10, height: 10, background: '#B8893B', borderRadius: 2, display: 'inline-block' }} />ממתין לאישור</span>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <div style={{ minWidth: 700 }}>
            {/* Day headers */}
            <div className="grid" style={{ gridTemplateColumns: `64px repeat(${WORK_DAYS}, 1fr)`, background: '#F5F1EA', borderBottom: '2px solid rgba(28,42,36,0.1)' }}>
              <div />
              {weekDays.map(d => {
                const ds = formatDate(d)
                const isToday = ds === todayDateStr
                const dayApptCount = weekAppts.filter(a => a.date === ds).length
                return (
                  <div key={ds} className="py-3 text-center" style={{ borderRight: '1px solid rgba(28,42,36,0.08)', background: isToday ? 'rgba(196,99,74,0.06)' : 'transparent' }}>
                    <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 17, color: isToday ? '#C4634A' : '#1C2A24', fontWeight: isToday ? 600 : 400 }}>
                      {hebDateLabel(d)}
                    </div>
                    <div style={{ fontSize: 10.5, color: isToday ? '#C4634A' : '#4A6B5C', marginTop: 2, opacity: dayApptCount > 0 ? 1 : 0 }}>
                      {dayApptCount} טיפולים
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Grid body */}
            <div className="relative grid" style={{ gridTemplateColumns: `64px repeat(${WORK_DAYS}, 1fr)` }}>
              {/* Hour labels */}
              <div>
                {hours.map(h => (
                  <div key={h} style={{ height: HOUR_H, borderBottom: '1px solid rgba(28,42,36,0.05)', fontSize: 11, color: '#4A6B5C', padding: '4px 8px', direction: 'ltr', textAlign: 'left' }}>
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
              {/* Day columns */}
              {weekDays.map((d, dIdx) => {
                const dateStr = formatDate(d)
                const isToday = dateStr === todayDateStr
                const dayAppts = weekAppts.filter(a => a.date === dateStr)
                return (
                  <div key={dIdx} className="relative" style={{ borderRight: '1px solid rgba(28,42,36,0.06)', background: isToday ? 'rgba(196,99,74,0.025)' : 'transparent' }}>
                    {hours.map(h => (
                      <div key={h} style={{ height: HOUR_H, borderBottom: '1px solid rgba(28,42,36,0.05)' }} />
                    ))}
                    {/* Current time indicator */}
                    {isToday && showNowLine && (
                      <div className="absolute left-0 right-0 z-10 flex items-center" style={{ top: (nowDecimal - START_HOUR) * HOUR_H, pointerEvents: 'none' }}>
                        <div style={{ width: 8, height: 8, background: '#C4634A', borderRadius: '50%', marginRight: -4, flexShrink: 0 }} />
                        <div style={{ flex: 1, height: 1.5, background: '#C4634A', opacity: 0.7 }} />
                      </div>
                    )}
                    {dayAppts.map(a => {
                      const hour = timeToDecimal(a.time)
                      const { bg, border } = apptColor(a.status)
                      return (
                        <div key={a._id} className="absolute left-1.5 right-1.5 px-2 py-1.5 text-[11px] cursor-pointer hover:opacity-90 transition-opacity"
                          style={{
                            top: (hour - START_HOUR) * HOUR_H + 2,
                            height: DURATION_HOURS * HOUR_H - 4,
                            background: bg,
                            color: '#F5F1EA', borderRadius: 3, overflow: 'hidden',
                            borderRight: `3px solid ${border}`,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                          }}>
                          <div style={{ fontWeight: 600, fontSize: 11.5, lineHeight: 1.2 }}>{a.name.split(' ')[0]}</div>
                          <div style={{ opacity: 0.85, fontSize: 10.5, marginTop: 2 }}>{a.time}</div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- AppointmentsView ----------
function AppointmentsView({ appointments, onStatusChange }: { appointments: Appointment[]; onStatusChange: () => void }) {
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    onStatusChange()
    setSelected(null)
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {([['all','הכל'],['pending','ממתין'],['scheduled','מאושר'],['completed','הושלם'],['cancelled','בוטל'],['noshow','לא הגיע']] as [string,string][]).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className="text-[13px] px-4 h-9"
            style={{ background: filter === k ? '#1C2A24' : 'transparent', color: filter === k ? '#F5F1EA' : '#1C2A24', border: `1px solid ${filter === k ? '#1C2A24' : 'rgba(28,42,36,0.15)'}`, borderRadius: 2 }}>
            {l}
          </button>
        ))}
      </div>
      <div style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#EBE4D6' }}>
              {['שם', 'טלפון', 'תאריך', 'שעה', 'סטטוס', ''].map(h => (
                <th key={h} className="text-right px-5 py-3" style={{ fontSize: 11.5, letterSpacing: '0.1em', color: '#4A6B5C', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={a._id} onClick={() => setSelected(a)} className="cursor-pointer hover:bg-[#F5F1EA] transition-colors"
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(28,42,36,0.06)' : 'none' }}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={a.name} size={30} />
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{a.name}</div>
                  </div>
                </td>
                <td className="px-5 py-4" style={{ fontSize: 13, direction: 'ltr', textAlign: 'right' }}>{a.phone}</td>
                <td className="px-5 py-4" style={{ fontSize: 13, color: '#2A3D34' }}>{new Date(a.date + 'T00:00:00').toLocaleDateString('he-IL')}</td>
                <td className="px-5 py-4" style={{ fontSize: 13, direction: 'ltr', textAlign: 'right' }}>{a.time}</td>
                <td className="px-5 py-4"><Badge tone={a.status}>{({ scheduled: 'מתוזמן', completed: 'הושלם', cancelled: 'בוטל', noshow: 'לא הגיע', pending: 'ממתין' } as Record<string,string>)[a.status]}</Badge></td>
                <td className="px-5 py-4" style={{ color: '#4A6B5C' }}><Icon.ArrowLeft s={14} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center" style={{ color: '#4A6B5C', fontSize: 13.5 }}>אין תורים</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <Drawer onClose={() => setSelected(null)} title="פרטי תור">
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={selected.name} size={54} />
            <div>
              <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26 }}>{selected.name}</div>
              <div style={{ fontSize: 12.5, color: '#4A6B5C', marginTop: 2 }}>{selected.concern || ''}</div>
            </div>
          </div>
          <Badge tone={selected.status}>{({ pending: 'ממתין לאישור', scheduled: 'מאושר', completed: 'הושלם', cancelled: 'בוטל', noshow: 'לא הגיע' } as Record<string,string>)[selected.status]}</Badge>
          <div className="mt-4">
            <KV k="טלפון" v={<span style={{ direction: 'ltr', display: 'inline-block' }}>{selected.phone}</span>} icon="Phone" />
            <KV k="תאריך" v={new Date(selected.date + 'T00:00:00').toLocaleDateString('he-IL')} />
            <KV k="שעה" v={<span style={{ direction: 'ltr', display: 'inline-block' }}>{selected.time}</span>} />
            {selected.concern && <KV k="סיבת הפנייה" v={selected.concern} multi />}
            {selected.notes && <KV k="הערות" v={selected.notes} multi />}
          </div>
          <div className="mt-8 space-y-3">
            {selected.status === 'pending' && (
              <Button variant="primary" onClick={() => updateStatus(selected._id, 'scheduled')} className="w-full">אישור התור</Button>
            )}
            {selected.status === 'scheduled' && (
              <Button variant="primary" onClick={() => updateStatus(selected._id, 'completed')} className="w-full">סימון כהושלם</Button>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="ghost" onClick={() => updateStatus(selected._id, 'cancelled')}>ביטול תור</Button>
              <Button variant="quiet" onClick={() => updateStatus(selected._id, 'noshow')}>לא הגיע/ה</Button>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  )
}

// ---------- PatientsView ----------
interface Patient {
  phone: string
  name: string
  visitCount: number
  lastVisit: string | null
  nextVisit: string | null
  appointments: Appointment[]
}

function buildPatients(appointments: Appointment[]): Patient[] {
  const map = new Map<string, Patient>()
  for (const a of appointments) {
    if (!map.has(a.phone)) {
      map.set(a.phone, { phone: a.phone, name: a.name, visitCount: 0, lastVisit: null, nextVisit: null, appointments: [] })
    }
    const p = map.get(a.phone)!
    p.appointments.push(a)
    if (a.name && a.name.length > p.name.length) p.name = a.name
  }
  const today = todayStr()
  for (const p of map.values()) {
    const sorted = [...p.appointments].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    const past = sorted.filter(a => a.date < today || (a.date === today) && ['completed', 'cancelled', 'noshow'].includes(a.status))
    const future = sorted.filter(a => a.date > today || (a.date >= today && ['pending', 'scheduled'].includes(a.status)))
    p.visitCount = past.length
    p.lastVisit = past.length > 0 ? past[past.length - 1].date : null
    p.nextVisit = future.length > 0 ? future[0].date : null
  }
  return Array.from(map.values()).sort((a, b) => (b.lastVisit ?? '').localeCompare(a.lastVisit ?? ''))
}

function PatientDrawer({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const sorted = [...patient.appointments].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
  const STATUS_LABELS: Record<string, string> = { pending: 'ממתין לאישור', scheduled: 'מאושר', completed: 'הושלם', cancelled: 'בוטל', noshow: 'לא הגיע' }
  return (
    <Drawer onClose={onClose} title="פרטי מטופל" wide>
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={patient.name} size={54} />
        <div>
          <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26 }}>{patient.name}</div>
          <div style={{ fontSize: 12.5, color: '#4A6B5C', marginTop: 2, direction: 'ltr', display: 'inline-block' }}>{patient.phone}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 text-center" style={{ background: '#F5F1EA', borderRadius: 2 }}>
          <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26 }}>{patient.visitCount}</div>
          <div style={{ fontSize: 11, color: '#4A6B5C', marginTop: 2 }}>ביקורים</div>
        </div>
        <div className="p-3 text-center" style={{ background: '#F5F1EA', borderRadius: 2 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{patient.lastVisit ? new Date(patient.lastVisit + 'T00:00:00').toLocaleDateString('he-IL') : '—'}</div>
          <div style={{ fontSize: 11, color: '#4A6B5C', marginTop: 2 }}>ביקור אחרון</div>
        </div>
        <div className="p-3 text-center" style={{ background: '#F5F1EA', borderRadius: 2 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{patient.nextVisit ? new Date(patient.nextVisit + 'T00:00:00').toLocaleDateString('he-IL') : '—'}</div>
          <div style={{ fontSize: 11, color: '#4A6B5C', marginTop: 2 }}>תור הבא</div>
        </div>
      </div>
      <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 17, marginBottom: 12 }}>היסטוריית טיפולים</div>
      <div className="space-y-2">
        {sorted.map(a => (
          <div key={a._id} className="flex items-center justify-between gap-3 px-4 py-3" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.08)', borderRadius: 2 }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{new Date(a.date + 'T00:00:00').toLocaleDateString('he-IL')}</div>
              <div style={{ fontSize: 11.5, color: '#4A6B5C', direction: 'ltr', display: 'inline-block' }}>{a.time}</div>
            </div>
            {a.concern && <div className="flex-1 mx-4 truncate" style={{ fontSize: 12.5, color: '#2A3D34' }}>{a.concern}</div>}
            <Badge tone={a.status}>{STATUS_LABELS[a.status] ?? a.status}</Badge>
          </div>
        ))}
        {sorted.length === 0 && <div style={{ fontSize: 13.5, color: '#4A6B5C' }}>אין תורים</div>}
      </div>
    </Drawer>
  )
}

function PatientsView({ appointments }: { appointments: Appointment[] }) {
  const [selected, setSelected] = useState<Patient | null>(null)
  const [search, setSearch] = useState('')
  const patients = buildPatients(appointments)
  const filtered = search
    ? patients.filter(p => p.name.includes(search) || p.phone.includes(search))
    : patients

  return (
    <div className="p-6 md:p-10">
      <div className="mb-5">
        <div className="flex items-center gap-2 px-3 h-10 max-w-[320px]" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.15)', borderRadius: 2 }}>
          <Icon.Search s={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי שם או טלפון…" className="flex-1 bg-transparent outline-none text-[13px]" />
        </div>
      </div>
      <div style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#EBE4D6' }}>
              {['שם', 'טלפון', 'ביקורים', 'ביקור אחרון', 'תור הבא', ''].map(h => (
                <th key={h} className="text-right px-5 py-3" style={{ fontSize: 11.5, letterSpacing: '0.1em', color: '#4A6B5C', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.phone} onClick={() => setSelected(p)} className="cursor-pointer hover:bg-[#F5F1EA] transition-colors"
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(28,42,36,0.06)' : 'none' }}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} size={30} />
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                  </div>
                </td>
                <td className="px-5 py-4" style={{ fontSize: 13, direction: 'ltr', textAlign: 'right' }}>{p.phone}</td>
                <td className="px-5 py-4" style={{ fontSize: 14, fontFamily: "'Frank Ruhl Libre', serif" }}>{p.visitCount}</td>
                <td className="px-5 py-4" style={{ fontSize: 13, color: '#2A3D34' }}>{p.lastVisit ? new Date(p.lastVisit + 'T00:00:00').toLocaleDateString('he-IL') : '—'}</td>
                <td className="px-5 py-4" style={{ fontSize: 13, color: p.nextVisit ? '#2A5C3F' : '#4A6B5C' }}>{p.nextVisit ? new Date(p.nextVisit + 'T00:00:00').toLocaleDateString('he-IL') : '—'}</td>
                <td className="px-5 py-4" style={{ color: '#4A6B5C' }}><Icon.ArrowLeft s={14} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center" style={{ color: '#4A6B5C', fontSize: 13.5 }}>אין מטופלים</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {selected && <PatientDrawer patient={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

// ---------- SettingsView ----------
function SettingsView() {
  const toggles = [
    { l: 'פנייה חדשה באתר', on: true },
    { l: 'ביטול תור', on: true },
    { l: 'תזכורת להכנת נוסחה', on: true },
    { l: 'הודעה ממטופל', on: false },
  ]
  return (
    <div className="p-6 md:p-10 max-w-[760px]">
      <Panel title="פרטי הקליניקה">
        <div className="py-4 space-y-4">
          <KV k="שם הקליניקה" v="קרן שריג — רפואה סינית" />
          <KV k="כתובת" v="סוקולוב 40, רמת השרון, קומה 3" />
          <KV k="טלפון" v={<span style={{ direction: 'ltr' }}>050-9031503</span>} />
        </div>
      </Panel>
      <div className="mt-6">
        <Panel title="התראות">
          <div className="py-4 space-y-4">
            {toggles.map(r => (
              <div key={r.l} className="flex items-center justify-between py-2">
                <span style={{ fontSize: 14 }}>{r.l}</span>
                <div style={{ width: 40, height: 22, background: r.on ? '#4A6B5C' : '#DCD3BF', borderRadius: 11, position: 'relative' }}>
                  <div style={{ width: 16, height: 16, background: '#F5F1EA', borderRadius: '50%', position: 'absolute', top: 3, right: r.on ? 21 : 3, transition: 'right 0.2s' }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

// ---------- Dashboard ----------
export default function Dashboard({ onExit }: { onExit: () => void }) {
  const [view, setView] = useState('today')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [navOpen, setNavOpen] = useState(false)
  const { leads, refresh: refreshLeads } = useLeads()
  const { appointments, refresh: refreshAppts } = useAppointments()

  return (
    <div className="flex min-h-screen" style={{ background: '#F5F1EA', color: '#1C2A24' }}>
      <Sidebar view={view} setView={v => { setView(v); setNavOpen(false) }} onExit={onExit} open={navOpen} onClose={() => setNavOpen(false)} />
      <main className="flex-1 min-w-0 flex flex-col">
        <TopBar view={view} onOpenNav={() => setNavOpen(true)} />
        <div className="flex-1 overflow-auto">
          {view === 'today'        && <TodayView appointments={appointments} leads={leads} />}
          {view === 'leads'        && <LeadsView leads={leads} onSelect={setSelectedLead} />}
          {view === 'calendar'     && <CalendarView appointments={appointments} />}
          {view === 'appointments' && <AppointmentsView appointments={appointments} onStatusChange={refreshAppts} />}
          {view === 'patients'     && <PatientsView appointments={appointments} />}
          {view === 'settings'     && <SettingsView />}
        </div>
      </main>

      {selectedLead && (
        <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} onStatusChange={refreshLeads} />
      )}
    </div>
  )
}
