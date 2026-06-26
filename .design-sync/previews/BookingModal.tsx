import { BookingModal } from 'keren-sarig-ui'

export const Open = () => (
  <div style={{ position: 'relative', height: 700, background: '#F5F1EA', overflow: 'hidden' }}>
    <BookingModal open={true} onClose={() => {}} />
  </div>
)
