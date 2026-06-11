import { useState, useRef } from 'react'
import { Enso, Button, Avatar } from './shared'
import { Icon } from './icons'
import { AREAS, TESTIMONIAL_VIDEOS } from '../data'
import { SOCIAL_LINKS, CLINIC_CONTACT } from '../constants'

function SocialIconLink({ id, label, href, icon, size = 34, plain = false }: { id: string; label: string; href: string; icon: string; size?: number; plain?: boolean }) {
  const Ico = (Icon as Record<string, React.ComponentType<{ s?: number }>>)[icon]
  return (
    <a key={id} href={href} target="_blank" rel="noopener" aria-label={label} title={label}
      className="flex items-center justify-center transition-all duration-200 hover:text-[#C4634A] hover:scale-110"
      style={{
        width: size, height: size, color: '#4A6B5C',
        border: plain ? 'none' : '1px solid rgba(28,42,36,0.15)',
        borderRadius: '50%',
      }}>
      {Ico && <Ico s={plain ? size * 0.6 : size * 0.45} />}
    </a>
  )
}

const NavDivider = () => <span aria-hidden style={{ width: 1, height: 22, background: 'rgba(28,42,36,0.12)' }} />

export default function Landing({ onBook, onContact, onPortal, isLoggedIn }: { onBook: () => void; onContact: () => void; onPortal: () => void; isLoggedIn: boolean }) {
  return (
    <div className="w-full" style={{ background: '#F5F1EA', color: '#1C2A24' }}>
      <LandingNav onBook={onBook} onContact={onContact} onPortal={onPortal} isLoggedIn={isLoggedIn} />
      <Hero onBook={onBook} onContact={onContact} />
      <About />
      <Approach />
      <Areas />
      <Stories />
      <ContactSection onBook={onBook} onContact={onContact} />
      <Footer />
    </div>
  )
}

// ---------- ניווט ----------
function LandingNav({ onBook, onContact, onPortal, isLoggedIn }: { onBook: () => void; onContact: () => void; onPortal: () => void; isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)
  const links = [
    { label: 'אודות', href: '#about' },
    { label: 'הגישה', href: '#approach' },
    { label: 'תחומי טיפול', href: '#areas' },
    { label: 'המלצות', href: '#stories' },
    { label: 'יצירת קשר', href: '#contact' },
  ]
  return (
    <header className="sticky top-0 z-30" style={{ background: 'rgba(245,241,234,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(28,42,36,0.08)' }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 h-[76px] flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3">
          <Enso size={36} />
          <div className="leading-none">
            <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>קרן שריג</div>
            <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: 10.5, letterSpacing: '0.2em', color: '#4A6B5C', marginTop: 3 }}>רפואה סינית · דיקור</div>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-[14.5px] hover:text-[#4A6B5C] transition-colors" style={{ color: '#1C2A24' }}>{l.label}</a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map(s => (
              <SocialIconLink key={s.id} {...s} size={38} />
            ))}
          </div>
          <NavDivider />
          <a href={`tel:${CLINIC_CONTACT.phoneIntl}`}
            className="text-[14px] flex items-center gap-2 transition-colors hover:text-[#1C2A24]"
            style={{ color: '#4A6B5C', direction: 'ltr', whiteSpace: 'nowrap' }}>
            <Icon.Phone s={14} /> {CLINIC_CONTACT.phone}
          </a>
          <NavDivider />
          <div className="flex items-center gap-2">
            <Button variant={isLoggedIn ? 'moss' : 'ghost'} size="sm" pill onClick={onPortal}>האזור האישי</Button>
            <Button variant="ghost" size="sm" pill onClick={onContact}>יצירת קשר</Button>
            <Button variant="primary" size="sm" pill onClick={onBook}>קביעת תור</Button>
          </div>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="תפריט"><Icon.Menu /></button>
      </div>
      {open && (
        <div className="md:hidden border-t" style={{ borderColor: 'rgba(28,42,36,0.08)' }}>
          <div className="px-6 py-4 flex flex-col gap-4">
            {links.map(l => <a key={l.href} href={l.href} className="text-[15px]" onClick={() => setOpen(false)}>{l.label}</a>)}
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" pill onClick={() => { setOpen(false); onContact() }} className="flex-1">יצירת קשר</Button>
              <Button variant="primary" size="sm" pill onClick={() => { setOpen(false); onBook() }} className="flex-1">קביעת תור</Button>
            </div>
            <Button variant={isLoggedIn ? 'moss' : 'ghost'} size="sm" pill onClick={() => { setOpen(false); onPortal() }} className="w-full">האזור האישי</Button>
            <div className="flex items-center justify-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(28,42,36,0.08)' }}>
              {SOCIAL_LINKS.map(s => (
                <SocialIconLink key={s.id} {...s} size={40} />
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

// ---------- Hero ----------
function Hero({ onBook, onContact }: { onBook: () => void; onContact: () => void }) {
  const [playing, setPlaying] = useState(false)
  const videoId = 'wPv31bJWsAw'
  return (
    <section id="top" style={{ background: '#F5F1EA' }}>
      {/* text row */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-10 md:pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div style={{ width: 32, height: 1, background: '#4A6B5C' }} />
          <span style={{ fontSize: 11.5, letterSpacing: '0.2em', color: '#4A6B5C', fontWeight: 500 }}>רמת השרון · מעל 15 שנות ניסיון</span>
        </div>
        <div className="grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7">
            <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 400, fontSize: 'clamp(40px, 5.6vw, 74px)', lineHeight: 1.08, letterSpacing: '-0.015em', marginBottom: 24 }}>
              קליניקה רב-תחומית<br />
              <em style={{ fontStyle: 'normal', color: '#4A6B5C' }}>לדיקור ורפואה משלימה</em><br />
              בשילוב מגע<span style={{ color: '#C4634A' }}>.</span>
            </h1>
            <p style={{ fontSize: 17.5, lineHeight: 1.7, color: '#2A3D34', maxWidth: 560 }}>
              אני מאמינה שרק טיפול בראייה הוליסטית, הכולל התייחסות לגוף ולנפש, יחולל שינוי אמיתי.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <Button variant="primary" size="lg" pill onClick={onBook}>קביעת תור <Icon.ArrowLeft /></Button>
              <Button variant="ghost" size="lg" pill onClick={onContact}>יצירת קשר</Button>
            </div>
          </div>
          <div className="md:col-span-5 flex flex-wrap gap-x-10 gap-y-4 md:pb-2">
            {[['15+', 'שנות ניסיון'], ['B.A.', 'רפואה סינית'], ['מומחית', 'בריאות האישה'], ['ברושים', 'קמפוס · אונ׳ ת״א']].map(([k, label]) => (
              <div key={label}>
                <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 400 }}>{k}</div>
                <div style={{ fontSize: 11.5, letterSpacing: '0.14em', color: '#4A6B5C', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* full-width video */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 pb-20 md:pb-28">
        <div className="relative w-full overflow-hidden group" style={{ aspectRatio: '16/9', background: '#1C2A24', borderRadius: 2 }}>
          {!playing ? (
            <button className="absolute inset-0 w-full h-full" onClick={() => setPlaying(true)} aria-label="ניגון הסרטון">
              <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} alt="" className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(28,42,36,0.05), rgba(28,42,36,0.4))' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center justify-center transition-transform group-hover:scale-110" style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(245,241,234,0.95)', boxShadow: '0 16px 48px rgba(0,0,0,0.35)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#1C2A24" style={{ marginRight: 4 }}><path d="M8 5 L8 19 L20 12 Z" /></svg>
                </div>
              </div>
              <div className="absolute bottom-6 right-6 left-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name="קרן שריג" size={38} tone="#4A6B5C" />
                  <div className="leading-tight text-right">
                    <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 16, color: '#F5F1EA' }}>קרן שריג</div>
                    <div style={{ fontSize: 12, color: 'rgba(245,241,234,0.7)', marginTop: 1 }}>B.A. ברפואה סינית</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, letterSpacing: '0.16em', color: 'rgba(245,241,234,0.7)' }}>מילה אישית על הגישה —</div>
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
    </section>
  )
}

// ---------- אודות ----------
function About() {
  return (
    <section id="about" style={{ background: '#EBE4D6' }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-24 grid md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-4">
          <div style={{ fontSize: 11.5, letterSpacing: '0.22em', color: '#4A6B5C' }}>— אודות</div>
          <h2 className="mt-4" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 400, fontSize: 42, lineHeight: 1.15, letterSpacing: '-0.01em' }}>הסיפור שלי, הדרך לכאן.</h2>
        </div>
        <div className="md:col-span-8 grid md:grid-cols-2 gap-x-10 gap-y-6" style={{ fontSize: 15.5, lineHeight: 1.75, color: '#2A3D34' }}>
          <p>כבר בתחילת דרכי, לפני 15 שנה, החלטתי להתמחות במגוון רחב של טכניקות ושיטות מתחומי הרפואה המשלימה. בתום מספר שנות לימוד הוסמכתי כרפלקסולוגית בכירה, מטפלת מוסמכת בהילינג ומעסה רפואית שיקומית.</p>
          <p>המשכתי ללימודי רפואה סינית עתיקה בקמפוס ברושים ליד אוניברסיטת תל אביב — ארבע שנים של לימוד לצד סטאז׳ והכשרות רבות. למדתי טכניקות טיפול מגוונות: צמחי מרפא, כוסות רוח, מוקסה, הקזות דם, שיאצו ודיקור.</p>
          <p>בנוסף בחרתי להתמחות בתחום הפריון ובריאות האישה, וכיום אני מטפלת מוסמכת בתחום.</p>
          <p>בהמשך נבחרתי לשמש כמאבחנת במרכז, תפקיד מכריע בזיהוי הבעיות הבסיסיות ובניית תוכניות טיפול המתאימות לצרכים הספציפיים של כל מטופל ומטופלת.</p>
        </div>
      </div>
    </section>
  )
}

// ---------- הגישה ----------
function Approach() {
  const pillars = [
    { n: '01', title: 'אבחון מדויק', body: 'אבחון דופק סיני מדויק מסייע לאתר את השורש האמיתי של בעיות בריאותיות ולהבין אילו איברים ומערכות בגוף דורשים טיפול.' },
    { n: '02', title: 'תשאול מעמיק', body: 'לצד האבחון אני מבצעת תשאול ראשוני מקיף על הרגלי תזונה ושינה, פעילות גופנית, בעיות רפואיות ועוד.' },
    { n: '03', title: 'רב-תחומיות', body: 'שילוב של דיקור, צמחי מרפא, כוסות רוח, מוקסה, הקזות דם, שיאצו והילינג — מאפשר לבנות תוכניות טיפול מקיפות ואפקטיביות במיוחד.' },
    { n: '04', title: 'רפואה מונעת', body: 'הרפואה הסינית מתייחסת לא רק לתסמינים, אלא לגורמים השורשיים. העבודה בכמה ערוצים במקביל מעניקה עומק ומעצימה את סיכויי ההחלמה.' },
  ]
  return (
    <section id="approach" style={{ background: '#1C2A24', color: '#F5F1EA' }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="grid md:grid-cols-12 gap-10 mb-16">
          <div className="md:col-span-5">
            <div style={{ fontSize: 11.5, letterSpacing: '0.22em', color: '#B8C5B8' }}>— הגישה</div>
            <h2 className="mt-4" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 400, fontSize: 50, lineHeight: 1.1, letterSpacing: '-0.02em' }}>אבחון מדויק, תוכניות טיפול אפקטיביות.</h2>
          </div>
          <p className="md:col-span-6 md:col-start-7 self-end" style={{ fontSize: 16.5, lineHeight: 1.75, color: '#D8D0BF' }}>
            ברפואה סינית נדרשת הבנה עמוקה של הדינמיקה בין חמשת האיברים, האנרגיה והזרימה בערוצים האנרגטיים (מרידיאנים).
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-0" style={{ borderTop: '1px solid rgba(245,241,234,0.15)' }}>
          {pillars.map((s, i) => (
            <div key={s.n} className="py-8 md:py-10 md:pl-6" style={{
              borderBottom: '1px solid rgba(245,241,234,0.15)',
              borderLeft: i < pillars.length - 1 ? '1px solid rgba(245,241,234,0.15)' : 'none',
            }}>
              <div className={i === 0 ? '' : 'md:pr-6'}>
                <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 14, color: '#C4634A', letterSpacing: '0.1em' }}>{s.n}</div>
                <h3 className="mt-3" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, fontWeight: 400 }}>{s.title}</h3>
                <p className="mt-3" style={{ fontSize: 14.5, lineHeight: 1.75, color: '#D8D0BF' }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* המרקחת הסינית — צמחי מרפא ופטריות מרפא */}
        <div className="mt-12 md:mt-16 grid md:grid-cols-12 gap-6 md:gap-8 items-center p-7 md:p-10" style={{ border: '1px solid rgba(245,241,234,0.18)', borderRadius: 2, background: 'rgba(245,241,234,0.03)' }}>
          <div className="md:col-span-2 flex md:justify-center">
            <span aria-hidden style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 76, lineHeight: 1, color: '#C4634A', opacity: 0.9 }}>藥</span>
          </div>
          <div className="md:col-span-10">
            <div style={{ fontSize: 11.5, letterSpacing: '0.22em', color: '#B8C5B8' }}>— המרקחת הסינית</div>
            <h3 className="mt-2" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26, fontWeight: 400 }}>צמחי מרפא ופטריות מרפא</h3>
            <p className="mt-3" style={{ fontSize: 15, lineHeight: 1.8, color: '#D8D0BF', maxWidth: 720 }}>
              לצד הדיקור והמגע, אני משלבת בטיפול פורמולות אישיות של צמחי מרפא סיניים ופטריות מרפא —
              ובהן ריישי וקורדיספס — הנמצאות בשימוש ברפואה הסינית למעלה מ-2,000 שנה.
              הפורמולה נבנית בהתאמה אישית לאבחנה, ומסייעת בשלל בעיות: חיזוק מערכת החיסון, איזון הורמונלי,
              שיפור השינה ורמות האנרגיה, תמיכה בעיכול ובהתמודדות עם סטרס — וממשיכה לעבוד עבורך גם בין הטיפולים.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- תחומי טיפול ----------
function Areas() {
  const [active, setActive] = useState('women')
  const list = Object.values(AREAS)
  const current = AREAS[active]
  return (
    <section id="areas" className="py-24 md:py-32">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div className="max-w-[640px]">
            <div style={{ fontSize: 11.5, letterSpacing: '0.22em', color: '#4A6B5C' }}>— תחומי טיפול</div>
            <h2 className="mt-4" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 400, fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>חמישה תחומים עיקריים.</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 mb-10">
          {list.map((a, i) => {
            const lastOdd = list.length % 2 === 1 && i === list.length - 1
            return (
              <button key={a.id} onClick={() => setActive(a.id)}
                className={`flex items-center justify-center md:justify-start gap-2 md:gap-3 px-3 md:px-5 py-3 transition-all ${lastOdd ? 'col-span-2 md:col-auto' : ''}`}
                style={{
                  background: active === a.id ? '#1C2A24' : '#FFFFFF',
                  color: active === a.id ? '#F5F1EA' : '#1C2A24',
                  border: `1px solid ${active === a.id ? '#1C2A24' : 'rgba(28,42,36,0.15)'}`,
                  borderRadius: 2,
                }}>
                <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 18, opacity: 0.6 }}>{a.chinese}</span>
                <span className="md:hidden" style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap' }}>{a.shortTag || a.tag}</span>
                <span className="hidden md:inline" style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap' }}>{a.tag}</span>
              </button>
            )
          })}
        </div>
        <div key={current.id} className="view-enter grid md:grid-cols-12 gap-10" style={{ background: '#FFFFFF', border: '1px solid rgba(28,42,36,0.1)', borderRadius: 2 }}>
          <div className="md:col-span-5 p-8 md:p-10 relative" style={{ background: '#1C2A24', color: '#F5F1EA', borderRadius: 2 }}>
            <div className="absolute top-6 left-6" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 140, lineHeight: 1, opacity: 0.12 }}>{current.chinese}</div>
            <div style={{ fontSize: 11.5, letterSpacing: '0.22em', color: '#B8C5B8', position: 'relative' }}>{current.tag}</div>
            <h3 className="mt-4" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 400, lineHeight: 1.15, position: 'relative' }}>{current.title}</h3>
            <p className="mt-5" style={{ fontSize: 15, lineHeight: 1.75, color: '#D8D0BF', position: 'relative' }}>{current.intro}</p>
          </div>
          <div className="md:col-span-7 p-8 md:p-10 flex flex-col">
            {current.items.map((it, i) => (
              <div key={i} className="py-5" style={{ borderBottom: i < current.items.length - 1 ? '1px solid rgba(28,42,36,0.08)' : 'none' }}>
                <h4 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 19, fontWeight: 500, color: '#1C2A24' }}>
                  <span style={{ color: '#C4634A', marginLeft: 8 }}>·</span>{it.h}
                </h4>
                <p className="mt-2" style={{ fontSize: 14.5, lineHeight: 1.75, color: '#2A3D34' }}>{it.b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- וידאו (YouTube) ----------
// ---------- המלצות ----------
function TestimonialVideo({ src, poster }: { src: string; poster: string }) {
  const [playing, setPlaying] = useState(false)
  const ref = useRef<HTMLVideoElement>(null)
  const start = () => { setPlaying(true); void ref.current?.play() }
  return (
    <div className="relative overflow-hidden group"
      style={{ aspectRatio: '9/16', background: '#1C2A24', borderRadius: 2, border: '1px solid rgba(28,42,36,0.12)', boxShadow: '0 6px 24px rgba(28,42,36,0.12)' }}>
      <video ref={ref} src={src} poster={poster} preload="metadata" playsInline controls={playing}
        className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover' }} />
      {!playing && (
        <button onClick={start} className="absolute inset-0 w-full h-full" aria-label="ניגון סרטון המלצה">
          <span className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(28,42,36,0.02), rgba(28,42,36,0.38))' }} />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(245,241,234,0.95)', boxShadow: '0 12px 32px rgba(0,0,0,0.35)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#1C2A24" style={{ marginRight: 3 }}><path d="M8 5 L8 19 L20 12 Z" /></svg>
            </span>
          </span>
        </button>
      )}
    </div>
  )
}

function Stories() {
  return (
    <section id="stories" style={{ background: '#F5F1EA' }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="mb-12">
          <div style={{ fontSize: 11.5, letterSpacing: '0.22em', color: '#4A6B5C' }}>— המלצות</div>
          <h2 className="mt-4" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 400, fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>מטופלים משתפים.</h2>
        </div>
        {TESTIMONIAL_VIDEOS.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[440px] sm:max-w-[900px] mx-auto">
            {TESTIMONIAL_VIDEOS.map(v => (
              <TestimonialVideo key={v.src} src={v.src} poster={v.poster} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center text-center p-10" style={{ minHeight: 220, background: '#FFFFFF', border: '1px dashed rgba(28,42,36,0.25)', borderRadius: 2 }}>
            <div style={{ maxWidth: 520 }}>
              <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, color: '#1C2A24' }}>מקום להמלצות אמיתיות</div>
              <div className="mt-2" style={{ fontSize: 14, color: '#4A6B5C', lineHeight: 1.7 }}>אשמח לקבל ממך את הטקסטים והצילומים של ההמלצות — ונשבץ כאן.</div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ---------- יצירת קשר ----------
function ContactSection({ onBook, onContact }: { onBook: () => void; onContact: () => void }) {
  return (
    <section id="contact" style={{ background: '#4A6B5C', color: '#F5F1EA' }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-20 md:py-24 grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7">
          <div style={{ fontSize: 11.5, letterSpacing: '0.22em', color: '#B8C5B8' }}>— להזמנת טיפול</div>
          <h2 className="mt-4" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 400, fontSize: 'clamp(36px, 4.5vw, 60px)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>מתחילים בשיחה קצרה.</h2>
          <p className="mt-5 max-w-[560px]" style={{ fontSize: 16, lineHeight: 1.75, color: '#DCE4DF' }}>אשמח להקשיב, לענות על שאלות ולעזור להבין אם זה הטיפול המתאים עבורך.</p>
        </div>
        <div className="md:col-span-5 flex flex-col gap-3">
          <Button variant="seal" size="lg" pill onClick={onBook} className="w-full">קביעת תור <Icon.ArrowLeft /></Button>
          <Button variant="quiet" size="lg" pill onClick={onContact} className="w-full">יצירת קשר ראשוני <Icon.ArrowLeft /></Button>
          <a href={`tel:${CLINIC_CONTACT.phoneIntl}`} className="flex items-center justify-center gap-2 text-[14.5px] h-11 transition-colors hover:border-[#F5F1EA]" style={{ border: '1px solid rgba(245,241,234,0.3)', borderRadius: 999 }}>
            <Icon.Phone s={14} /> <span style={{ direction: 'ltr' }}>{CLINIC_CONTACT.phone}</span>
          </a>
          <a href={SOCIAL_LINKS.find(s => s.id === 'whatsapp')!.href} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 text-[14.5px] h-11 transition-colors hover:border-[#F5F1EA]" style={{ border: '1px solid rgba(245,241,234,0.3)', borderRadius: 999 }}>
            <Icon.Whatsapp s={15} />
            וואטסאפ
          </a>
        </div>
      </div>
    </section>
  )
}

// ---------- פוטר ----------
function Footer() {
  return (
    <footer style={{ background: '#1C2A24', color: '#D8D0BF' }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-16">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <Enso size={38} color="#F5F1EA" />
              <div className="leading-none">
                <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 24, color: '#F5F1EA' }}>קרן שריג</div>
                <div style={{ fontSize: 10.5, letterSpacing: '0.2em', color: '#B8C5B8', marginTop: 4 }}>רפואה סינית · דיקור</div>
              </div>
            </div>
            <p className="mt-6 max-w-[380px]" style={{ fontSize: 14.5, lineHeight: 1.75 }}>קליניקה רב-תחומית לדיקור ורפואה משלימה בשילוב מגע. ברמת השרון.</p>
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL_LINKS.map(s => {
                const Ico = (Icon as Record<string, React.ComponentType<{ s?: number }>>)[s.icon]
                return (
                  <a key={s.id} href={s.href} target="_blank" rel="noopener" aria-label={s.label} className="flex items-center justify-center hover:text-[#F5F1EA]" style={{ width: 40, height: 40, border: '1px solid rgba(245,241,234,0.2)', borderRadius: '50%' }}>
                    {Ico && <Ico s={16} />}
                  </a>
                )
              })}
            </div>
          </div>
          <div className="md:col-span-3">
            <div style={{ fontSize: 11.5, letterSpacing: '0.18em', color: '#B8C5B8' }}>יצירת קשר</div>
            <div className="mt-4" style={{ fontSize: 14.5, lineHeight: 1.7 }}>
              <div>{CLINIC_CONTACT.address}</div>
              <div className="mt-3 flex items-center gap-2"><Icon.Phone s={13} /> {CLINIC_CONTACT.phone}</div>
              <div className="flex items-center gap-2"><Icon.Mail s={13} /> {CLINIC_CONTACT.email}</div>
            </div>
          </div>
          <div className="md:col-span-4">
            <div style={{ fontSize: 11.5, letterSpacing: '0.18em', color: '#B8C5B8' }}>ניווט מהיר</div>
            <div className="mt-4 grid grid-cols-2 gap-2" style={{ fontSize: 14.5 }}>
              {[['#about', 'אודות'], ['#approach', 'הגישה'], ['#areas', 'תחומי טיפול'], ['#stories', 'המלצות'], ['#contact', 'יצירת קשר']].map(([href, label]) => (
                <a key={href} href={href} className="hover:text-[#F5F1EA]">{label}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-14 pt-8 flex flex-wrap items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(245,241,234,0.15)', fontSize: 12, color: '#B8C5B8' }}>
          <div>© 2026 קרן שריג · רפואה סינית · כל הזכויות שמורות</div>
          <div className="flex items-center gap-6">
            <a href="/accessibility" className="hover:text-[#F5F1EA]">הצהרת נגישות</a>
            <a href="/privacy" className="hover:text-[#F5F1EA]">מדיניות פרטיות</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
