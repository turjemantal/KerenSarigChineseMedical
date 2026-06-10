import { Enso } from './shared'
import { Icon } from './icons'
import { CLINIC_CONTACT } from '../constants'

// Legal pages required by Israeli law:
// - Accessibility statement — תקנה 35 לתקנות שוויון זכויות לאנשים עם מוגבלות
//   (התאמות נגישות לשירות), תשע"ג-2013, לפי ת"י 5568 (WCAG ברמה AA)
// - Privacy policy — חוק הגנת הפרטיות, התשמ"א-1981, כולל תיקון 13 (בתוקף מ-14.08.2025)

const LAST_UPDATED = '11 ביוני 2026'

function LegalLayout({ title, children, onBack }: { title: string; children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="min-h-screen" style={{ background: '#F5F1EA', color: '#1C2A24' }}>
      <header className="sticky top-0 z-10 px-6 md:px-12 py-5 flex items-center justify-between" style={{ background: '#F5F1EA', borderBottom: '1px solid rgba(28,42,36,0.1)' }}>
        <button onClick={onBack} className="flex items-center gap-3" aria-label="חזרה לדף הבית">
          <Enso size={30} />
          <div className="text-right">
            <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20 }}>קרן שריג</div>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', color: '#4A6B5C' }}>רפואה סינית · דיקור</div>
          </div>
        </button>
        <button onClick={onBack} className="text-[13px] hover:underline flex items-center gap-2" style={{ color: '#4A6B5C' }}>
          לדף הבית <Icon.ArrowLeft s={13} />
        </button>
      </header>
      <main className="max-w-[760px] mx-auto px-6 py-12 md:py-16">
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: 400, lineHeight: 1.15 }}>{title}</h1>
        <div className="mt-2 mb-10" style={{ fontSize: 12.5, color: '#4A6B5C' }}>עודכן לאחרונה: {LAST_UPDATED}</div>
        <div className="space-y-8" style={{ fontSize: 15, lineHeight: 1.8, color: '#2A3D34' }}>{children}</div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, fontWeight: 500, marginBottom: 8 }}>{title}</h2>
      {children}
    </section>
  )
}

function ContactDetails() {
  return (
    <ul className="list-disc pr-5 space-y-1">
      <li>טלפון: <span style={{ direction: 'ltr', display: 'inline-block' }}>{CLINIC_CONTACT.phone}</span></li>
      <li>דוא״ל: {CLINIC_CONTACT.email}</li>
      <li>כתובת: {CLINIC_CONTACT.address}</li>
    </ul>
  )
}

// ── הצהרת נגישות ────────────────────────────────────────────────────────────
export function AccessibilityStatement({ onBack }: { onBack: () => void }) {
  return (
    <LegalLayout title="הצהרת נגישות" onBack={onBack}>
      <Section title="מחויבות לנגישות">
        <p>
          קליניקת קרן שריג רואה חשיבות רבה במתן שירות שוויוני ונגיש לכלל הציבור, לרבות אנשים עם
          מוגבלות, ופועלת להנגשת האתר בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות
          לשירות), תשע״ג-2013, ולתקן הישראלי ת״י 5568 המבוסס על הנחיות WCAG ברמה AA.
        </p>
      </Section>
      <Section title="התאמות הנגישות באתר">
        <ul className="list-disc pr-5 space-y-1">
          <li>האתר מותאם לגלישה ממחשב ומהטלפון הנייד (עיצוב רספונסיבי).</li>
          <li>ניתן לנווט באתר באמצעות המקלדת.</li>
          <li>מבנה הדפים סמנטי וכולל כותרות מדורגות ותיאורי כפתורים (aria-labels).</li>
          <li>ניגודיות צבעים העומדת בדרישות התקן בטקסטים המרכזיים.</li>
          <li>הטפסים באתר כוללים תוויות ברורות והודעות שגיאה מפורטות.</li>
          <li>האתר תומך בהגדלת תצוגה באמצעות הדפדפן ללא פגיעה בתוכן.</li>
        </ul>
      </Section>
      <Section title="הנגשת הקליניקה">
        <p>
          הקליניקה ממוקמת ב{CLINIC_CONTACT.address}. לפרטים על נגישות המבנה (חניה, מעלית וכניסה
          נגישה) ניתן לפנות אלינו מראש ונשמח לסייע בתיאום הגעה נוחה.
        </p>
      </Section>
      <Section title="נתקלתם בבעיה? ספרו לנו">
        <p>
          אנו פועלים לשפר את נגישות האתר באופן שוטף. אם נתקלתם ברכיב שאינו נגיש או בכל קושי אחר,
          נשמח שתפנו אלינו ונטפל בכך בהקדם:
        </p>
        <ContactDetails />
      </Section>
    </LegalLayout>
  )
}

// ── מדיניות פרטיות ──────────────────────────────────────────────────────────
export function PrivacyPolicy({ onBack }: { onBack: () => void }) {
  return (
    <LegalLayout title="מדיניות פרטיות" onBack={onBack}>
      <Section title="כללי">
        <p>
          מדיניות זו מפרטת כיצד קליניקת קרן שריג (להלן: ״הקליניקה״) אוספת, שומרת ומשתמשת במידע
          אישי הנמסר באתר, בהתאם לחוק הגנת הפרטיות, התשמ״א-1981, על תיקוניו (לרבות תיקון 13).
          השימוש באתר ומסירת פרטים בטפסים מהווים הסכמה למדיניות זו. לא חלה עליך חובה חוקית
          למסור מידע — מסירתו תלויה ברצונך, אך היא נדרשת לצורך קביעת תור או יצירת קשר.
        </p>
      </Section>
      <Section title="איזה מידע נאסף">
        <ul className="list-disc pr-5 space-y-1">
          <li>פרטי זיהוי וקשר: שם מלא, מספר טלפון ודוא״ל (אם נמסר).</li>
          <li>מידע שנמסר ביוזמתך לגבי סיבת הפנייה או מצב בריאותי — מידע זה הוא מידע רגיש ומטופל בהתאם.</li>
          <li>פרטי תורים: מועדים, סטטוס והערות הקשורות לטיפול.</li>
        </ul>
      </Section>
      <Section title="מטרות השימוש במידע">
        <ul className="list-disc pr-5 space-y-1">
          <li>קביעת תורים, ניהולם ושליחת אישורים ותזכורות בהודעות SMS או וואטסאפ.</li>
          <li>אימות זהות באמצעות קוד חד-פעמי (OTP) הנשלח לטלפון.</li>
          <li>מענה לפניות ומתן שירות רפואי משלים מותאם.</li>
        </ul>
        <p className="mt-2">המידע אינו נמכר ואינו מועבר לצדדים שלישיים למטרות שיווק.</p>
      </Section>
      <Section title="שמירת המידע ואבטחתו">
        <p>
          המידע נשמר במאגד נתונים מאובטח בענן, והגישה אליו מוגבלת ומוגנת בסיסמה ובהצפנת תעבורה
          (HTTPS). שירותי משלוח ההודעות (כגון Twilio או WhatsApp) מקבלים את מספר הטלפון ותוכן
          ההודעה לצורך השליחה בלבד, בהתאם למדיניות הפרטיות שלהם. הקליניקה מיישמת אמצעי אבטחה
          בהתאם לתקנות הגנת הפרטיות (אבטחת מידע), התשע״ז-2017.
        </p>
      </Section>
      <Section title="Cookies ואחסון מקומי">
        <p>
          האתר עושה שימוש באחסון מקומי בדפדפן (Local Storage) לצורך שמירת חיבור מאומת לאזור
          האישי בלבד. האתר אינו עושה שימוש בעוגיות פרסום או מעקב.
        </p>
      </Section>
      <Section title="זכויותיך">
        <p>
          בהתאם לחוק הגנת הפרטיות, עומדת לך זכות לעיין במידע שנשמר עליך, לבקש את תיקונו או את
          מחיקתו. לבקשות בנושא ניתן לפנות אלינו:
        </p>
        <ContactDetails />
      </Section>
      <Section title="שינויים במדיניות">
        <p>
          הקליניקה רשאית לעדכן מדיניות זו מעת לעת. הנוסח המחייב הוא הנוסח המפורסם בעמוד זה,
          ותאריך העדכון האחרון מופיע בראשו.
        </p>
      </Section>
    </LegalLayout>
  )
}
