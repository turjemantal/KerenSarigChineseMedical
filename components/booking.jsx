// חלון קביעת תור: ריכוז פנייה → תאריך/שעה → פרטים → אישור
const BookingModal = ({ open, onClose }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    treatment: "ייעוץ ראשוני",
    concern: "",
    date: null,
    time: null,
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setStep(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const update = (k, v) => setData(d => ({ ...d, [k]: v }));

  const canAdvance = () => {
    if (step === 0) return data.concern.trim().length >= 4;
    if (step === 1) return data.date && data.time;
    if (step === 2) return data.name.trim() && data.phone.trim().length >= 7;
    return true;
  };

  const stepLabels = ["סיבת הפנייה", "בחירת מועד", "פרטים אישיים", "אישור"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: "rgba(28,42,36,0.55)", backdropFilter: "blur(4px)", animation: "fadeIn 200ms ease-out" }}
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-[920px] max-h-[95vh] overflow-hidden flex flex-col md:flex-row"
        style={{ background: "#F5F1EA", borderRadius: 2, animation: "slideUp 260ms cubic-bezier(.2,.8,.2,1)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* רייל ימני */}
        <div className="hidden md:flex md:w-[300px] flex-col justify-between p-8" style={{ background: "#1C2A24", color: "#F5F1EA" }}>
          <div>
            <div className="flex items-center gap-3 mb-10">
              <Enso size={32} color="#F5F1EA" />
              <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20 }}>קרן שריג</div>
            </div>
            <div style={{ fontSize: 11.5, letterSpacing: "0.22em", color: "#B8C5B8" }}>
              קביעת תור
            </div>
            <h3 className="mt-3" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, lineHeight: 1.2, fontWeight: 400 }}>
              ארבע שאלות שקטות. כשלוש דקות.
            </h3>

            <ol className="mt-10 space-y-5">
              {stepLabels.map((label, i) => (
                <li key={label} className="flex items-start gap-3" style={{ opacity: step >= i ? 1 : 0.4 }}>
                  <span
                    className="flex items-center justify-center"
                    style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: step > i ? "#C4634A" : step === i ? "#F5F1EA" : "transparent",
                      color: step > i ? "#F5F1EA" : step === i ? "#1C2A24" : "#B8C5B8",
                      border: step < i ? "1px solid rgba(245,241,234,0.4)" : "none",
                      fontSize: 11, fontWeight: 600, flexShrink: 0, marginTop: 1,
                    }}
                  >
                    {step > i ? <Icon.Check s={12} /> : i + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: 14 }}>{label}</div>
                    {step === i && <div style={{ fontSize: 12, color: "#B8C5B8", marginTop: 2 }}>השלב הנוכחי</div>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div style={{ fontSize: 12.5, color: "#B8C5B8", lineHeight: 1.6 }}>
            יש שאלות? מוזמנים להתקשר:<br />
            <span style={{ color: "#F5F1EA", direction: "ltr", display: "inline-block" }}>050-9031503</span>
          </div>
        </div>

        {/* פאנל שמאל */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-6 md:px-10 pt-6 pb-2">
            <div className="md:hidden" style={{ fontSize: 11.5, letterSpacing: "0.18em", color: "#4A6B5C" }}>
              שלב {step + 1} מתוך 4
            </div>
            <div className="hidden md:block" />
            <button onClick={onClose} className="p-1 hover:opacity-60" aria-label="סגירה">
              <Icon.Close />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-6">
            {step === 0 && <StepConcern data={data} update={update} />}
            {step === 1 && <StepSchedule data={data} update={update} />}
            {step === 2 && <StepDetails data={data} update={update} />}
            {step === 3 && <StepConfirm data={data} />}
          </div>

          {step < 3 && (
            <div className="px-6 md:px-10 py-5 flex items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(28,42,36,0.1)" }}>
              <button
                onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
                className="text-[14px] hover:underline"
                style={{ color: "#4A6B5C" }}
              >
                {step === 0 ? "ביטול" : "→ חזרה"}
              </button>
              <Button
                variant="primary"
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance()}
              >
                {step === 2 ? "אישור התור" : "המשך"} <Icon.ArrowLeft />
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="px-6 md:px-10 py-5 flex items-center justify-end" style={{ borderTop: "1px solid rgba(28,42,36,0.1)" }}>
              <Button variant="primary" onClick={onClose}>סיום</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- שלב 1: סיבת הפנייה ----------
const StepConcern = ({ data, update }) => {
  const treatments = ["ייעוץ ראשוני", "דיקור סיני", "צמחי מרפא", "כוסות רוח", "לא בטוח/ה עדיין"];
  return (
    <div className="py-6">
      <h3 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
        מה הסיבה לפנייה?
      </h3>
      <p className="mt-3 max-w-[520px]" style={{ fontSize: 14.5, lineHeight: 1.7, color: "#2A3D34" }}>
        תיאור קצר מספיק — אנמנזה מלאה נעשית בפגישה הראשונה.
      </p>

      <div className="mt-8">
        <Label>סוג טיפול</Label>
        <div className="flex flex-wrap gap-2 mt-3">
          {treatments.map(t => (
            <button
              key={t}
              onClick={() => update("treatment", t)}
              className="text-[13px] px-4 h-9 transition-all"
              style={{
                background: data.treatment === t ? "#1C2A24" : "transparent",
                color: data.treatment === t ? "#F5F1EA" : "#1C2A24",
                border: data.treatment === t ? "1px solid #1C2A24" : "1px solid rgba(28,42,36,0.2)",
                borderRadius: 2,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Label>הבעיה העיקרית</Label>
        <textarea
          value={data.concern}
          onChange={e => update("concern", e.target.value)}
          placeholder="למשל: כאבי גב תחתון כבר חצי שנה, מחמירים בבוקר…"
          rows={5}
          dir="rtl"
          className="w-full mt-3 p-4 text-[14.5px] outline-none resize-none transition-colors"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(28,42,36,0.2)",
            borderRadius: 2,
            fontFamily: "'Heebo', sans-serif",
            lineHeight: 1.6,
          }}
          onFocus={e => e.target.style.borderColor = "#4A6B5C"}
          onBlur={e => e.target.style.borderColor = "rgba(28,42,36,0.2)"}
        />
      </div>
    </div>
  );
};

// ---------- שלב 2: בחירת מועד ----------
const StepSchedule = ({ data, update }) => {
  const [viewMonth, setViewMonth] = useState(new Date(2026, 3, 1));
  const today = new Date(2026, 3, 20);

  const hebMonths = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
  const monthName = `${hebMonths[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`;
  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isDisabled = (d) => {
    if (!d) return true;
    const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d);
    if (date < today) return true;
    if (date.getDay() === 6) return true; // שבת סגור
    return false;
  };

  const isSelected = (d) => {
    if (!d || !data.date) return false;
    return data.date.getFullYear() === viewMonth.getFullYear()
      && data.date.getMonth() === viewMonth.getMonth()
      && data.date.getDate() === d;
  };

  const slots = {
    בוקר: ["09:00", "09:45", "10:30", "11:15"],
    "אחה״צ": ["13:30", "14:15", "15:00", "15:45", "16:30"],
    ערב: ["17:15", "18:00"],
  };
  const taken = new Set(["09:45", "14:15", "15:45", "17:15"]);

  const hebDays = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"];

  return (
    <div className="py-6">
      <h3 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
        בחירת מועד
      </h3>
      <p className="mt-3" style={{ fontSize: 14.5, lineHeight: 1.7, color: "#2A3D34" }}>
        הפגישה הראשונה נמשכת 75 דקות. תישלח תזכורת ב-SMS יום לפני.
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {/* לוח שנה */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              className="w-8 h-8 flex items-center justify-center hover:bg-[#EBE4D6]"
              style={{ borderRadius: 2 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6 L15 12 L9 18" /></svg>
            </button>
            <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18 }}>{monthName}</div>
            <button
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              className="w-8 h-8 flex items-center justify-center hover:bg-[#EBE4D6]"
              style={{ borderRadius: 2 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6 L9 12 L15 18" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {hebDays.map((d, i) => (
              <div key={i} className="text-center" style={{ fontSize: 11, letterSpacing: "0.1em", color: "#4A6B5C", padding: "6px 0" }}>
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) => {
              const disabled = isDisabled(d);
              const selected = isSelected(d);
              return (
                <button
                  key={i}
                  disabled={disabled}
                  onClick={() => d && update("date", new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d))}
                  className="aspect-square flex items-center justify-center text-[13px] transition-all"
                  style={{
                    background: selected ? "#1C2A24" : "transparent",
                    color: selected ? "#F5F1EA" : disabled ? "rgba(28,42,36,0.25)" : "#1C2A24",
                    cursor: disabled ? "default" : "pointer",
                    borderRadius: 2,
                    fontFamily: "'Frank Ruhl Libre', serif",
                    fontSize: 15,
                  }}
                  onMouseEnter={e => !disabled && !selected && (e.currentTarget.style.background = "#EBE4D6")}
                  onMouseLeave={e => !disabled && !selected && (e.currentTarget.style.background = "transparent")}
                >
                  {d || ""}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-5 flex-wrap" style={{ fontSize: 11.5, color: "#4A6B5C" }}>
            <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, background: "#1C2A24", borderRadius: 2 }} /> נבחר</span>
            <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, background: "#EBE4D6", borderRadius: 2 }} /> פנוי</span>
            <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, border: "1px solid rgba(28,42,36,0.15)", borderRadius: 2 }} /> סגור</span>
          </div>
        </div>

        {/* שעות */}
        <div>
          {!data.date ? (
            <div className="flex items-center justify-center h-full" style={{ minHeight: 260, border: "1px dashed rgba(28,42,36,0.2)", borderRadius: 2 }}>
              <div className="text-center" style={{ color: "#4A6B5C", fontSize: 13.5, maxWidth: 220 }}>
                בחרו תאריך<br />כדי לראות שעות פנויות
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 11.5, letterSpacing: "0.18em", color: "#4A6B5C" }}>
                {["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"][data.date.getDay()]}, {data.date.getDate()} ב{hebMonths[data.date.getMonth()]}
              </div>
              {Object.keys(slots).map(period => (
                <div key={period} className="mt-5">
                  <div style={{ fontSize: 12.5, color: "#4A6B5C", marginBottom: 8 }}>{period}</div>
                  <div className="grid grid-cols-4 gap-2">
                    {slots[period].map(t => {
                      const isTaken = taken.has(t);
                      const selected = data.time === t;
                      return (
                        <button
                          key={t}
                          disabled={isTaken}
                          onClick={() => update("time", t)}
                          className="h-10 text-[13px] transition-all"
                          style={{
                            background: selected ? "#1C2A24" : isTaken ? "transparent" : "#FFFFFF",
                            color: selected ? "#F5F1EA" : isTaken ? "rgba(28,42,36,0.25)" : "#1C2A24",
                            border: `1px solid ${selected ? "#1C2A24" : "rgba(28,42,36,0.15)"}`,
                            textDecoration: isTaken ? "line-through" : "none",
                            cursor: isTaken ? "default" : "pointer",
                            borderRadius: 2,
                            direction: "ltr",
                          }}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- שלב 3: פרטים ----------
const StepDetails = ({ data, update }) => {
  return (
    <div className="py-6">
      <h3 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
        הפרטים שלך
      </h3>
      <p className="mt-3" style={{ fontSize: 14.5, lineHeight: 1.7, color: "#2A3D34" }}>
        נשלח אישור ותזכורת עדינה יום לפני הפגישה.
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        <FormField label="שם מלא" required>
          <input value={data.name} onChange={e => update("name", e.target.value)} className="field-input" placeholder="שם פרטי ושם משפחה" />
        </FormField>
        <FormField label="טלפון" required>
          <input value={data.phone} onChange={e => update("phone", e.target.value)} className="field-input" placeholder="050-0000000" style={{ direction: "ltr", textAlign: "right" }} />
        </FormField>
        <FormField label="אימייל" className="md:col-span-2">
          <input value={data.email} onChange={e => update("email", e.target.value)} className="field-input" placeholder="name@example.com" style={{ direction: "ltr", textAlign: "right" }} />
        </FormField>
        <FormField label="משהו נוסף שכדאי שאדע?" className="md:col-span-2">
          <textarea value={data.notes} onChange={e => update("notes", e.target.value)} rows={3} className="field-input" placeholder="אופציונלי — אלרגיות, ניסיון קודם ברפואה סינית, נגישות…" />
        </FormField>
      </div>

      <div className="mt-8 p-5 flex items-start gap-3" style={{ background: "#EBE4D6", borderRadius: 2 }}>
        <div style={{ color: "#4A6B5C", marginTop: 2 }}>
          <Icon.Check s={18} />
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: "#2A3D34" }}>
          הפרטים נשמרים באבטחה מלאה ואינם מועברים לצד שלישי או לשימושים שיווקיים.
        </div>
      </div>

      <style>{`.field-input{width:100%;background:#FFFFFF;border:1px solid rgba(28,42,36,0.2);border-radius:2px;padding:12px 14px;font-size:14.5px;font-family:'Heebo',sans-serif;line-height:1.6;outline:none;transition:border-color .2s}.field-input:focus{border-color:#4A6B5C}`}</style>
    </div>
  );
};

// ---------- שלב 4: אישור ----------
const StepConfirm = ({ data }) => {
  const hebMonths = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
  const hebDays = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
  const dateStr = data.date
    ? `יום ${hebDays[data.date.getDay()]}, ${data.date.getDate()} ב${hebMonths[data.date.getMonth()]} ${data.date.getFullYear()}`
    : "";
  return (
    <div className="py-10 text-center max-w-[500px] mx-auto">
      <div className="mx-auto flex items-center justify-center" style={{ width: 76, height: 76, borderRadius: "50%", background: "#E8EDDF", color: "#4A6B5C" }}>
        <Icon.Check s={32} />
      </div>
      <h3 className="mt-6" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 34, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
        התור נקבע.
      </h3>
      <p className="mt-3" style={{ fontSize: 14.5, lineHeight: 1.7, color: "#2A3D34" }}>
        אישור נשלח בדקות הקרובות לטלפון <b style={{ direction: "ltr", display: "inline-block" }}>{data.phone || "שלך"}</b>. נשמח לראותך.
      </p>

      <div className="mt-8 text-right p-6" style={{ background: "#FFFFFF", border: "1px solid rgba(28,42,36,0.1)", borderRadius: 2 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div style={{ fontSize: 11.5, letterSpacing: "0.18em", color: "#4A6B5C" }}>
              {data.treatment}
            </div>
            <div className="mt-2" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22 }}>
              {dateStr}
            </div>
            <div className="mt-1 flex items-center gap-2" style={{ fontSize: 14, color: "#2A3D34" }}>
              <Icon.Clock s={14} /> <span style={{ direction: "ltr" }}>{data.time}</span> · 75 דקות
            </div>
          </div>
          <Chop char="約" size={60} rotate={4} />
        </div>
        <div className="mt-5 pt-5" style={{ borderTop: "1px solid rgba(28,42,36,0.1)", fontSize: 13, color: "#4A6B5C", lineHeight: 1.7 }}>
          <div className="flex items-center gap-2"><Icon.Pin s={13} /> מזכרת בתיה · כתובת מדויקת תישלח ב-SMS</div>
          <div className="flex items-center gap-2 mt-1"><Icon.Users s={13} /> עם קרן שריג</div>
        </div>
      </div>
    </div>
  );
};

// ---------- עזרי שדה ----------
const Label = ({ children }) => (
  <div style={{ fontSize: 11.5, letterSpacing: "0.16em", color: "#4A6B5C", fontWeight: 500 }}>
    {children}
  </div>
);

const FormField = ({ label, children, required, className = "" }) => (
  <div className={className}>
    <div className="flex items-center gap-1.5 mb-2">
      <Label>{label}</Label>
      {required && <span style={{ color: "#C4634A", fontSize: 10 }}>*</span>}
    </div>
    {children}
  </div>
);

Object.assign(window, { BookingModal });
