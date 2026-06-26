import { Button } from 'keren-sarig-ui'

export const Variants = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 24, background: '#F5F1EA' }}>
    <Button variant="primary">אישור</Button>
    <Button variant="moss">שמירה</Button>
    <Button variant="ghost">ביטול</Button>
    <Button variant="seal">מחיקה</Button>
    <Button variant="quiet">פעולה שקטה</Button>
  </div>
)

export const Sizes = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: 24, background: '#F5F1EA' }}>
    <Button variant="primary" size="sm">קטן</Button>
    <Button variant="primary" size="md">בינוני</Button>
    <Button variant="primary" size="lg">גדול</Button>
  </div>
)

export const Pill = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 24, background: '#F5F1EA' }}>
    <Button variant="primary" pill>שמירה</Button>
    <Button variant="moss" pill>אישור</Button>
    <Button variant="ghost" pill>ביטול</Button>
  </div>
)

export const Disabled = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 24, background: '#F5F1EA' }}>
    <Button variant="primary" disabled>ממתין…</Button>
    <Button variant="moss" disabled>שמירה</Button>
  </div>
)
