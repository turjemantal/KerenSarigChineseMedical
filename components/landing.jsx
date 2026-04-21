// עמוד נחיתה — קליניקת קרן שריג לרפואה סינית
// מבוסס על התכנים מהאתר הקיים kerensarig.co.il
const Landing = ({ onContact, onOpenDashboard }) => {
  return (
    <div className="w-full" style={{ background: "#F5F1EA", color: "#1C2A24" }}>
      <LandingNav onContact={onContact} />
      <Hero onContact={onContact} />
      <About />
      <Approach />
      <Areas />
      <VideoSection />
      <Stories />
      <ContactSection onContact={onContact} />
      <Footer onOpenDashboard={onOpenDashboard} />
    </div>
  );
};

// ---------- ניווט ----------
const LandingNav = ({ onContact }) => {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "אודות", href: "#about" },
    { label: "הגישה", href: "#approach" },
    { label: "תחומי טיפול", href: "#areas" },
    { label: "המלצות", href: "#stories" },
    { label: "יצירת קשר", href: "#contact" },
  ];
  return (
    <header className="sticky top-0 z-30" style={{ background: "rgba(245,241,234,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(28,42,36,0.08)" }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 h-[76px] flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3">
          <Enso size={36} />
          <div className="leading-none">
            <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, fontWeight: 500, letterSpacing: "-0.01em" }}>
              קרן שריג
            </div>
            <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: 10.5, letterSpacing: "0.2em", color: "#4A6B5C", marginTop: 3 }}>
              רפואה סינית · דיקור
            </div>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-[14.5px] hover:text-[#4A6B5C] transition-colors" style={{ color: "#1C2A24" }}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <a href="tel:+972509031503" className="text-[14px] flex items-center gap-2" style={{ color: "#4A6B5C", direction: "ltr" }}>
            <Icon.Phone s={14} /> 050-9031503
          </a>
          <Button variant="primary" size="sm" onClick={onContact}>יצירת קשר</Button>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="תפריט">
          <Icon.Menu />
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t" style={{ borderColor: "rgba(28,42,36,0.08)" }}>
          <div className="px-6 py-4 flex flex-col gap-4">
            {links.map(l => <a key={l.href} href={l.href} className="text-[15px]" onClick={() => setOpen(false)}>{l.label}</a>)}
            <Button variant="primary" size="sm" onClick={() => { setOpen(false); onContact(); }}>יצירת קשר</Button>
          </div>
        </div>
      )}
    </header>
  );
};

// ---------- Hero ----------
const Hero = ({ onContact }) => {
  return (
    <section id="top" className="relative overflow-hidden" style={{ background: "#F5F1EA" }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-20 md:pb-28 grid md:grid-cols-12 gap-10 items-center relative">
        <div
          aria-hidden="true"
          className="absolute hidden md:block pointer-events-none select-none decorative-char"
          style={{
            top: 40, left: -30, fontFamily: "'Noto Serif SC', serif",
            fontSize: 380, color: "#1C2A24", opacity: 0.04, lineHeight: 1, fontWeight: 600,
          }}
        >
          氣
        </div>

        <div className="md:col-span-7 relative">
          <div className="flex items-center gap-3 mb-8">
            <div style={{ width: 32, height: 1, background: "#4A6B5C" }} />
            <span style={{ fontSize: 11.5, letterSpacing: "0.2em", color: "#4A6B5C", fontWeight: 500 }}>
              רמת השרון · מעל 15 שנות ניסיון
            </span>
          </div>
          <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 400, fontSize: "clamp(40px, 5.6vw, 74px)", lineHeight: 1.08, letterSpacing: "-0.015em", marginBottom: 28 }}>
            קליניקה רב-תחומית<br />
            <em style={{ fontStyle: "normal", color: "#4A6B5C" }}>לדיקור ורפואה משלימה</em><br />
            בשילוב מגע<span style={{ color: "#C4634A" }}>.</span>
          </h1>
          <p className="max-w-[580px]" style={{ fontSize: 17.5, lineHeight: 1.7, color: "#2A3D34" }}>
            אני מאמינה שרק טיפול בראייה הוליסטית, הכולל התייחסות לגוף ולנפש,
            יחולל שינוי אמיתי. התמקדות בחיבור בין מערכות שונות בגוף, שימוש
            בנקודות דיקור ושילוב טכניקות מגוונות — עושים את כל ההבדל.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-10">
            <Button variant="primary" size="lg" onClick={onContact}>
              יצירת קשר <Icon.ArrowLeft />
            </Button>
            <a href="#areas" className="text-[14px] underline underline-offset-4" style={{ color: "#1C2A24" }}>
              לתחומי הטיפול ←
            </a>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-4 mt-14 pt-8" style={{ borderTop: "1px solid rgba(28,42,36,0.12)" }}>
            <Stat k="15+" label="שנות ניסיון" />
            <Stat k="B.A." label="רפואה סינית" />
            <Stat k="מומחית" label="בריאות האישה" />
            <Stat k="ברושים" label="קמפוס · אונ׳ ת״א" />
          </div>
        </div>

        <div className="md:col-span-5 relative">
          <div className="relative">
            <Placeholder label="צילום פורטרט — קרן שריג בחדר הטיפולים, אור טבעי רך" height={580} tone="sage" />
            <div className="absolute -top-6 -right-6 hidden md:block decorative-char">
              <Chop char="氣" size={96} rotate={-6} />
            </div>
            <div className="absolute bottom-6 right-6 left-6" style={{ background: "#F5F1EA", padding: "20px 22px" }}>
              <div className="flex items-center gap-3">
                <Avatar name="קרן שריג" size={44} tone="#4A6B5C" />
                <div className="leading-tight">
                  <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18 }}>קרן שריג</div>
                  <div style={{ fontSize: 12.5, color: "#4A6B5C", marginTop: 3 }}>B.A. ברפואה סינית · מומחית בבריאות האישה</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Stat = ({ k, label }) => (
  <div>
    <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 400, letterSpacing: "-0.01em" }}>{k}</div>
    <div style={{ fontSize: 11.5, letterSpacing: "0.14em", color: "#4A6B5C", marginTop: 4 }}>{label}</div>
  </div>
);

// ---------- אודות ----------
const About = () => {
  return (
    <section id="about" style={{ background: "#EBE4D6" }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-24 grid md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-4">
          <div style={{ fontSize: 11.5, letterSpacing: "0.22em", color: "#4A6B5C" }}>
            — אודות
          </div>
          <h2 className="mt-4" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 400, fontSize: 42, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
            הסיפור שלי, הדרך לכאן.
          </h2>
        </div>
        <div className="md:col-span-8 grid md:grid-cols-2 gap-x-10 gap-y-6" style={{ fontSize: 15.5, lineHeight: 1.75, color: "#2A3D34" }}>
          <p>
            כבר בתחילת דרכי, לפני 15 שנה, החלטתי להתמחות במגוון רחב של טכניקות
            ושיטות מתחומי הרפואה המשלימה. בתום מספר שנות לימוד הוסמכתי
            כרפלקסולוגית בכירה, מטפלת מוסמכת בהילינג ומעסה רפואית שיקומית.
          </p>
          <p>
            המשכתי ללימודי רפואה סינית עתיקה בקמפוס ברושים ליד אוניברסיטת תל
            אביב — ארבע שנים של לימוד לצד סטאז׳ והכשרות רבות. למדתי טכניקות
            טיפול מגוונות: צמחי מרפא, כוסות רוח, מוקסה, הקזות דם, שיאצו ודיקור.
          </p>
          <p>
            בנוסף בחרתי להתמחות בתחום הפריון ובריאות האישה, וכיום אני מטפלת
            מוסמכת בתחום. במסגרת הפרקטיקה שלי עבדתי שנים במרכז גדול לרפואה
            משלימה, צברתי ניסיון עשיר וטיפלתי באוכלוסיות מגוונות.
          </p>
          <p>
            בהמשך נבחרתי לשמש כמאבחנת במרכז, תפקיד מכריע בזיהוי הבעיות
            הבסיסיות ובניית תוכניות טיפול המתאימות לצרכים הספציפיים של כל
            מטופל ומטופלת.
          </p>
        </div>
      </div>
    </section>
  );
};

// ---------- הגישה ----------
const Approach = () => {
  const pillars = [
    {
      n: "01",
      title: "אבחון מדויק",
      body: "אבחון דופק סיני מדויק מסייע לאתר את השורש האמיתי של בעיות בריאותיות ולהבין אילו איברים ומערכות בגוף דורשים טיפול.",
    },
    {
      n: "02",
      title: "תשאול מעמיק",
      body: "לצד האבחון אני מבצעת תשאול ראשוני מקיף על הרגלי תזונה ושינה, פעילות גופנית, בעיות רפואיות ועוד. נקודות הדיקור נבחרות בהתאם לממצאים.",
    },
    {
      n: "03",
      title: "רב-תחומיות",
      body: "שילוב של דיקור, צמחי מרפא, כוסות רוח, מוקסה, הקזות דם, שיאצו והילינג — מאפשר לבנות תוכניות טיפול מקיפות, מדויקות ואפקטיביות במיוחד.",
    },
    {
      n: "04",
      title: "רפואה מונעת",
      body: "הרפואה הסינית מתייחסת לא רק לתסמינים, אלא לגורמים השורשיים. העבודה בכמה ערוצים במקביל מעניקה עומק ומעצימה את סיכויי ההחלמה.",
    },
  ];
  return (
    <section id="approach" style={{ background: "#1C2A24", color: "#F5F1EA" }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="grid md:grid-cols-12 gap-10 mb-16">
          <div className="md:col-span-5">
            <div style={{ fontSize: 11.5, letterSpacing: "0.22em", color: "#B8C5B8" }}>
              — הגישה
            </div>
            <h2 className="mt-4" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 400, fontSize: 50, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              אבחון מדויק, תוכניות טיפול אפקטיביות.
            </h2>
          </div>
          <p className="md:col-span-6 md:col-start-7 self-end" style={{ fontSize: 16.5, lineHeight: 1.75, color: "#D8D0BF" }}>
            ברפואה סינית נדרשת הבנה עמוקה של הדינמיקה בין חמשת האיברים, האנרגיה
            והזרימה בערוצים האנרגטיים (מרידיאנים). אני דוגלת גם ברפואה
            הקונבנציונלית ומאמינה ששילוב בינה לבין הרפואה הסינית נותן מענה מושלם.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-0" style={{ borderTop: "1px solid rgba(245,241,234,0.15)" }}>
          {pillars.map((s, i) => (
            <div key={s.n} className="py-8 md:py-10 pl-6" style={{
              borderBottom: "1px solid rgba(245,241,234,0.15)",
              borderLeft: i < pillars.length - 1 ? "1px solid rgba(245,241,234,0.15)" : "none",
              paddingRight: i === 0 ? 0 : 24,
            }}>
              <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 14, color: "#C4634A", letterSpacing: "0.1em" }}>{s.n}</div>
              <h3 className="mt-3" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, fontWeight: 400 }}>{s.title}</h3>
              <p className="mt-3" style={{ fontSize: 14.5, lineHeight: 1.75, color: "#D8D0BF" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ---------- תחומי טיפול ----------
const Areas = () => {
  const [active, setActive] = useState("women");

  const areas = {
    women: {
      id: "women",
      chinese: "婦",
      tag: "בריאות האישה · פריון ולידה",
      title: "בריאות האישה — פריון ולידה",
      intro: "במסגרת ההכשרה המקצועית שלי למדתי במסלול להתמחות בבריאות האישה והוסמכתי בתחום. אני מטפלת בנשים בהריון ובנשים הסובלות מבעיות הורמונליות, קשיי פריון, מחלות גניקולוגיות ועוד.",
      items: [
        {
          h: "בעיות פריון",
          b: "המרכיבים החשובים ביותר להשגת הריון הם זרע, ביצית, רחם — ונפש. שילוב דיקור בטיפולים קונבנציונליים יכול להגדיל משמעותית את הסיכויים להרות. אחוז גבוה מבעיות הפריון של נשים נובעות ממחזור לא סדיר; הסדרת המחזור מצליחה במקרים רבים לטפל בבעיה. במסגרת הטיפולים אני מבצעת דיקור בערוץ המחבר בין הרחם והלב.",
        },
        {
          h: "טיפול בבעיות הורמונליות",
          b: "איזון הורמונלי שמופר משפיע על כל שלב במעגל חיי האישה — החל מ-PMS, דרך מחזור לא סדיר, אמנוריאה, דיסמנוריאה (כאבי מחזור) ועד תסמונת גיל המעבר. שילוב של דיקור, טכניקות מגע והמלצות תזונה יכול לאזן מאוד את הגוף מבחינה הורמונלית ולעיתים אף להעלים את הסימפטומים.",
        },
        {
          h: "זירוז לידה",
          b: "נשים רבות נאלצות לעבור הליכי זירוז לידה (פיטוצין, בלון) לאחר תאריך הלידה המשוער. דיקור סיני בשילוב מגע הוכח כיעיל מאוד בזירוז לידה ומוכר גם על ידי הרפואה הקונבנציונלית. במקרים רבים, תוך שניים-שלושה טיפולים או פחות, הצורך בהתערבות רפואית נעלם, ולעיתים אף נמנע ניתוח קיסרי.",
        },
        {
          h: "היפוך עובר",
          b: "הרפואה הסינית הוכחה כיעילה בשיטות שמצליחות לגרום לעובר לעבור ממצב עכוז למצג ראש. שבוע ההריון קריטי — ההמלצה היא בין שבוע 32 ל-35. מומלץ להגיע לשני טיפולים צמודים המשלבים מוקסה, דיקור ואיזון הגוף בהתאם לאבחון הדופק. הטיפולים תורמים רבות להגדלת סיכויי ההיפוך הטבעי ולמניעת ניתוח קיסרי.",
        },
        {
          h: "שחלות פוליציסטיות ואנדומטריוזיס",
          b: "הרפואה הסינית מסייעת רבות גם במקרים של שחלות פוליציסטיות ואנדומטריוזיס, בגישה שמטפלת בשורש ולא רק בתסמינים.",
        },
      ],
    },
    skeleton: {
      id: "skeleton",
      chinese: "骨",
      tag: "שלד-שריר",
      title: "טיפול בבעיות שלד-שריר",
      intro: "בין הבעיות הבולטות: בלט דיסק, פריצות דיסק, תסמונת פיריפורמיס, סיאטיקה והקרנות לרגליים, כאבי גב וצוואר, הקרנות לידיים, נימול וחוסר איזון בעמוד השדרה. פתולוגיות נוספות קשורות למערכת העצבים המרכזית — מיגרנות, פיברומיאלגיה ואוסטאופורוזיס.",
      items: [
        {
          h: "שילוב דיקור ומגע",
          b: "טיפול משולב של דיקור ומגע מביא לאיזון בעמוד השדרה. במקרים קיצוניים של כאבים אקוטיים, כשיש דלקות, מומלץ לשלב גם הקזת דם מקומית — דבר שמפחית את הכאב, מביא להקלה מיידית ומאיץ את תהליך הריפוי.",
        },
        {
          h: "שורש הבעיה",
          b: "במקומות שבהם הרפואה המערבית מתקשה להציע דרכי טיפול ומתמקדת בתרופות ובניתוחים, הרפואה המשלימה מטפלת בשורש הבעיה ובמקרים רבים מצליחה לפתור אותה.",
        },
        {
          h: "המלצות נלוות",
          b: "בנוסף לטיפול אני ממליצה על שילוב של פעילות גופנית ותרגילים מעולם היוגה, שמאיצים את תהליכי הריפוי ומסייעים לשמירה על בריאות הגוף לאורך זמן.",
        },
      ],
    },
    breath: {
      id: "breath",
      chinese: "肺",
      tag: "מערכת הנשימה",
      title: "טיפול במערכת הנשימה",
      intro: "מערכת הנשימה קשורה קשר הדוק לאיזון הכללי. הריאות, הלב והכליות נחשבים לאיברי מפתח בראי הרפואה הסינית. החמצן מסייע בהרגעת הנפש, בהזרמת הדם לכל הגוף ובמניעת חסימות.",
      items: [
        {
          h: "תסמינים שכיחים",
          b: "כאשר מערכת הנשימה לא מאוזנת מופיעים סימפטומים כמו קשיי נשימה, שיעול, ליחה, ״צפצופים״, לחץ בחזה וכאבים בצלעות. במקרים חמורים: אסטמה, קוצר נשימה, ברונכיטיס, דלקות ריאות ודלקות גרון.",
        },
        {
          h: "טכניקות טיפול",
          b: "הטיפול כולל שילוב נקודות דיקור של המרידיאנים הקשורים ללב, לריאות ולכליות, לצד טכניקות מגע וכוסות רוח. הכוסות מסייעות לסילוק ליחה מהריאות ותורמות לזרימת דם תקינה.",
        },
        {
          h: "אלרגיות, חרדה ושינה",
          b: "הרפואה הסינית יעילה מאוד גם בטיפול באלרגיה, הקשורה לחיבור בין הכליות לריאות. הטיפול מביא גם להקלה משמעותית בסימפטומים של חרדה ודיכאון, משפר את איכות השינה ותורם לתחושת הרווחה הכללית.",
        },
      ],
    },
    digest: {
      id: "digest",
      chinese: "脾",
      tag: "מערכת העיכול",
      title: "טיפול במערכת העיכול",
      intro: "הרפואה הסינית המסורתית שמה דגש משמעותי על מערכת העיכול כגורם מרכזי בשמירה על הבריאות הכללית. גם הרמב״ם טען שמערכת העיכול היא ״אם כל המחלות״. כאשר מתעוררות בעיות בריאותיות — צריך לבדוק קודם את מערכת העיכול ולוודא שהיא מסננת את הרעלים מהגוף.",
      items: [
        {
          h: "פתולוגיות כרוניות",
          b: "הרפואה הסינית מציעה דרכי טיפול יעילות במיוחד בקרוהן, מעי רגיז ודלקות בוושט ובקיבה. שילוב של טיפול עם המלצות לתזונה מאוזנת ושתייה מרובה של מים משפר ומעלים גם תסמינים רבים.",
        },
        {
          h: "תסמינים יומיומיים",
          b: "עצירות, שלשולים, כאבי בטן ונפיחות בטנית שנובעים ממערכת עיכול לא מאוזנת — נעלמים לאחר מספר טיפולים.",
        },
        {
          h: "השפעה על מערכות אחרות",
          b: "עצירות עשויה להשפיע גם על מערכות אחרות בגוף — דוגמה שכיחה היא כאבי גב חזקים ומיגרנות. כאשר הבעיה במערכת העיכול נפתרת, נעלמים באופן טבעי גם הסימפטומים שהתעוררו.",
        },
      ],
    },
  };

  const list = Object.values(areas);
  const current = areas[active];

  return (
    <section id="areas" className="py-24 md:py-32">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div className="max-w-[640px]">
            <div style={{ fontSize: 11.5, letterSpacing: "0.22em", color: "#4A6B5C" }}>
              — תחומי טיפול
            </div>
            <h2 className="mt-4" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 400, fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              ארבעה תחומים עיקריים.
            </h2>
          </div>
          <p className="max-w-[420px]" style={{ fontSize: 15, lineHeight: 1.7, color: "#2A3D34" }}>
            לרוב משלבים בטיפול מספר תחומים יחד — הגישה רב-תחומית מאפשרת מענה
            מקיף ומדויק יותר.
          </p>
        </div>

        {/* לשוניות */}
        <div className="flex flex-wrap gap-2 mb-10" role="tablist">
          {list.map(a => (
            <button
              key={a.id}
              role="tab"
              aria-selected={active === a.id}
              onClick={() => setActive(a.id)}
              className="flex items-center gap-3 px-5 py-3 transition-all"
              style={{
                background: active === a.id ? "#1C2A24" : "#FFFFFF",
                color: active === a.id ? "#F5F1EA" : "#1C2A24",
                border: `1px solid ${active === a.id ? "#1C2A24" : "rgba(28,42,36,0.15)"}`,
                borderRadius: 2,
              }}
            >
              <span className="decorative-char" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 18, opacity: 0.6 }}>
                {a.chinese}
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 500 }}>{a.tag}</span>
            </button>
          ))}
        </div>

        {/* תוכן פעיל */}
        <div key={current.id} className="view-enter grid md:grid-cols-12 gap-10" style={{ background: "#FFFFFF", border: "1px solid rgba(28,42,36,0.1)", borderRadius: 2 }}>
          <div className="md:col-span-5 p-8 md:p-10 relative" style={{ background: "#1C2A24", color: "#F5F1EA", borderRadius: 2 }}>
            <div className="decorative-char absolute top-6 left-6" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 140, lineHeight: 1, opacity: 0.12 }}>
              {current.chinese}
            </div>
            <div style={{ fontSize: 11.5, letterSpacing: "0.22em", color: "#B8C5B8", position: "relative" }}>
              {current.tag}
            </div>
            <h3 className="mt-4" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 400, lineHeight: 1.15, position: "relative" }}>
              {current.title}
            </h3>
            <p className="mt-5" style={{ fontSize: 15, lineHeight: 1.75, color: "#D8D0BF", position: "relative" }}>
              {current.intro}
            </p>
          </div>

          <div className="md:col-span-7 p-8 md:p-10 flex flex-col">
            {current.items.map((it, i) => (
              <div key={i} className="py-5" style={{ borderBottom: i < current.items.length - 1 ? "1px solid rgba(28,42,36,0.08)" : "none" }}>
                <h4 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 19, fontWeight: 500, color: "#1C2A24" }}>
                  <span style={{ color: "#C4634A", marginLeft: 8 }}>·</span>{it.h}
                </h4>
                <p className="mt-2" style={{ fontSize: 14.5, lineHeight: 1.75, color: "#2A3D34" }}>
                  {it.b}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ---------- וידאו (YouTube) ----------
const VideoSection = () => {
  const [playing, setPlaying] = useState(false);
  const videoId = "wPv31bJWsAw";
  return (
    <section style={{ background: "#EBE4D6" }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-24 md:py-28">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5">
            <div style={{ fontSize: 11.5, letterSpacing: "0.22em", color: "#4A6B5C" }}>
              — הכירו את קרן
            </div>
            <h2 className="mt-4" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 400, fontSize: 44, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              מילה אישית על הגישה.
            </h2>
            <p className="mt-5" style={{ fontSize: 15.5, lineHeight: 1.75, color: "#2A3D34" }}>
              שיחה פתוחה על הגישה, על הכלים של הרפואה הסינית ועל מה שמייחד
              את העבודה בקליניקה. ההמלצה החמה: לצפות עם כוס תה חם ברקע.
            </p>
          </div>
          <div className="md:col-span-7">
            <div
              className="relative w-full overflow-hidden group"
              style={{ aspectRatio: "16/9", background: "#1C2A24", borderRadius: 2 }}
            >
              {!playing ? (
                <button
                  className="absolute inset-0 w-full h-full"
                  onClick={() => setPlaying(true)}
                  aria-label="ניגון הסרטון"
                >
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; }}
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(28,42,36,0.15), rgba(28,42,36,0.4))" }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{
                        width: 92, height: 92, borderRadius: "50%",
                        background: "rgba(245,241,234,0.95)",
                        boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
                      }}
                    >
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="#1C2A24" style={{ marginRight: 3 }}>
                        <path d="M8 5 L8 19 L20 12 Z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-5 right-5 px-3 py-1.5 flex items-center gap-2" style={{ background: "rgba(28,42,36,0.85)", color: "#F5F1EA", fontSize: 12, borderRadius: 2 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z"/></svg>
                    YouTube
                  </div>
                </button>
              ) : (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title="קרן שריג — רפואה סינית"
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ---------- מטופלות משתפות (ממתין לתוכן אמיתי) ----------
const Stories = () => {
  return (
    <section id="stories" style={{ background: "#F5F1EA" }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="grid md:grid-cols-12 gap-10 mb-12">
          <div className="md:col-span-7">
            <div style={{ fontSize: 11.5, letterSpacing: "0.22em", color: "#4A6B5C" }}>
              — מטופלות משתפות
            </div>
            <h2 className="mt-4" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 400, fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              מטופלות משתפות.
            </h2>
          </div>
        </div>

        <div
          className="flex items-center justify-center text-center p-10"
          style={{
            minHeight: 220,
            background: "#FFFFFF",
            border: "1px dashed rgba(28,42,36,0.25)",
            borderRadius: 2,
          }}
        >
          <div style={{ maxWidth: 520 }}>
            <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, color: "#1C2A24" }}>
              מקום להמלצות אמיתיות
            </div>
            <div className="mt-2" style={{ fontSize: 14, color: "#4A6B5C", lineHeight: 1.7 }}>
              אשמח לקבל ממך את הטקסטים והצילומים של ההמלצות — ונשבץ כאן.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ---------- יצירת קשר ----------
const ContactSection = ({ onContact }) => {
  return (
    <section id="contact" style={{ background: "#4A6B5C", color: "#F5F1EA" }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-20 md:py-24 grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7">
          <div style={{ fontSize: 11.5, letterSpacing: "0.22em", color: "#B8C5B8" }}>
            — להזמנת טיפול
          </div>
          <h2 className="mt-4" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 400, fontSize: "clamp(36px, 4.5vw, 60px)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            מתחילים בשיחה קצרה.
          </h2>
          <p className="mt-5 max-w-[560px]" style={{ fontSize: 16, lineHeight: 1.75, color: "#DCE4DF" }}>
            אשמח להקשיב, לענות על שאלות ולעזור להבין אם זה הטיפול המתאים עבורך.
            אפשר להשאיר פרטים ואחזור אליך, או להתקשר ישירות.
          </p>
        </div>
        <div className="md:col-span-5 flex flex-col gap-3">
          <Button variant="seal" size="lg" onClick={onContact} className="w-full">
            השארת פרטים <Icon.ArrowLeft />
          </Button>
          <a href="tel:+972509031503" className="flex items-center justify-center gap-2 text-[14.5px] h-11" style={{ border: "1px solid rgba(245,241,234,0.3)", borderRadius: 2 }}>
            <Icon.Phone s={14} /> <span style={{ direction: "ltr" }}>050-9031503</span>
          </a>
          <a href="https://wa.me/972509031503" target="_blank" rel="noopener" className="flex items-center justify-center gap-2 text-[14.5px] h-11" style={{ border: "1px solid rgba(245,241,234,0.3)", borderRadius: 2 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 20 L5.5 15.5 C 4.5 14, 4 12, 4 10 A 8 8 0 1 1 12 18 C 10 18, 8 17.5, 6.5 16.5 Z" /></svg>
            וואטסאפ
          </a>
        </div>
      </div>
    </section>
  );
};

// ---------- פוטר ----------
const Footer = ({ onOpenDashboard }) => {
  return (
    <footer style={{ background: "#1C2A24", color: "#D8D0BF" }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-16">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <Enso size={38} color="#F5F1EA" />
              <div className="leading-none">
                <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 24, color: "#F5F1EA" }}>קרן שריג</div>
                <div style={{ fontSize: 10.5, letterSpacing: "0.2em", color: "#B8C5B8", marginTop: 4 }}>רפואה סינית · דיקור</div>
              </div>
            </div>
            <p className="mt-6 max-w-[380px]" style={{ fontSize: 14.5, lineHeight: 1.75 }}>
              קליניקה רב-תחומית לדיקור ורפואה משלימה בשילוב מגע. ברמת השרון.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="https://www.instagram.com/kerensarig11/" target="_blank" rel="noopener" aria-label="אינסטגרם" className="flex items-center justify-center hover:text-[#F5F1EA]" style={{ width: 40, height: 40, border: "1px solid rgba(245,241,234,0.2)", borderRadius: "50%" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
              </a>
              <a href="https://www.facebook.com/kerensarighealth" target="_blank" rel="noopener" aria-label="פייסבוק" className="flex items-center justify-center hover:text-[#F5F1EA]" style={{ width: 40, height: 40, border: "1px solid rgba(245,241,234,0.2)", borderRadius: "50%" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 8 L14 5 C 14 4, 14.5 3.5, 15.5 3.5 L18 3.5 L18 7 L15.5 7 L15.5 8 L18 8 L17.5 11 L15.5 11 L15.5 20 L13 20 L13 11 L11 11 L11 8 Z" fill="currentColor" /></svg>
              </a>
              <a href="https://wa.me/972509031503" target="_blank" rel="noopener" aria-label="וואטסאפ" className="flex items-center justify-center hover:text-[#F5F1EA]" style={{ width: 40, height: 40, border: "1px solid rgba(245,241,234,0.2)", borderRadius: "50%" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 20 L5.5 15.5 C 4.5 14, 4 12, 4 10 A 8 8 0 1 1 12 18 C 10 18, 8 17.5, 6.5 16.5 Z" /></svg>
              </a>
              <a href="mailto:karintip1@gmail.com" aria-label="אימייל" className="flex items-center justify-center hover:text-[#F5F1EA]" style={{ width: 40, height: 40, border: "1px solid rgba(245,241,234,0.2)", borderRadius: "50%" }}>
                <Icon.Mail s={15} />
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <div style={{ fontSize: 11.5, letterSpacing: "0.18em", color: "#B8C5B8" }}>יצירת קשר</div>
            <div className="mt-4 space-y-1" style={{ fontSize: 14.5, lineHeight: 1.7 }}>
              <div>רמת השרון</div>
              <div className="mt-3 flex items-center gap-2" style={{ direction: "ltr", justifyContent: "flex-end" }}><Icon.Phone s={13} /> 050-9031503</div>
              <div className="flex items-center gap-2"><Icon.Mail s={13} /> karintip1@gmail.com</div>
            </div>
          </div>

          <div className="md:col-span-4">
            <div style={{ fontSize: 11.5, letterSpacing: "0.18em", color: "#B8C5B8" }}>ניווט מהיר</div>
            <div className="mt-4 grid grid-cols-2 gap-2" style={{ fontSize: 14.5 }}>
              <a href="#about" className="hover:text-[#F5F1EA]">אודות</a>
              <a href="#approach" className="hover:text-[#F5F1EA]">הגישה</a>
              <a href="#areas" className="hover:text-[#F5F1EA]">תחומי טיפול</a>
              <a href="#stories" className="hover:text-[#F5F1EA]">המלצות</a>
              <a href="#contact" className="hover:text-[#F5F1EA]">יצירת קשר</a>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 flex flex-wrap items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(245,241,234,0.15)", fontSize: 12, color: "#B8C5B8" }}>
          <div>© 2026 קרן שריג · רפואה סינית · כל הזכויות שמורות</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#F5F1EA]">הצהרת נגישות</a>
            <a href="#" className="hover:text-[#F5F1EA]">הצהרת פרטיות</a>
            <button onClick={onOpenDashboard} className="hover:text-[#F5F1EA] underline underline-offset-4">
              ← כניסת מטפלת
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

Object.assign(window, { Landing });
