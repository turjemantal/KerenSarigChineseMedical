// לוח בקרה לקרן — קליניקת קרן שריג
const Dashboard = ({ onExit }) => {
  const [view, setView] = useState("today");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "#F5F1EA", color: "#1C2A24" }}>
      <Sidebar view={view} setView={(v) => { setView(v); setNavOpen(false); }} onExit={onExit} open={navOpen} onClose={() => setNavOpen(false)} />
      <main className="flex-1 min-w-0 flex flex-col">
        <TopBar view={view} onOpenNav={() => setNavOpen(true)} />
        <div className="flex-1 overflow-auto">
          {view === "today" && <TodayView />}
          {view === "leads" && <LeadsView onSelect={setSelectedLead} />}
          {view === "calendar" && <CalendarView />}
          {view === "patients" && <PatientsView onSelect={setSelectedPatient} />}
          {view === "insights" && <InsightsView />}
          {view === "settings" && <SettingsView />}
        </div>
      </main>

      {selectedPatient && <PatientDrawer patient={selectedPatient} onClose={() => setSelectedPatient(null)} />}
      {selectedLead && <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </div>
  );
};

const Sidebar = ({ view, setView, onExit, open, onClose }) => {
  const items = [
    { id: "today",    label: "היום",          icon: "Dot" },
    { id: "leads",    label: "פניות חדשות",    icon: "Inbox", badge: 2 },
    { id: "calendar", label: "יומן",          icon: "Calendar" },
    { id: "patients", label: "מטופלים",       icon: "Users" },
    { id: "insights", label: "נתונים",        icon: "Chart" },
    { id: "settings", label: "הגדרות",        icon: "Settings" },
  ];

  return (
    <>
      {open && <div className="fixed inset-0 z-30 md:hidden" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose} />}
      <aside
        className={`fixed md:static z-40 md:z-auto top-0 bottom-0 right-0 flex flex-col transition-transform ${open ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}
        style={{ width: 248, background: "#1C2A24", color: "#F5F1EA", flexShrink: 0 }}
      >
        <div className="px-6 pt-7 pb-8">
          <div className="flex items-center gap-3">
            <Enso size={30} color="#F5F1EA" />
            <div className="leading-none">
              <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18 }}>קרן שריג</div>
              <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "#B8C5B8", marginTop: 4 }}>ממשק ניהול</div>
            </div>
          </div>
        </div>

        <nav className="px-3 flex-1">
          {items.map(it => {
            const active = view === it.id;
            const Ico = Icon[it.icon];
            return (
              <button
                key={it.id}
                onClick={() => setView(it.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] transition-all mb-0.5"
                style={{
                  background: active ? "rgba(245,241,234,0.08)" : "transparent",
                  color: active ? "#F5F1EA" : "#B8C5B8",
                  borderRight: active ? "2px solid #C4634A" : "2px solid transparent",
                  paddingRight: active ? 10 : 12,
                  borderRadius: 2,
                  textAlign: "right",
                }}
              >
                <Ico s={17} />
                <span className="flex-1">{it.label}</span>
                {it.badge && (
                  <span style={{ background: "#C4634A", color: "#F5F1EA", fontSize: 10.5, padding: "1px 7px", borderRadius: 10, fontWeight: 600 }}>
                    {it.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-5 mt-auto" style={{ borderTop: "1px solid rgba(245,241,234,0.1)" }}>
          <div className="flex items-center gap-3">
            <Avatar name="קרן שריג" size={36} tone="#4A6B5C" />
            <div className="flex-1 leading-tight min-w-0">
              <div style={{ fontSize: 13, color: "#F5F1EA", fontWeight: 500 }}>קרן שריג</div>
              <div style={{ fontSize: 11, color: "#B8C5B8" }}>מחוברת</div>
            </div>
          </div>
          <button
            onClick={onExit}
            className="w-full mt-4 text-right text-[12px] hover:text-[#F5F1EA]"
            style={{ color: "#B8C5B8" }}
          >
            → חזרה לאתר הציבורי
          </button>
        </div>
      </aside>
    </>
  );
};

const TopBar = ({ view, onOpenNav }) => {
  const titles = {
    today: "היום — יום שני, 20 באפריל",
    leads: "פניות חדשות",
    calendar: "יומן טיפולים",
    patients: "מטופלים",
    insights: "נתונים",
    settings: "הגדרות",
  };
  return (
    <div className="px-6 md:px-10 py-5 flex items-center justify-between gap-6" style={{ borderBottom: "1px solid rgba(28,42,36,0.1)", background: "#F5F1EA" }}>
      <div className="flex items-center gap-4 min-w-0">
        <button className="md:hidden" onClick={onOpenNav}><Icon.Menu /></button>
        <h1 className="truncate" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26, fontWeight: 400, letterSpacing: "-0.01em" }}>
          {titles[view]}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 h-10" style={{ background: "#FFFFFF", border: "1px solid rgba(28,42,36,0.15)", borderRadius: 2, width: 280 }}>
          <Icon.Search s={16} />
          <input placeholder="חיפוש מטופלים, פניות…" className="flex-1 bg-transparent outline-none text-[13px]" />
          <kbd style={{ fontSize: 10, color: "#4A6B5C", fontFamily: "'JetBrains Mono', monospace" }}>⌘K</kbd>
        </div>
        <Button variant="primary" size="sm">+ מטופל חדש</Button>
      </div>
    </div>
  );
};

const TodayView = () => {
  return (
    <div className="p-6 md:p-10">
      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Kpi label="טיפולים היום" value="7" sub="2 מטופלים חדשים" tone="moss" />
          <Kpi label="פניות חדשות השבוע" value="5" sub="↑ 2 משבוע שעבר" />
          <Kpi label="נוסחאות להכנה" value="3" sub="לאיסוף השבוע" tone="seal" />
          <Kpi label="שימור מטופלים" value="11.4 ח׳" sub="90 הימים האחרונים" />
        </div>

        <div className="md:col-span-7">
          <Panel title="לוח הטיפולים היום" right={<a className="text-[12px] hover:underline" style={{ color: "#4A6B5C" }}>ליומן המלא →</a>}>
            <div className="divide-y" style={{ borderColor: "rgba(28,42,36,0.08)" }}>
              {APPOINTMENTS.map(a => (
                <div key={a.id} className="py-3.5 flex items-center gap-4" style={{ borderBottom: "1px solid rgba(28,42,36,0.08)" }}>
                  <div className="w-[72px] shrink-0" style={{ direction: "ltr", textAlign: "right" }}>
                    <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 19 }}>{a.time}</div>
                    <div style={{ fontSize: 10.5, color: "#4A6B5C", letterSpacing: "0.05em" }}>{a.duration} דקות</div>
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <Avatar name={a.patient} size={34} />
                    <div className="min-w-0">
                      <div className="truncate" style={{ fontSize: 14, fontWeight: 500 }}>{a.patient}</div>
                      <div style={{ fontSize: 12.5, color: "#4A6B5C" }}>{a.type} · {a.room}</div>
                    </div>
                  </div>
                  {a.status === "new" ? <Badge tone="new">מטופל/ת חדש/ה</Badge> : <Badge tone="booked">מאושר</Badge>}
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="md:col-span-5 space-y-6">
          <Panel title="פניות חדשות" right={<Badge tone="urgent">2 לא נקראו</Badge>}>
            {LEADS.filter(l => l.status === "new").map(l => (
              <div key={l.id} className="py-3.5" style={{ borderBottom: "1px solid rgba(28,42,36,0.08)" }}>
                <div className="flex items-center justify-between gap-3">
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{l.name}</div>
                  <span style={{ fontSize: 11.5, color: "#4A6B5C" }}>{l.received}</span>
                </div>
                <div className="mt-1 flex items-center gap-2" style={{ fontSize: 12, color: "#4A6B5C", direction: "ltr", justifyContent: "flex-end" }}>
                  <Icon.Phone s={11} /> {l.phone}
                </div>
                <p className="mt-2" style={{ fontSize: 13, lineHeight: 1.6, color: "#2A3D34" }}>
                  ״{l.concern}״
                </p>
                <div className="mt-3 flex gap-2">
                  <button className="text-[12px] h-8 px-3" style={{ background: "#1C2A24", color: "#F5F1EA", borderRadius: 2 }}>התקשרות</button>
                  <button className="text-[12px] h-8 px-3" style={{ background: "#EBE4D6", color: "#1C2A24", borderRadius: 2 }}>טופס אנמנזה</button>
                </div>
              </div>
            ))}
          </Panel>

          <Panel title="משימות פתוחות">
            {[
              { t: "הכנת נוסחת צמחים למיכל אברהמי (Xiao Yao San)", tag: "צמחים" },
              { t: "החזרת טלפון לתומר לוי בנוגע לזמינות בשישי", tag: "מעקב" },
              { t: "עיון בתוצאות בדיקות דם של אורית מזרחי", tag: "בדיקות" },
            ].map((x, i) => (
              <div key={i} className="flex items-start gap-3 py-3" style={{ borderBottom: i < 2 ? "1px solid rgba(28,42,36,0.08)" : "none" }}>
                <button style={{ width: 16, height: 16, marginTop: 2, border: "1px solid rgba(28,42,36,0.3)", borderRadius: 2, flexShrink: 0 }} />
                <div className="flex-1">
                  <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{x.t}</div>
                  <div className="mt-1" style={{ fontSize: 11.5, color: "#4A6B5C" }}>{x.tag}</div>
                </div>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
};

const Kpi = ({ label, value, sub, tone }) => {
  const tones = {
    moss: { bg: "#4A6B5C", fg: "#F5F1EA", subFg: "#B8C5B8" },
    seal: { bg: "#C4634A", fg: "#F5F1EA", subFg: "#F4DDD5" },
    default: { bg: "#FFFFFF", fg: "#1C2A24", subFg: "#4A6B5C" },
  };
  const t = tones[tone] || tones.default;
  return (
    <div className="p-5" style={{ background: t.bg, borderRadius: 2, border: tone ? "none" : "1px solid rgba(28,42,36,0.1)" }}>
      <div style={{ fontSize: 11.5, letterSpacing: "0.12em", color: t.subFg }}>{label}</div>
      <div className="mt-3" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 36, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1, color: t.fg }}>
        {value}
      </div>
      <div className="mt-2" style={{ fontSize: 12.5, color: t.subFg }}>{sub}</div>
    </div>
  );
};

const Panel = ({ title, right, children }) => (
  <section style={{ background: "#FFFFFF", border: "1px solid rgba(28,42,36,0.1)", borderRadius: 2 }}>
    <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(28,42,36,0.08)" }}>
      <h3 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18, fontWeight: 400 }}>{title}</h3>
      {right}
    </div>
    <div className="px-5 py-2">{children}</div>
  </section>
);

const LeadsView = ({ onSelect }) => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? LEADS : LEADS.filter(l => l.status === filter);

  const counts = {
    all: LEADS.length,
    new: LEADS.filter(l => l.status === "new").length,
    contacted: LEADS.filter(l => l.status === "contacted").length,
    booked: LEADS.filter(l => l.status === "booked").length,
    closed: LEADS.filter(l => l.status === "closed").length,
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {[
          { k: "all", l: "הכל" },
          { k: "new", l: "חדש" },
          { k: "contacted", l: "יצרתי קשר" },
          { k: "booked", l: "נקבע תור" },
          { k: "closed", l: "סגור" },
        ].map(f => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className="text-[13px] px-4 h-9 flex items-center gap-2"
            style={{
              background: filter === f.k ? "#1C2A24" : "transparent",
              color: filter === f.k ? "#F5F1EA" : "#1C2A24",
              border: `1px solid ${filter === f.k ? "#1C2A24" : "rgba(28,42,36,0.15)"}`,
              borderRadius: 2,
            }}
          >
            {f.l}
            <span style={{ fontSize: 11, opacity: 0.7 }}>{counts[f.k]}</span>
          </button>
        ))}
        <div className="flex-1" />
        <Button variant="ghost" size="sm">ייצוא CSV</Button>
      </div>

      <div style={{ background: "#FFFFFF", border: "1px solid rgba(28,42,36,0.1)", borderRadius: 2, overflow: "hidden" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#EBE4D6" }}>
                {["שם", "טלפון", "תלונה", "מקור", "התקבל", "סטטוס", ""].map(h => (
                  <th key={h} className="text-right px-5 py-3" style={{ fontSize: 11.5, letterSpacing: "0.1em", color: "#4A6B5C", fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <tr
                  key={l.id}
                  onClick={() => onSelect(l)}
                  className="cursor-pointer hover:bg-[#F5F1EA] transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(28,42,36,0.06)" : "none" }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={l.name} size={30} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{l.name}</div>
                        <div style={{ fontSize: 11, color: "#4A6B5C", fontFamily: "'JetBrains Mono', monospace" }}>{l.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4" style={{ fontSize: 13, color: "#2A3D34", direction: "ltr", textAlign: "right" }}>{l.phone}</td>
                  <td className="px-5 py-4 max-w-[280px]" style={{ fontSize: 13, color: "#2A3D34" }}>
                    <div className="truncate">{l.concern}</div>
                  </td>
                  <td className="px-5 py-4" style={{ fontSize: 12.5, color: "#4A6B5C" }}>{l.source}</td>
                  <td className="px-5 py-4" style={{ fontSize: 12.5, color: "#4A6B5C" }}>{l.received}</td>
                  <td className="px-5 py-4"><Badge tone={l.status}>{({new:"חדש",contacted:"בקשר",booked:"נקבע",closed:"סגור"})[l.status]}</Badge></td>
                  <td className="px-5 py-4" style={{ color: "#4A6B5C" }}><Icon.ArrowLeft s={14} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const LeadDrawer = ({ lead, onClose }) => (
  <Drawer onClose={onClose} title="פרטי פנייה">
    <div className="flex items-center gap-4 mb-6">
      <Avatar name={lead.name} size={54} />
      <div>
        <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26 }}>{lead.name}</div>
        <div style={{ fontSize: 12.5, color: "#4A6B5C", marginTop: 2 }}>
          {lead.id} · התקבל {lead.received} · {lead.source}
        </div>
      </div>
    </div>
    <div className="mb-6"><Badge tone={lead.status}>{({new:"חדש",contacted:"בקשר",booked:"נקבע",closed:"סגור"})[lead.status]}</Badge></div>

    <KV k="טלפון" v={<span style={{ direction: "ltr", display: "inline-block" }}>{lead.phone}</span>} icon="Phone" />
    <KV k="תלונה עיקרית" v={lead.concern} multi />

    <div className="mt-8 grid grid-cols-2 gap-3">
      <Button variant="primary">קביעת תור</Button>
      <Button variant="ghost">סימון ״בקשר״</Button>
    </div>

    <div className="mt-8">
      <div style={{ fontSize: 11.5, letterSpacing: "0.16em", color: "#4A6B5C", marginBottom: 10 }}>
        הערות מהירות
      </div>
      <textarea
        rows={4}
        placeholder="כתיבת הערה לפנייה…"
        className="w-full p-3 text-[13.5px] outline-none"
        style={{ background: "#FFFFFF", border: "1px solid rgba(28,42,36,0.15)", borderRadius: 2, fontFamily: "'Heebo', sans-serif" }}
      />
    </div>
  </Drawer>
);

const CalendarView = () => {
  const days = ["ב׳ 20", "ג׳ 21", "ד׳ 22", "ה׳ 23", "ו׳ 24", "א׳ 26"];
  const hours = Array.from({ length: 10 }, (_, i) => 9 + i);

  const blocks = [
    { day: 0, hour: 9, duration: 1, patient: "מ. אברהמי", type: "דיקור", color: "#4A6B5C" },
    { day: 0, hour: 10.25, duration: 0.75, patient: "א. מזרחי", type: "מעקב", color: "#8B6F47" },
    { day: 0, hour: 11.5, duration: 1, patient: "א. מרום", type: "דיקור", color: "#4A6B5C" },
    { day: 0, hour: 13.5, duration: 0.5, patient: "ל. פרץ", type: "כוסות", color: "#C4634A" },
    { day: 0, hour: 14.25, duration: 1, patient: "נ. לויתן", type: "דיקור+צמחים", color: "#4A6B5C" },
    { day: 0, hour: 15.75, duration: 0.75, patient: "ת. לוי", type: "ייעוץ", color: "#5C6F8B" },
    { day: 0, hour: 17, duration: 1, patient: "ש. כהן", type: "דיקור", color: "#4A6B5C" },

    { day: 1, hour: 9.5, duration: 1, patient: "י. דהן", type: "ייעוץ", color: "#5C6F8B" },
    { day: 1, hour: 11, duration: 1, patient: "ר. ברק", type: "ייעוץ", color: "#5C6F8B" },
    { day: 1, hour: 14, duration: 1, patient: "מ. אברהמי", type: "דיקור", color: "#4A6B5C" },
    { day: 1, hour: 16, duration: 0.75, patient: "ל. פרץ", type: "מעקב", color: "#8B6F47" },

    { day: 2, hour: 10, duration: 1, patient: "א. מרום", type: "דיקור", color: "#4A6B5C" },
    { day: 2, hour: 13, duration: 0.5, patient: "א. בן-דוד", type: "כוסות", color: "#C4634A" },
    { day: 2, hour: 15, duration: 1, patient: "ד. שפירא", type: "דיקור+צמחים", color: "#4A6B5C" },

    { day: 3, hour: 9, duration: 1, patient: "נ. לויתן", type: "דיקור", color: "#4A6B5C" },
    { day: 3, hour: 11.5, duration: 0.75, patient: "א. מזרחי", type: "מעקב", color: "#8B6F47" },
    { day: 3, hour: 14, duration: 1, patient: "ת. לוי", type: "דיקור", color: "#4A6B5C" },
    { day: 3, hour: 16.5, duration: 0.5, patient: "ללא קביעה", type: "כוסות", color: "#C4634A" },

    { day: 4, hour: 10, duration: 1, patient: "מ. אברהמי", type: "דיקור", color: "#4A6B5C" },
    { day: 4, hour: 13, duration: 1, patient: "ש. כהן", type: "דיקור", color: "#4A6B5C" },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 flex items-center justify-center hover:bg-[#EBE4D6]" style={{ border: "1px solid rgba(28,42,36,0.15)", borderRadius: 2 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6 L15 12 L9 18" /></svg>
          </button>
          <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 21 }}>20–26 באפריל, 2026</div>
          <button className="w-9 h-9 flex items-center justify-center hover:bg-[#EBE4D6]" style={{ border: "1px solid rgba(28,42,36,0.15)", borderRadius: 2 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6 L9 12 L15 18" /></svg>
          </button>
          <button className="h-9 px-3 text-[12px]" style={{ border: "1px solid rgba(28,42,36,0.15)", borderRadius: 2 }}>היום</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex" style={{ border: "1px solid rgba(28,42,36,0.15)", borderRadius: 2, overflow: "hidden" }}>
            {["יום", "שבוע", "חודש"].map((v, i) => (
              <button key={v} className="h-9 px-3 text-[12px]" style={{ background: i === 1 ? "#1C2A24" : "transparent", color: i === 1 ? "#F5F1EA" : "#1C2A24" }}>
                {v}
              </button>
            ))}
          </div>
          <Button variant="primary" size="sm">+ תור חדש</Button>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", border: "1px solid rgba(28,42,36,0.1)", borderRadius: 2, overflow: "hidden" }}>
        <div className="overflow-x-auto">
          <div style={{ minWidth: 900 }}>
            <div className="grid" style={{ gridTemplateColumns: "64px repeat(6, 1fr)", background: "#EBE4D6" }}>
              <div />
              {days.map(d => (
                <div key={d} className="py-3 text-center" style={{ fontSize: 12, color: "#4A6B5C", letterSpacing: "0.06em", borderRight: "1px solid rgba(28,42,36,0.08)" }}>
                  <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 16, color: "#1C2A24" }}>{d}</div>
                </div>
              ))}
            </div>
            <div className="relative grid" style={{ gridTemplateColumns: "64px repeat(6, 1fr)" }}>
              <div>
                {hours.map(h => (
                  <div key={h} style={{ height: 56, borderBottom: "1px solid rgba(28,42,36,0.06)", fontSize: 11, color: "#4A6B5C", padding: "4px 8px", fontFamily: "'JetBrains Mono', monospace", direction: "ltr", textAlign: "left" }}>
                    {h.toString().padStart(2, "0")}:00
                  </div>
                ))}
              </div>
              {days.map((_, dIdx) => (
                <div key={dIdx} className="relative" style={{ borderRight: "1px solid rgba(28,42,36,0.06)" }}>
                  {hours.map(h => (
                    <div key={h} style={{ height: 56, borderBottom: "1px solid rgba(28,42,36,0.06)" }} />
                  ))}
                  {blocks.filter(b => b.day === dIdx).map((b, i) => (
                    <div
                      key={i}
                      className="absolute left-1 right-1 px-2 py-1.5 text-[11px] cursor-pointer hover:opacity-90 transition-opacity"
                      style={{
                        top: (b.hour - 9) * 56 + 2,
                        height: b.duration * 56 - 4,
                        background: b.color,
                        color: "#F5F1EA",
                        borderRadius: 2,
                        overflow: "hidden",
                        borderRight: `3px solid rgba(245,241,234,0.4)`,
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 11.5 }}>{b.patient}</div>
                      <div style={{ opacity: 0.85, fontSize: 10.5, marginTop: 1 }}>{b.type}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 mt-5 flex-wrap" style={{ fontSize: 12.5, color: "#4A6B5C" }}>
        <LegendDot color="#4A6B5C" label="דיקור" />
        <LegendDot color="#8B6F47" label="מעקב" />
        <LegendDot color="#C4634A" label="כוסות רוח" />
        <LegendDot color="#5C6F8B" label="ייעוץ ראשון" />
      </div>
    </div>
  );
};

const LegendDot = ({ color, label }) => (
  <span className="flex items-center gap-2">
    <span style={{ width: 10, height: 10, background: color, borderRadius: 2 }} /> {label}
  </span>
);

const PatientsView = ({ onSelect }) => {
  return (
    <div className="p-6 md:p-10">
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          { l: "מטופלים פעילים", v: "142", s: "+8 החודש" },
          { l: "ממוצע טיפולים למטופל", v: "9.2", s: "ב-12 החודשים האחרונים" },
          { l: "סיום תוכנית טיפול", v: "87%", s: "מסיימים את הטיפול" },
        ].map(k => <Kpi key={k.l} label={k.l} value={k.v} sub={k.s} />)}
      </div>

      <div style={{ background: "#FFFFFF", border: "1px solid rgba(28,42,36,0.1)", borderRadius: 2, overflow: "hidden" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(28,42,36,0.08)" }}>
          <h3 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18, fontWeight: 400 }}>כל המטופלים</h3>
          <div className="flex items-center gap-2 px-3 h-9" style={{ background: "#F5F1EA", borderRadius: 2, width: 260 }}>
            <Icon.Search s={14} />
            <input placeholder="חיפוש לפי שם או מזהה…" className="flex-1 bg-transparent outline-none text-[12.5px]" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0">
          {PATIENTS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="text-right p-5 hover:bg-[#F5F1EA] transition-colors"
              style={{
                borderBottom: "1px solid rgba(28,42,36,0.06)",
                borderLeft: i % 2 === 0 ? "1px solid rgba(28,42,36,0.06)" : "none",
              }}
            >
              <div className="flex items-start gap-4">
                <Avatar name={p.name} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{p.name}</div>
                    <span style={{ fontSize: 11, color: "#4A6B5C", fontFamily: "'JetBrains Mono', monospace" }}>{p.id}</span>
                  </div>
                  <div className="mt-0.5" style={{ fontSize: 12, color: "#4A6B5C" }}>גיל {p.age} · מאז {p.since}</div>
                  <div className="mt-3" style={{ fontSize: 13, color: "#1C2A24" }}>
                    <span style={{ color: "#4A6B5C" }}>עיקרי:</span> {p.primary}
                  </div>
                  <div className="mt-1" style={{ fontSize: 12.5, color: "#4A6B5C", fontFamily: "'Frank Ruhl Libre', serif" }}>
                    דפוס — {p.pattern}
                  </div>
                  <div className="mt-3 flex items-center gap-4" style={{ fontSize: 11.5, color: "#4A6B5C" }}>
                    <span>{p.visits} טיפולים</span>
                    <span>אחרון: {p.lastVisit}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const PatientDrawer = ({ patient, onClose }) => (
  <Drawer onClose={onClose} title="תיק מטופל/ת" wide>
    <div className="flex items-center gap-4 mb-2">
      <Avatar name={patient.name} size={62} />
      <div>
        <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28 }}>{patient.name}</div>
        <div style={{ fontSize: 12.5, color: "#4A6B5C", marginTop: 2 }}>
          {patient.id} · גיל {patient.age} · מאז {patient.since} · {patient.visits} טיפולים
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 mt-6">
      <Button variant="primary" size="sm">התחלת טיפול</Button>
      <Button variant="ghost" size="sm">הוספת הערה</Button>
    </div>

    <div className="mt-8">
      <SectionTitle>אבחון</SectionTitle>
      <div className="grid grid-cols-2 gap-4 mt-3">
        <InfoField label="תלונה עיקרית" val={patient.primary} />
        <InfoField label="דפוס TCM" val={patient.pattern} italic />
        <InfoField label="דופק" val={patient.pulse} />
        <InfoField label="לשון" val={patient.tongue} />
      </div>
    </div>

    {patient.formulas.length > 0 && (
      <div className="mt-8">
        <SectionTitle>נוסחאות פעילות</SectionTitle>
        <div className="mt-3 space-y-2">
          {patient.formulas.map(f => (
            <div key={f} className="flex items-center justify-between p-3" style={{ background: "#EBE4D6", borderRadius: 2 }}>
              <div className="flex items-center gap-3">
                <Icon.Leaf s={16} />
                <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 15 }}>{f}</span>
              </div>
              <span style={{ fontSize: 11.5, color: "#4A6B5C" }}>חידוש עד 28.4</span>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="mt-8">
      <SectionTitle>תיעוד טיפולים</SectionTitle>
      <div className="mt-3 space-y-4">
        {patient.notes.map((n, i) => (
          <div key={i} className="flex gap-4">
            <div className="shrink-0 w-20 text-left">
              <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 13, color: "#4A6B5C" }}>{n.date}</div>
            </div>
            <div className="flex-1 p-4" style={{ background: "#FFFFFF", border: "1px solid rgba(28,42,36,0.08)", borderRadius: 2, fontSize: 13.5, lineHeight: 1.7, color: "#1C2A24" }}>
              {n.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  </Drawer>
);

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 11.5, letterSpacing: "0.16em", color: "#4A6B5C", fontWeight: 500 }}>
    {children}
  </div>
);

const InfoField = ({ label, val, italic }) => (
  <div className="p-3" style={{ background: "#F5F1EA", borderRadius: 2 }}>
    <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "#4A6B5C" }}>{label}</div>
    <div className="mt-1.5" style={{ fontSize: 14, color: "#1C2A24", fontFamily: italic ? "'Frank Ruhl Libre', serif" : "inherit" }}>
      {val}
    </div>
  </div>
);

const KV = ({ k, v, icon, multi }) => {
  const Ico = icon ? Icon[icon] : null;
  return (
    <div className="py-3" style={{ borderBottom: "1px solid rgba(28,42,36,0.08)" }}>
      <div style={{ fontSize: 11.5, letterSpacing: "0.12em", color: "#4A6B5C" }}>{k}</div>
      <div className="mt-1 flex items-start gap-2" style={{ fontSize: multi ? 14 : 15, lineHeight: 1.6 }}>
        {Ico && <span style={{ color: "#4A6B5C", marginTop: 3 }}><Ico /></span>}
        {v}
      </div>
    </div>
  );
};

const Drawer = ({ children, onClose, title, wide }) => (
  <div className="fixed inset-0 z-40 flex justify-start" style={{ background: "rgba(28,42,36,0.45)", backdropFilter: "blur(3px)" }} onClick={onClose}>
    <div
      className="h-full overflow-y-auto"
      style={{
        width: wide ? "min(640px, 100%)" : "min(460px, 100%)",
        background: "#F5F1EA",
        animation: "slideInLeft 280ms cubic-bezier(.2,.8,.2,1)",
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4" style={{ background: "#F5F1EA", borderBottom: "1px solid rgba(28,42,36,0.1)" }}>
        <div style={{ fontSize: 11.5, letterSpacing: "0.18em", color: "#4A6B5C" }}>
          {title}
        </div>
        <button onClick={onClose} className="p-1"><Icon.Close /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const InsightsView = () => (
  <div className="p-6 md:p-10">
    <div className="grid md:grid-cols-4 gap-4 mb-6">
      <Kpi label="הכנסות החודש" value="₪18,420" sub="+12% מאפריל" tone="moss" />
      <Kpi label="קביעות תור" value="87" sub="14 מטופלים חדשים" />
      <Kpi label="ביטולים" value="4.2%" sub="טווח בריא" />
      <Kpi label="דירוג ממוצע" value="4.92" sub="מבוסס 54 חוות דעת" />
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <Panel title="התפלגות לפי סוג טיפול" right={<span style={{ fontSize: 11.5, color: "#4A6B5C" }}>30 יום</span>}>
        <div className="py-4 space-y-4">
          {[
            { name: "דיקור", value: 52, color: "#4A6B5C" },
            { name: "מעקב צמחים", value: 18, color: "#8B6F47" },
            { name: "ייעוץ ראשוני", value: 10, color: "#5C6F8B" },
            { name: "כוסות רוח", value: 7, color: "#C4634A" },
          ].map(r => (
            <div key={r.name}>
              <div className="flex justify-between text-[13px] mb-1.5">
                <span>{r.name}</span>
                <span style={{ color: "#4A6B5C" }}>{r.value}</span>
              </div>
              <div style={{ height: 6, background: "#EBE4D6", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${r.value * 1.5}%`, height: "100%", background: r.color }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="נפח טיפולים שבועי">
        <div className="py-6 flex items-end justify-between gap-2" style={{ height: 200 }}>
          {[62, 70, 58, 74, 82, 68, 78, 85, 80, 88, 92, 87].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div style={{ width: "100%", height: `${h}%`, background: i === 11 ? "#C4634A" : "#4A6B5C", borderRadius: 2 }} />
              <span style={{ fontSize: 10, color: "#4A6B5C" }}>שב׳ {i + 1}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  </div>
);

const SettingsView = () => (
  <div className="p-6 md:p-10 max-w-[760px]">
    <Panel title="פרטי הקליניקה">
      <div className="py-4 space-y-4">
        <KV k="שם הקליניקה" v="קרן שריג — רפואה סינית" />
        <KV k="כתובת" v="מזכרת בתיה" />
        <KV k="טלפון" v={<span style={{ direction: "ltr" }}>050-9031503</span>} />
      </div>
    </Panel>
    <div className="mt-6">
      <Panel title="התראות">
        <div className="py-4 space-y-4">
          {[
            { l: "פנייה חדשה באתר", on: true },
            { l: "ביטול תור", on: true },
            { l: "תזכורת להכנת נוסחה", on: true },
            { l: "הודעה ממטופל", on: false },
          ].map(r => (
            <div key={r.l} className="flex items-center justify-between py-2">
              <span style={{ fontSize: 14 }}>{r.l}</span>
              <div style={{ width: 40, height: 22, background: r.on ? "#4A6B5C" : "#DCD3BF", borderRadius: 11, position: "relative" }}>
                <div style={{ width: 16, height: 16, background: "#F5F1EA", borderRadius: "50%", position: "absolute", top: 3, right: r.on ? 21 : 3, transition: "right 0.2s" }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  </div>
);

Object.assign(window, { Dashboard });
