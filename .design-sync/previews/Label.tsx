import { Label } from 'keren-sarig-ui'

export const Default = () => (
  <div style={{ padding: 24, background: '#F5F1EA', display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Label>שם פרטי</Label>
    <Label>מספר טלפון</Label>
    <Label>סיבת הביקור</Label>
    <Label>הערות נוספות</Label>
  </div>
)
