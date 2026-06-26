import { ContactModal } from 'keren-sarig-ui'

export const Open = () => (
  <div style={{ position: 'relative', height: 600, background: '#F5F1EA', overflow: 'hidden' }}>
    <ContactModal open={true} onClose={() => {}} />
  </div>
)
