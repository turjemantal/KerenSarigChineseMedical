import { FormField } from 'keren-sarig-ui'

export const TextInput = () => (
  <div style={{ padding: 24, background: '#F5F1EA', maxWidth: 360 }}>
    <FormField label="שם פרטי" required>
      <input className="field-input" placeholder="ישראל ישראלי" />
    </FormField>
  </div>
)

export const Textarea = () => (
  <div style={{ padding: 24, background: '#F5F1EA', maxWidth: 360 }}>
    <FormField label="סיבת הביקור">
      <textarea className="field-input" rows={3} placeholder="תאר/י את הסיבה לפנייה…" style={{ resize: 'none' }} />
    </FormField>
  </div>
)

export const Multiple = () => (
  <div style={{ padding: 24, background: '#F5F1EA', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <FormField label="שם פרטי" required>
      <input className="field-input" placeholder="ישראל ישראלי" />
    </FormField>
    <FormField label="מספר טלפון" required>
      <input className="field-input" placeholder="050-0000000" />
    </FormField>
    <FormField label="סיבת הביקור">
      <input className="field-input" placeholder="כאב גב, עייפות…" />
    </FormField>
  </div>
)
