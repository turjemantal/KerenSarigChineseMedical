import { useState, useEffect } from 'react'
import { Enso, Button, Avatar, Label } from './shared'
import { Icon } from './icons'
import { clearAdminToken, adminAuthHeader } from '../auth'
import {
  AppointmentStatus,
  APPOINTMENT_STATUS_LABELS,
  LeadStatus,
  LEAD_STATUS_LABELS,
  APPOINTMENT_DURATION_MINUTES,
  UI_ERRORS,
} from '../constants'
import type { ScheduleBlock, ExtraSlot } from '../constants'

// ---------- Types ----------
interface Lead {
  _id: string
  name: string
  phone: string
  concern: string
  treatment: string
  status: LeadStatus
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
  status: AppointmentStatus
  concern?: string
  notes?: string
}

// ---------- Hooks ----------
function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const refresh = () => {
    setLoading(true)
    setError(false)
    fetch('/api/leads', { headers: adminAuthHeader() })
      .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<Lead[]> })
      .then(setLeads)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }
  useEffect(refresh, [])
  return { leads, loading, error, refresh }
}

function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const refresh = () => {
    setLoading(true)
    setError(false)
    fetch('/api/appointments', { headers: adminAuthHeader() })
      .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<Appointment[]> })
      .then(setAppointments)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }
  useEffect(refresh, [])
  return { appointments, loading, error, refresh }
}

interface RegisteredClient {
  _id: string
  phone: string
  name?: string
  createdAt?: string
}

function useClients() {
  const [clients, setClients] = useState<RegisteredClient[]>([])
  const refresh = () => {
    fetch('/api/clients', { headers: adminAuthHeader() })
      .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<RegisteredClient[]> })
      .then(setClients)
      .catch(() => {})
  }
  useEffect(refresh, [])
  return { clients, refresh }
}

function useScheduleBlocks() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([])
  const refresh = () => {
    fetch('/api/schedule-blocks', { headers: adminAuthHeader() })
      .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<ScheduleBlock[]> })
      .then(setBlocks)
      .catch(() => {})
  }
  useEffect(refresh, [])
  return { blocks, refresh }
}

function useExtraSlots() {
  const [extraSlots, setExtraSlots] = useState<ExtraSlot[]>([])
  const refresh = () => {
    fetch('/api/schedule-blocks/extra-slots', { headers: adminAuthHeader() })
      .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<ExtraSlot[]> })
      .then(setExtraSlots)
      .catch(() => {})
  }
  useEffect(refresh, [])
  return { extraSlots, refresh }
}

// ---------- Helpers ----------
async function approveAppointment(id: string): Promise<boolean> {
  const res = await fetch(`/api/appointments/${id}/approve`, { method: 'PATCH', headers: adminAuthHeader() })
  return res.ok
}

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

function timeToDecimal(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

const DURATION_HOURS = APPOINTMENT_DURATION_MINUTES / 60

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
  }
  return (
    <div className="px-6 md:px-10 py-5 flex items-center gap-4" style={{ borderBottom: '1px solid rgba(28,42,36,0.1)', background: '#F5F1EA' }}>
      <button className="md:hidden" onClick={onOpenNav} aria-label="תפריט"><Icon.Menu /></button>
      <h1 className="truncate" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26, fontWeight: 400, letterSpacing: '-0.01em' }}>
        {titles[view] || view}
      </h1>
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
function TodayView({ appointments, leads, onStatusChange }: { appointments: Appointment[]; leads: Lead[]; onStatusChange: () => void }) {
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const today = todayStr()
  const todayAppts = appointments.filter(a => a.date === today && a.status !== AppointmentStatus.Cancelled).sort((a, b) => a.time.localeCompare(b.time))
  const newLeads = leads.filter(l => l.status === LeadStatus.New)
  const pendingAppts = appointments
    .filter(a => a.status === AppointmentStatus.Pending && a.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  const approve = async (id: string) => {
    setApprovingId(id)
    try {
      if (await approveAppointment(id)) onStatusChange()
    } finally {
      setApprovingId(null)
    }
  }

  return (
    <div className="p-6 md:p-10">
      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Kpi label="טיפולים היום" value={String(todayAppts.length)} sub="מתוזמנים" tone="moss" />
          <Kpi label="ממתינים לאישור" value={String(pendingAppts.length)} sub="דורשים אישור" tone="seal" />
          <Kpi label="פניות חדשות" value={String(newLeads.length)} sub="ממתינות לטיפול" />
          <Kpi label="סה״כ תורים" value={String(appointments.filter(a => a.status === AppointmentStatus.Scheduled).length)} sub="מאושרים" />
        </div>

        {pendingAppts.length > 0 && (
          <div className="md:col-span-12">
            <Panel title="תורים הממתינים לאישור" right={<Badge tone="pending">{pendingAppts.length} ממתינים</Badge>}>
              <div>
                {pendingAppts.map(a => (
                  <div key={a._id} className="py-3.5 flex items-center gap-3 flex-wrap" style={{ borderBottom: '1px solid rgba(28,42,36,0.08)' }}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar name={a.name} size={34} />
                      <div className="min-w-0">
                        <div className="truncate" style={{ fontSize: 14, fontWeight: 500 }}>{a.name}</div>
                        <div style={{ fontSize: 12.5, color: '#4A6B5C' }}>
                          {new Date(a.date + 'T00:00:00').toLocaleDateString('he-IL')} · <span style={{ direction: 'ltr', display: 'inline-block' }}>{a.time}</span>
                        </div>
                      </div>
                    </div>
                    {a.concern && <div className="hidden md:block flex-1 truncate" style={{ fontSize: 12.5, color: '#2A3D34' }}>״{a.concern}״</div>}
                    <Button variant="moss" size="sm" onClick={() => void approve(a._id)} disabled={approvingId === a._id}>
                      {approvingId === a._id ? 'מאשר…' : 'אישור התור'}
                    </Button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

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
                      <div style={{ fontSize: 10.5, color: '#4A6B5C', letterSpacing: '0.05em' }}>{APPOINTMENT_DURATION_MINUTES} דקות</div>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <Avatar name={a.name} size={34} />
                      <div className="min-w-0">
                        <div className="truncate" style={{ fontSize: 14, fontWeight: 500 }}>{a.name}</div>
                        <div className="truncate" style={{ fontSize: 12.5, color: '#4A6B5C' }}>{a.concern}</div>
                      </div>
                    </div>
                    {a.status === AppointmentStatus.Pending
                      ? <Button variant="moss" size="sm" onClick={() => void approve(a._id)} disabled={approvingId === a._id}>{approvingId === a._id ? 'מאשר…' : 'אישור'}</Button>
                      : <Badge tone={a.status}>{APPOINTMENT_STATUS_LABELS[a.status]}</Badge>}
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
  const counts: Record<string, number> = { all: leads.length }
  for (const s of Object.values(LeadStatus)) counts[s] = leads.filter(l => l.status === s).length
  const filterTabs: [string, string][] = [
    ['all', 'הכל'],
    ...Object.values(LeadStatus).map(s => [s, LEAD_STATUS_LABELS[s]] as [string, string]),
  ]

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {filterTabs.map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className="text-[13px] px-4 h-9 flex items-center gap-2"
            style={{ background: filter === k ? '#1C2A24' : 'transparent', color: filter === k ? '#F5F1EA' : '#1C2A24', border: `1px solid ${filter === k ? '#1C2A24' : 'rgba(28,42,36,0.15)'}`, borderRadius: 2 }}>
            {l} <span style={{ fontSize: 11, opacity: 0.7 }}>{counts[k]}</span>
          </button>
        ))}
      </div>

      {/* mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map(l => (
          <button key={l._id} onClick={() => onSelect(l)} className="w-full text-right p-4" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2 }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={l.name} size={32} />
                <div className="min-w-0">
                  <div className="truncate" style={{ fontSize: 14, fontWeight: 500 }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: '#4A6B5C', direction: 'ltr', textAlign: 'right' }}>{l.phone}</div>
                </div>
              </div>
              <Badge tone={l.status}>{LEAD_STATUS_LABELS[l.status]}</Badge>
            </div>
            {l.concern && <p className="mt-2 truncate" style={{ fontSize: 12.5, color: '#2A3D34' }}>{l.concern}</p>}
            <div className="mt-1" style={{ fontSize: 11.5, color: '#4A6B5C' }}>{new Date(l.createdAt).toLocaleDateString('he-IL')} · {l.source}</div>
          </button>
        ))}
        {filtered.length === 0 && <div className="py-10 text-center" style={{ color: '#4A6B5C', fontSize: 13.5 }}>אין פניות</div>}
      </div>

      {/* desktop table */}
      <div className="hidden md:block" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2, overflow: 'hidden' }}>
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
                  <td className="px-5 py-4"><Badge tone={l.status}>{LEAD_STATUS_LABELS[l.status]}</Badge></td>
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
  const [saveError, setSaveError] = useState(false)

  const updateStatus = async (status: string) => {
    setSaving(true)
    setSaveError(false)
    try {
      const res = await fetch(`/api/leads/${lead._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...adminAuthHeader() }, body: JSON.stringify({ status }) })
      if (!res.ok) throw new Error()
      onStatusChange()
      onClose()
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
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
      <div className="mb-6"><Badge tone={lead.status}>{LEAD_STATUS_LABELS[lead.status]}</Badge></div>
      <KV k="טלפון" v={<span style={{ direction: 'ltr', display: 'inline-block' }}>{lead.phone}</span>} icon="Phone" />
      {lead.email && <KV k="אימייל" v={lead.email} />}
      <KV k="תלונה עיקרית" v={lead.concern} multi />
      {lead.notes && <KV k="הערות" v={lead.notes} multi />}
      {saveError && (
        <div className="mt-4" style={{ fontSize: 13, color: '#C4634A' }}>{UI_ERRORS.SAVE_FAILED}</div>
      )}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <Button variant="primary" onClick={() => void updateStatus(LeadStatus.Contacted)} disabled={saving}>סימון ״בקשר״</Button>
        <Button variant="ghost" onClick={() => void updateStatus(LeadStatus.Booked)} disabled={saving}>קביעת תור</Button>
      </div>
      <div className="mt-4">
        <Button variant="quiet" onClick={() => void updateStatus(LeadStatus.Closed)} disabled={saving} className="w-full">סגירת פנייה</Button>
      </div>
    </Drawer>
  )
}

// ---------- CalendarView ----------
const dateInBlock = (dateStr: string, b: ScheduleBlock) => dateStr >= b.startDate && dateStr <= b.endDate

const NAV_BUTTON_STYLE = { border: '1px solid rgba(28,42,36,0.15)', borderRadius: 2 } as const

function Chevron({ dir, s = 12 }: { dir: 'prev' | 'next'; s?: number }) {
  const path = dir === 'prev' ? 'M9 6 L15 12 L9 18' : 'M15 6 L9 12 L15 18'
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={path} /></svg>
  )
}

function CalendarView({ appointments, blocks, extraSlots, onBlocksChange, onExtraChange }: { appointments: Appointment[]; blocks: ScheduleBlock[]; extraSlots: ExtraSlot[]; onBlocksChange: () => void; onExtraChange: () => void }) {
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(new Date()))
  const [mobileDay, setMobileDay] = useState(() => new Date())
  const [mobileView, setMobileView] = useState<'day' | 'week' | 'month'>('day')
  const [now, setNow] = useState(new Date())
  const [blocksOpen, setBlocksOpen] = useState(false)
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
    return d >= weekStart && d < weekEnd && a.status !== AppointmentStatus.Cancelled
  })

  const prevWeek = () => setWeekStart(d => addDays(d, -7))
  const nextWeek = () => setWeekStart(d => addDays(d, 7))
  const goToday = () => setWeekStart(getMondayOfWeek(new Date()))

  const weekLabel = `${hebFullDate(weekStart)} – ${hebFullDate(addDays(weekStart, WORK_DAYS - 1))}`
  const todayDateStr = todayStr()
  const nowDecimal = now.getHours() + now.getMinutes() / 60
  const showNowLine = nowDecimal >= START_HOUR && nowDecimal < END_HOUR

  const apptColor = (status: AppointmentStatus) =>
    status === AppointmentStatus.Pending ? { bg: '#B8893B', border: 'rgba(184,137,59,0.6)' } : { bg: '#4A6B5C', border: 'rgba(74,107,92,0.6)' }

  // mobile day agenda
  const mobileDateStr = formatDate(mobileDay)
  const mobileDayAppts = appointments
    .filter(a => a.date === mobileDateStr && a.status !== AppointmentStatus.Cancelled)
    .sort((a, b) => a.time.localeCompare(b.time))
  const mobileDayBlocks = blocks.filter(b => dateInBlock(mobileDateStr, b))
  const mobileDayClosed = mobileDayBlocks.some(b => !b.startTime)
  const apptsOn = (ds: string) => appointments.filter(a => a.date === ds && a.status !== AppointmentStatus.Cancelled)

  // mobile week (the work week containing mobileDay)
  const mobileWeekStart = getMondayOfWeek(mobileDay)
  const mobileWeekDays = Array.from({ length: WORK_DAYS }, (_, i) => addDays(mobileWeekStart, i))

  // mobile month grid (the month of mobileDay)
  const mMonthFirst = new Date(mobileDay.getFullYear(), mobileDay.getMonth(), 1)
  const mDaysInMonth = new Date(mobileDay.getFullYear(), mobileDay.getMonth() + 1, 0).getDate()
  const monthCells: (number | null)[] = []
  for (let i = 0; i < mMonthFirst.getDay(); i++) monthCells.push(null)
  for (let d = 1; d <= mDaysInMonth; d++) monthCells.push(d)
  while (monthCells.length % 7 !== 0) monthCells.push(null)
  const HEB_MONTH_NAMES = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

  // shift the mobile date by one unit of the current view (day/week/month)
  const shiftMobile = (dir: 1 | -1) => setMobileDay(d => {
    if (mobileView === 'day') return addDays(d, dir)
    if (mobileView === 'week') return addDays(d, dir * 7)
    return new Date(d.getFullYear(), d.getMonth() + dir, Math.min(d.getDate(), 28))
  })
  const mobileNavLabel = mobileView === 'day'
    ? `${hebDateLabel(mobileDay)} · ${hebFullDate(mobileDay)}`
    : mobileView === 'week'
      ? `${hebFullDate(mobileWeekStart)} – ${hebFullDate(addDays(mobileWeekStart, WORK_DAYS - 1))}`
      : `${HEB_MONTH_NAMES[mobileDay.getMonth()]} ${mobileDay.getFullYear()}`

  return (
    <div className="p-4 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        {/* week navigation — desktop */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={prevWeek} className="w-9 h-9 flex items-center justify-center hover:bg-[#EBE4D6]" style={NAV_BUTTON_STYLE} aria-label="שבוע קודם">
            <Chevron dir="prev" />
          </button>
          <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 21 }}>{weekLabel}</div>
          <button onClick={nextWeek} className="w-9 h-9 flex items-center justify-center hover:bg-[#EBE4D6]" style={NAV_BUTTON_STYLE} aria-label="שבוע הבא">
            <Chevron dir="next" />
          </button>
          <button onClick={goToday} className="h-9 px-3 text-[12px]" style={NAV_BUTTON_STYLE}>היום</button>
        </div>
        {/* view toggle + navigation — mobile */}
        <div className="flex md:hidden flex-col gap-3 w-full">
          <div className="grid grid-cols-3 gap-1 p-1" style={{ background: '#EBE4D6', borderRadius: 999 }}>
            {([['day', 'יום'], ['week', 'שבוע'], ['month', 'חודש']] as const).map(([v, label]) => (
              <button key={v} onClick={() => setMobileView(v)}
                className="h-9 text-[13px] transition-all"
                style={{ background: mobileView === v ? '#1C2A24' : 'transparent', color: mobileView === v ? '#F5F1EA' : '#4A6B5C', borderRadius: 999, fontWeight: mobileView === v ? 500 : 400 }}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => shiftMobile(-1)} className="w-11 h-11 flex items-center justify-center" style={NAV_BUTTON_STYLE} aria-label="הקודם">
              <Chevron dir="prev" s={14} />
            </button>
            <button onClick={() => setMobileDay(new Date())} className="flex-1 h-11 text-center" style={NAV_BUTTON_STYLE}>
              <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 16, color: mobileDateStr === todayDateStr && mobileView === 'day' ? '#C4634A' : '#1C2A24' }}>{mobileNavLabel}</span>
            </button>
            <button onClick={() => shiftMobile(1)} className="w-11 h-11 flex items-center justify-center" style={NAV_BUTTON_STYLE} aria-label="הבא">
              <Chevron dir="next" s={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
          <div className="hidden md:flex items-center gap-4 text-[11.5px]" style={{ color: '#4A6B5C' }}>
            <span className="flex items-center gap-1.5"><span style={{ width: 10, height: 10, background: '#4A6B5C', borderRadius: 2, display: 'inline-block' }} />מאושר</span>
            <span className="flex items-center gap-1.5"><span style={{ width: 10, height: 10, background: '#B8893B', borderRadius: 2, display: 'inline-block' }} />ממתין לאישור</span>
            <span className="flex items-center gap-1.5"><span style={{ width: 10, height: 10, background: 'rgba(28,42,36,0.25)', borderRadius: 2, display: 'inline-block' }} />חסום</span>
          </div>
          <Button variant="primary" size="sm" onClick={() => setBlocksOpen(true)} className="w-full md:w-auto">חסימת זמן / חופשה</Button>
        </div>
      </div>

      {/* mobile — day agenda */}
      <div className={`md:hidden space-y-3 ${mobileView === 'day' ? '' : 'hidden'}`}>
        {mobileDayClosed && (
          <div className="p-4 text-center" style={{ background: 'repeating-linear-gradient(135deg, rgba(28,42,36,0.06) 0 8px, rgba(28,42,36,0.12) 8px 16px)', borderRadius: 2, border: '1px solid rgba(28,42,36,0.1)' }}>
            <div style={{ fontSize: 14.5, fontWeight: 500 }}>הקליניקה סגורה ביום זה</div>
            {mobileDayBlocks.find(b => !b.startTime)?.reason && (
              <div className="mt-1" style={{ fontSize: 12.5, color: '#4A6B5C' }}>{mobileDayBlocks.find(b => !b.startTime)!.reason}</div>
            )}
          </div>
        )}
        {mobileDayBlocks.filter(b => b.startTime).map(b => (
          <div key={b._id} className="p-3 flex items-center gap-3" style={{ background: 'rgba(28,42,36,0.05)', border: '1px dashed rgba(28,42,36,0.2)', borderRadius: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 500, direction: 'ltr' }}>{b.startTime}–{b.endTime}</span>
            <span style={{ fontSize: 12.5, color: '#4A6B5C' }}>חסום{b.reason ? ` · ${b.reason}` : ''}</span>
          </div>
        ))}
        {mobileDayAppts.map(a => {
          const { bg } = apptColor(a.status)
          return (
            <div key={a._id} className="p-4 flex items-center gap-4" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRight: `4px solid ${bg}`, borderRadius: 2 }}>
              <div className="shrink-0 text-center" style={{ minWidth: 52 }}>
                <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 19, direction: 'ltr' }}>{a.time}</div>
                <div style={{ fontSize: 10, color: '#4A6B5C' }}>{APPOINTMENT_DURATION_MINUTES} דק׳</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate" style={{ fontSize: 14.5, fontWeight: 500 }}>{a.name}</div>
                {a.concern && <div className="truncate" style={{ fontSize: 12.5, color: '#4A6B5C' }}>{a.concern}</div>}
              </div>
              <Badge tone={a.status}>{APPOINTMENT_STATUS_LABELS[a.status]}</Badge>
            </div>
          )
        })}
        {!mobileDayClosed && mobileDayAppts.length === 0 && (
          <div className="py-12 text-center" style={{ color: '#4A6B5C', fontSize: 13.5, background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2 }}>
            אין תורים ביום זה
          </div>
        )}
      </div>

      {/* mobile — week list */}
      {mobileView === 'week' && (
        <div className="md:hidden space-y-3">
          {mobileWeekDays.map(d => {
            const ds = formatDate(d)
            const dayList = apptsOn(ds).sort((a, b) => a.time.localeCompare(b.time))
            const isToday = ds === todayDateStr
            const dayClosed = blocks.some(b => dateInBlock(ds, b) && !b.startTime)
            return (
              <div key={ds} style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                <button onClick={() => { setMobileDay(d); setMobileView('day') }} className="w-full flex items-center justify-between px-4 py-2.5" style={{ background: isToday ? 'rgba(196,99,74,0.06)' : '#F5F1EA', borderBottom: '1px solid rgba(28,42,36,0.08)' }}>
                  <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 15.5, color: isToday ? '#C4634A' : '#1C2A24', fontWeight: isToday ? 600 : 400 }}>{hebDateLabel(d)} · {hebFullDate(d)}</span>
                  <span style={{ fontSize: 11.5, color: '#4A6B5C' }}>{dayClosed ? 'סגור' : dayList.length ? `${dayList.length} תורים` : '—'}</span>
                </button>
                {dayList.map(a => {
                  const { bg } = apptColor(a.status)
                  return (
                    <div key={a._id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderTop: '1px solid rgba(28,42,36,0.05)', borderRight: `3px solid ${bg}` }}>
                      <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 15, direction: 'ltr', minWidth: 44 }}>{a.time}</span>
                      <span className="flex-1 truncate" style={{ fontSize: 13.5 }}>{a.name}</span>
                      <Badge tone={a.status}>{APPOINTMENT_STATUS_LABELS[a.status]}</Badge>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* mobile — month grid */}
      {mobileView === 'month' && (
        <div className="md:hidden" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2, padding: 10 }}>
          <div className="grid grid-cols-7 mb-1">
            {['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'].map((d, i) => (
              <div key={i} className="text-center" style={{ fontSize: 10.5, color: '#4A6B5C', padding: '4px 0' }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthCells.map((d, i) => {
              if (!d) return <div key={i} />
              const cellDate = new Date(mobileDay.getFullYear(), mobileDay.getMonth(), d)
              const ds = formatDate(cellDate)
              const count = apptsOn(ds).length
              const pending = apptsOn(ds).some(a => a.status === AppointmentStatus.Pending)
              const isToday = ds === todayDateStr
              return (
                <button key={i} onClick={() => { setMobileDay(cellDate); setMobileView('day') }}
                  className="flex flex-col items-center justify-center" style={{ aspectRatio: '1', borderRadius: 4, background: isToday ? 'rgba(196,99,74,0.1)' : count ? '#F5F1EA' : 'transparent' }}>
                  <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 15, color: isToday ? '#C4634A' : '#1C2A24', fontWeight: isToday ? 600 : 400 }}>{d}</span>
                  {count > 0 && <span style={{ width: 5, height: 5, borderRadius: '50%', background: pending ? '#B8893B' : '#4A6B5C', marginTop: 2 }} />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* desktop week grid */}
      <div className="hidden md:block" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2, overflow: 'hidden' }}>
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
                const dayBlocks = blocks.filter(b => dateInBlock(dateStr, b))
                return (
                  <div key={dIdx} className="relative" style={{ borderRight: '1px solid rgba(28,42,36,0.06)', background: isToday ? 'rgba(196,99,74,0.025)' : 'transparent' }}>
                    {hours.map(h => (
                      <div key={h} style={{ height: HOUR_H, borderBottom: '1px solid rgba(28,42,36,0.05)' }} />
                    ))}
                    {/* blocked time overlays */}
                    {dayBlocks.map(b => {
                      const fullDay = !b.startTime || !b.endTime
                      const top = fullDay ? 0 : (timeToDecimal(b.startTime!) - START_HOUR) * HOUR_H
                      const height = fullDay
                        ? (END_HOUR - START_HOUR) * HOUR_H
                        : (timeToDecimal(b.endTime!) - timeToDecimal(b.startTime!)) * HOUR_H
                      return (
                        <div key={b._id} className="absolute left-0 right-0 flex items-start justify-center"
                          style={{
                            top, height,
                            background: 'repeating-linear-gradient(135deg, rgba(28,42,36,0.10) 0 8px, rgba(28,42,36,0.16) 8px 16px)',
                            pointerEvents: 'none',
                          }}>
                          <span className="mt-2 px-2 py-0.5" style={{ fontSize: 10.5, color: '#1C2A24', background: 'rgba(245,241,234,0.85)', borderRadius: 2 }}>
                            {fullDay ? 'סגור' : `חסום ${b.startTime}–${b.endTime}`}{b.reason ? ` · ${b.reason}` : ''}
                          </span>
                        </div>
                      )
                    })}
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
                        <div key={a._id} className="absolute left-1.5 right-1.5 px-2 py-1.5 text-[11px]"
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

      {blocksOpen && (
        <BlocksDrawer blocks={blocks} extraSlots={extraSlots} onClose={() => setBlocksOpen(false)} onChange={onBlocksChange} onExtraChange={onExtraChange} />
      )}
    </div>
  )
}

// ---------- BlocksDrawer (close hours / days / vacations, open extra slots) ----------
const BlockKind = { Hours: 'hours', Day: 'day', Vacation: 'vacation', Open: 'open' } as const
type BlockKind = (typeof BlockKind)[keyof typeof BlockKind]

const BLOCK_KIND_LABELS: Record<BlockKind, string> = {
  [BlockKind.Hours]: 'חסימת שעות',
  [BlockKind.Day]: 'סגירת יום',
  [BlockKind.Vacation]: 'חופשה',
  [BlockKind.Open]: 'פתיחת שעה',
}

const TIME_OPTIONS = (() => {
  const out: string[] = []
  for (let h = 7; h <= 21; h++) for (const m of [0, 15, 30, 45]) {
    if (h === 21 && m > 0) break
    out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
  return out
})()

function BlocksDrawer({ blocks, extraSlots, onClose, onChange, onExtraChange }: {
  blocks: ScheduleBlock[]; extraSlots: ExtraSlot[]; onClose: () => void; onChange: () => void; onExtraChange: () => void
}) {
  const [kind, setKind] = useState<BlockKind>(BlockKind.Day)
  const [startDate, setStartDate] = useState(todayStr())
  const [endDate, setEndDate] = useState(todayStr())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('13:00')
  const [openTime, setOpenTime] = useState('09:00')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const post = async (url: string, body: object): Promise<boolean> => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeader() },
      body: JSON.stringify(body),
    })
    return res.ok
  }

  const submit = async () => {
    setError('')
    setSaving(true)
    try {
      if (kind === BlockKind.Open) {
        if (!await post('/api/schedule-blocks/extra-slots', { date: startDate, time: openTime })) throw new Error()
        onExtraChange()
        return
      }
      const body: Record<string, string> = { startDate, reason: reason.trim() }
      if (kind === BlockKind.Vacation) {
        if (endDate < startDate) { setError(UI_ERRORS.END_DATE_BEFORE_START); return }
        body.endDate = endDate
      }
      if (kind === BlockKind.Hours) {
        if (endTime <= startTime) { setError(UI_ERRORS.END_TIME_BEFORE_START); return }
        body.startTime = startTime
        body.endTime = endTime
      }
      if (!await post('/api/schedule-blocks', body)) throw new Error()
      onChange()
    } catch {
      setError(UI_ERRORS.SAVE_FAILED)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    const res = await fetch(`/api/schedule-blocks/${id}`, { method: 'DELETE', headers: adminAuthHeader() })
    if (res.ok) onChange()
  }

  const removeExtra = async (id: string) => {
    const res = await fetch(`/api/schedule-blocks/extra-slots/${id}`, { method: 'DELETE', headers: adminAuthHeader() })
    if (res.ok) onExtraChange()
  }

  const describe = (b: ScheduleBlock) => {
    const from = new Date(b.startDate + 'T00:00:00').toLocaleDateString('he-IL')
    const to = new Date(b.endDate + 'T00:00:00').toLocaleDateString('he-IL')
    if (b.startTime && b.endTime) return `${from} · ${b.startTime}–${b.endTime}`
    return b.startDate === b.endDate ? `${from} · יום שלם` : `${from} – ${to} · חופשה`
  }

  const fieldStyle = { background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.15)', borderRadius: 2, height: 40, padding: '0 10px', fontSize: 13.5, width: '100%' }
  const sortedExtras = [...extraSlots].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  return (
    <Drawer onClose={onClose} title="ניהול זמינות — חסימות ושעות נוספות">
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.values(BlockKind).map(k => (
          <button key={k} onClick={() => setKind(k)}
            className="text-[13px] px-4 h-9"
            style={{ background: kind === k ? '#1C2A24' : 'transparent', color: kind === k ? '#F5F1EA' : '#1C2A24', border: `1px solid ${kind === k ? '#1C2A24' : 'rgba(28,42,36,0.15)'}`, borderRadius: 2 }}>
            {BLOCK_KIND_LABELS[k]}
          </button>
        ))}
      </div>

      {kind === BlockKind.Open && (
        <div className="mb-4 p-3" style={{ background: '#E8EDDF', borderRadius: 2, fontSize: 12.5, color: '#3A5C2A', lineHeight: 1.6 }}>
          פתיחת שעה נוספת מאפשרת קביעת תור בשעה ספציפית — גם ביום או בשעה שאינם בלוח הקבוע.
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label>{kind === BlockKind.Vacation ? 'מתאריך' : 'תאריך'}</Label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-2" style={fieldStyle} />
        </div>
        {kind === BlockKind.Vacation && (
          <div>
            <Label>עד תאריך</Label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-2" style={fieldStyle} />
          </div>
        )}
        {kind === BlockKind.Open && (
          <div>
            <Label>שעה</Label>
            <select value={openTime} onChange={e => setOpenTime(e.target.value)} className="mt-2" style={fieldStyle}>
              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}
        {kind === BlockKind.Hours && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>משעה</Label>
              <select value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-2" style={fieldStyle}>
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label>עד שעה</Label>
              <select value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-2" style={fieldStyle}>
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}
        {kind !== BlockKind.Open && (
          <div>
            <Label>סיבה (אופציונלי)</Label>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="למשל: חופשה, השתלמות…" className="mt-2" style={fieldStyle} />
          </div>
        )}
        {error && <div style={{ fontSize: 13, color: '#C4634A' }}>{error}</div>}
        <Button variant={kind === BlockKind.Open ? 'moss' : 'primary'} onClick={() => void submit()} disabled={saving} className="w-full">
          {saving ? 'שומר…' : BLOCK_KIND_LABELS[kind]}
        </Button>
      </div>

      <div className="mt-10">
        <div style={{ fontSize: 11.5, letterSpacing: '0.18em', color: '#4A6B5C', marginBottom: 12 }}>חסימות קיימות</div>
        {blocks.length === 0 ? (
          <div style={{ fontSize: 13.5, color: '#4A6B5C' }}>אין חסימות מוגדרות</div>
        ) : (
          <div className="space-y-2">
            {blocks.map(b => (
              <div key={b._id} className="flex items-center justify-between gap-3 px-4 py-3" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.08)', borderRadius: 2 }}>
                <div className="min-w-0">
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{describe(b)}</div>
                  {b.reason && <div className="truncate" style={{ fontSize: 12, color: '#4A6B5C' }}>{b.reason}</div>}
                </div>
                <button onClick={() => void remove(b._id)} className="text-[12.5px] hover:underline shrink-0" style={{ color: '#C4634A' }}>הסרה</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {sortedExtras.length > 0 && (
        <div className="mt-8">
          <div style={{ fontSize: 11.5, letterSpacing: '0.18em', color: '#4A6B5C', marginBottom: 12 }}>שעות נוספות שנפתחו</div>
          <div className="space-y-2">
            {sortedExtras.map(s => (
              <div key={s._id} className="flex items-center justify-between gap-3 px-4 py-3" style={{ background: '#FFFFFF', border: '1px solid rgba(58,92,42,0.2)', borderRadius: 2 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>
                  {new Date(s.date + 'T00:00:00').toLocaleDateString('he-IL')} · <span style={{ direction: 'ltr', display: 'inline-block' }}>{s.time}</span>
                </div>
                <button onClick={() => void removeExtra(s._id)} className="text-[12.5px] hover:underline shrink-0" style={{ color: '#C4634A' }}>הסרה</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Drawer>
  )
}

// ---------- AppointmentsView ----------
function AppointmentsView({ appointments, onStatusChange }: { appointments: Appointment[]; onStatusChange: () => void }) {
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)
  const filterTabs: [string, string][] = [
    ['all', 'הכל'],
    ...Object.values(AppointmentStatus).map(s => [s, APPOINTMENT_STATUS_LABELS[s]] as [string, string]),
  ]

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    const res = await fetch(`/api/appointments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...adminAuthHeader() }, body: JSON.stringify({ status }) })
    if (!res.ok) return
    onStatusChange()
    setSelected(null)
  }

  const approve = async (id: string) => {
    if (!await approveAppointment(id)) return
    onStatusChange()
    setSelected(null)
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {filterTabs.map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className="text-[13px] px-4 h-9"
            style={{ background: filter === k ? '#1C2A24' : 'transparent', color: filter === k ? '#F5F1EA' : '#1C2A24', border: `1px solid ${filter === k ? '#1C2A24' : 'rgba(28,42,36,0.15)'}`, borderRadius: 2 }}>
            {l}
          </button>
        ))}
      </div>

      {/* mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map(a => (
          <div key={a._id} onClick={() => setSelected(a)} className="p-4 cursor-pointer" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2 }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={a.name} size={32} />
                <div className="min-w-0">
                  <div className="truncate" style={{ fontSize: 14, fontWeight: 500 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: '#4A6B5C', direction: 'ltr', textAlign: 'right' }}>{a.phone}</div>
                </div>
              </div>
              <Badge tone={a.status}>{APPOINTMENT_STATUS_LABELS[a.status]}</Badge>
            </div>
            <div className="mt-2 flex items-center gap-2" style={{ fontSize: 13, color: '#2A3D34' }}>
              <Icon.Calendar s={13} /> {new Date(a.date + 'T00:00:00').toLocaleDateString('he-IL')}
              <span style={{ direction: 'ltr' }}>{a.time}</span>
            </div>
            {a.status === AppointmentStatus.Pending && (
              <div className="mt-3">
                <Button variant="primary" size="sm" onClick={() => void approve(a._id)} className="w-full">אישור התור</Button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="py-10 text-center" style={{ color: '#4A6B5C', fontSize: 13.5 }}>אין תורים</div>}
      </div>

      {/* desktop table */}
      <div className="hidden md:block" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#EBE4D6' }}>
                {['שם', 'טלפון', 'תאריך', 'שעה', 'סטטוס', '', ''].map((h, i) => (
                  <th key={i} className="text-right px-5 py-3" style={{ fontSize: 11.5, letterSpacing: '0.1em', color: '#4A6B5C', fontWeight: 500 }}>{h}</th>
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
                  <td className="px-5 py-4"><Badge tone={a.status}>{APPOINTMENT_STATUS_LABELS[a.status]}</Badge></td>
                  <td className="px-5 py-4">
                    {a.status === AppointmentStatus.Pending && (
                      <button onClick={e => { e.stopPropagation(); void approve(a._id) }}
                        className="text-[12px] px-3 h-8" style={{ background: '#4A6B5C', color: '#F5F1EA', borderRadius: 2 }}>
                        אישור
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-4" style={{ color: '#4A6B5C' }}><Icon.ArrowLeft s={14} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center" style={{ color: '#4A6B5C', fontSize: 13.5 }}>אין תורים</td></tr>
              )}
            </tbody>
          </table>
        </div>
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
          <Badge tone={selected.status}>{APPOINTMENT_STATUS_LABELS[selected.status]}</Badge>
          <div className="mt-4">
            <KV k="טלפון" v={<span style={{ direction: 'ltr', display: 'inline-block' }}>{selected.phone}</span>} icon="Phone" />
            <KV k="תאריך" v={new Date(selected.date + 'T00:00:00').toLocaleDateString('he-IL')} />
            <KV k="שעה" v={<span style={{ direction: 'ltr', display: 'inline-block' }}>{selected.time}</span>} />
            {selected.concern && <KV k="סיבת הפנייה" v={selected.concern} multi />}
            {selected.notes && <KV k="הערות" v={selected.notes} multi />}
          </div>
          <div className="mt-8 space-y-3">
            {selected.status === AppointmentStatus.Pending && (
              <Button variant="primary" onClick={() => void approve(selected._id)} className="w-full">אישור התור</Button>
            )}
            {selected.status === AppointmentStatus.Scheduled && (
              <Button variant="primary" onClick={() => void updateStatus(selected._id, AppointmentStatus.Completed)} className="w-full">סימון כהושלם</Button>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="ghost" onClick={() => void updateStatus(selected._id, AppointmentStatus.Cancelled)}>ביטול תור</Button>
              <Button variant="quiet" onClick={() => void updateStatus(selected._id, AppointmentStatus.NoShow)}>לא הגיע/ה</Button>
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

function buildPatients(appointments: Appointment[], clients: RegisteredClient[]): Patient[] {
  const map = new Map<string, Patient>()
  // registered clients first — so someone who signed up but hasn't booked yet still appears
  for (const c of clients) {
    map.set(c.phone, { phone: c.phone, name: c.name || c.phone, visitCount: 0, lastVisit: null, nextVisit: null, appointments: [] })
  }
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
    const settledStatuses: AppointmentStatus[] = [AppointmentStatus.Completed, AppointmentStatus.Cancelled, AppointmentStatus.NoShow]
    const activeStatuses: AppointmentStatus[] = [AppointmentStatus.Pending, AppointmentStatus.Scheduled]
    const past = sorted.filter(a => a.date < today || (a.date === today) && settledStatuses.includes(a.status))
    const future = sorted.filter(a => a.date > today || (a.date >= today && activeStatuses.includes(a.status)))
    p.visitCount = past.length
    p.lastVisit = past.length > 0 ? past[past.length - 1].date : null
    p.nextVisit = future.length > 0 ? future[0].date : null
  }
  return Array.from(map.values()).sort((a, b) => (b.lastVisit ?? '').localeCompare(a.lastVisit ?? ''))
}

function PatientDrawer({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const sorted = [...patient.appointments].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
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
            <Badge tone={a.status}>{APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}</Badge>
          </div>
        ))}
        {sorted.length === 0 && <div style={{ fontSize: 13.5, color: '#4A6B5C' }}>אין תורים</div>}
      </div>
    </Drawer>
  )
}

function PatientsView({ appointments, clients }: { appointments: Appointment[]; clients: RegisteredClient[] }) {
  const [selected, setSelected] = useState<Patient | null>(null)
  const [search, setSearch] = useState('')
  const patients = buildPatients(appointments, clients)
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
      {/* mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map(p => (
          <button key={p.phone} onClick={() => setSelected(p)} className="w-full text-right p-4" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2 }}>
            <div className="flex items-center gap-3">
              <Avatar name={p.name} size={32} />
              <div className="min-w-0 flex-1">
                <div className="truncate" style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#4A6B5C', direction: 'ltr', textAlign: 'right' }}>{p.phone}</div>
              </div>
              <div className="text-center shrink-0">
                <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18 }}>{p.visitCount}</div>
                <div style={{ fontSize: 10.5, color: '#4A6B5C' }}>ביקורים</div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between" style={{ fontSize: 12, color: '#4A6B5C' }}>
              <span>ביקור אחרון: {p.lastVisit ? new Date(p.lastVisit + 'T00:00:00').toLocaleDateString('he-IL') : '—'}</span>
              <span style={{ color: p.nextVisit ? '#2A5C3F' : '#4A6B5C' }}>תור הבא: {p.nextVisit ? new Date(p.nextVisit + 'T00:00:00').toLocaleDateString('he-IL') : '—'}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div className="py-10 text-center" style={{ color: '#4A6B5C', fontSize: 13.5 }}>אין מטופלים</div>}
      </div>

      {/* desktop table */}
      <div className="hidden md:block" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2, overflow: 'hidden' }}>
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

// ---------- Dashboard ----------
export default function Dashboard({ onExit }: { onExit: () => void }) {
  const [view, setView] = useState('today')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [navOpen, setNavOpen] = useState(false)
  const { leads, error: leadsError, refresh: refreshLeads } = useLeads()
  const { appointments, error: apptError, refresh: refreshAppts } = useAppointments()
  const { blocks, refresh: refreshBlocks } = useScheduleBlocks()
  const { extraSlots, refresh: refreshExtraSlots } = useExtraSlots()
  const { clients } = useClients()

  return (
    <div className="flex min-h-screen" style={{ background: '#F5F1EA', color: '#1C2A24' }}>
      <Sidebar view={view} setView={v => { setView(v); setNavOpen(false) }} onExit={onExit} open={navOpen} onClose={() => setNavOpen(false)} />
      <main className="flex-1 min-w-0 flex flex-col">
        <TopBar view={view} onOpenNav={() => setNavOpen(true)} />
        {(leadsError || apptError) && (
          <div className="px-6 md:px-10 py-3 flex items-center gap-3" style={{ background: '#FAE8E4', color: '#8B2A15', fontSize: 13 }}>
            שגיאה בטעינת הנתונים —
            <button className="underline" onClick={() => { refreshLeads(); refreshAppts() }}>נסו שוב</button>
          </div>
        )}
        <div className="flex-1 overflow-auto">
          {view === 'today'        && <TodayView appointments={appointments} leads={leads} onStatusChange={refreshAppts} />}
          {view === 'leads'        && <LeadsView leads={leads} onSelect={setSelectedLead} />}
          {view === 'calendar'     && <CalendarView appointments={appointments} blocks={blocks} extraSlots={extraSlots} onBlocksChange={refreshBlocks} onExtraChange={refreshExtraSlots} />}
          {view === 'appointments' && <AppointmentsView appointments={appointments} onStatusChange={refreshAppts} />}
          {view === 'patients'     && <PatientsView appointments={appointments} clients={clients} />}
        </div>
      </main>

      {selectedLead && (
        <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} onStatusChange={refreshLeads} />
      )}
    </div>
  )
}
