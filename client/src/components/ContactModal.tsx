import { useState, useEffect } from 'react'
import { Enso, Icon, Button, Label, FormField } from './shared'

interface ContactData {
  name: string
  phone: string
  email: string
  concern: string
}

interface FieldErrors {
  phone?: string
  email?: string
}

const normalizePhone = (v: string) => v.replace(/\D/g, '')
const isValidPhone   = (v: string) => /^05\d{8}$/.test(normalizePhone(v))
const isValidEmail   = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export default function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [data, setData] = useState<ContactData>({ name: '', phone: '', email: '', concern: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (open) { setDone(false); setErrors({}); document.body.style.overflow = 'hidden' }
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const update = (k: keyof ContactData, v: string) => {
    setData(d => ({ ...d, [k]: v }))
    if (k === 'phone' && errors.phone) setErrors(e => ({ ...e, phone: undefined }))
    if (k === 'email' && errors.email) setErrors(e => ({ ...e, email: undefined }))
  }

  const validate = (): boolean => {
    const next: FieldErrors = {}
    if (!isValidPhone(data.phone)) next.phone = 'מספר טלפון לא תקין — אנא הזינו מספר ישראלי (05X-XXXXXXX)'
    if (data.email.trim() && !isValidEmail(data.email.trim())) next.email = 'כתובת אימייל לא תקינה'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const canSubmit =
    data.name.trim().length >= 2 &&
    data.phone.trim().length > 0 &&
    data.concern.trim().length >= 4

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, phone: normalizePhone(data.phone), source: 'אתר' }),
      })
    } catch { /* non-blocking */ } finally {
      setSubmitting(false)
      setDone(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: 'rgba(28,42,36,0.55)', backdropFilter: 'blur(4px)', animation: 'fadeIn 200ms ease-out' }}
      onClick={onClose}>
      <div className="relative w-full md:max-w-[560px] max-h-[95vh] overflow-hidden flex flex-col"
        style={{ background: '#F5F1EA', borderRadius: 2, animation: 'slideUp 260ms cubic-bezier(.2,.8,.2,1)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(28,42,36,0.1)' }}>
          <div className="flex items-center gap-3">
            <Enso size={26} />
            <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20 }}>יצירת קשר</div>
          </div>
          <button onClick={onClose} className="p-1 hover:opacity-60" aria-label="סגירה"><Icon.Close /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          {done ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center" style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8EDDF', color: '#4A6B5C' }}>
                <Icon.Check s={28} />
              </div>
              <h3 className="mt-5" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 400 }}>הפנייה התקבלה.</h3>
              <p className="mt-3" style={{ fontSize: 14.5, lineHeight: 1.7, color: '#2A3D34' }}>
                ניצור איתך קשר בהקדם לתיאום מועד.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#2A3D34' }}>
                  מעוניינ/ת להתחיל? השאירו פרטים ונחזור אליכם לתיאום פגישה ראשונה.
                </p>
              </div>

              <div>
                <Label>הבעיה העיקרית</Label>
                <textarea value={data.concern} onChange={e => update('concern', e.target.value)}
                  placeholder="תיאור קצר של הסיבה לפנייה…" rows={4} dir="rtl"
                  className="field-input mt-3" style={{ resize: 'none' }} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="שם מלא" required>
                  <input value={data.name} onChange={e => update('name', e.target.value)} className="field-input" placeholder="שם פרטי ושם משפחה" />
                </FormField>
                <div>
                  <FormField label="טלפון" required>
                    <input
                      value={data.phone}
                      onChange={e => update('phone', e.target.value)}
                      onBlur={() => {
                        if (data.phone && !isValidPhone(data.phone))
                          setErrors(e => ({ ...e, phone: 'מספר טלפון לא תקין — אנא הזינו מספר ישראלי (05X-XXXXXXX)' }))
                      }}
                      className="field-input"
                      placeholder="050-0000000"
                      style={{ direction: 'ltr', textAlign: 'right' }}
                    />
                  </FormField>
                  {errors.phone && <div className="mt-1 text-[12.5px]" style={{ color: '#C4634A' }}>{errors.phone}</div>}
                </div>
              </div>

              <div>
                <FormField label="אימייל">
                  <input
                    value={data.email}
                    onChange={e => update('email', e.target.value)}
                    onBlur={() => {
                      if (data.email.trim() && !isValidEmail(data.email.trim()))
                        setErrors(e => ({ ...e, email: 'כתובת אימייל לא תקינה' }))
                    }}
                    className="field-input"
                    placeholder="name@example.com"
                    style={{ direction: 'ltr', textAlign: 'right' }}
                  />
                </FormField>
                {errors.email && <div className="mt-1 text-[12.5px]" style={{ color: '#C4634A' }}>{errors.email}</div>}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-5 flex items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(28,42,36,0.1)' }}>
          {done ? (
            <Button variant="primary" onClick={onClose}>סיום</Button>
          ) : (
            <>
              <button onClick={onClose} className="text-[14px] hover:underline" style={{ color: '#4A6B5C' }}>ביטול</button>
              <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit || submitting}>
                {submitting ? 'שולח…' : 'שליחת הפנייה'} <Icon.ArrowLeft />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
