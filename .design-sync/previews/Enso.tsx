import { Enso } from 'keren-sarig-ui'

export const Default = () => (
  <div style={{ padding: 24, background: '#F5F1EA', display: 'flex', alignItems: 'center', gap: 24 }}>
    <Enso size={32} />
    <Enso size={48} />
    <Enso size={64} />
  </div>
)

export const WithText = () => (
  <div style={{ padding: 24, background: '#F5F1EA', display: 'flex', alignItems: 'center', gap: 12 }}>
    <Enso size={40} />
    <div>
      <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22 }}>קרן שריג</div>
      <div style={{ fontSize: 11, letterSpacing: '0.18em', color: '#4A6B5C' }}>רפואה סינית</div>
    </div>
  </div>
)

export const OnDark = () => (
  <div style={{ padding: 24, background: '#1C2A24', display: 'flex', alignItems: 'center', gap: 12 }}>
    <Enso size={40} color="#F5F1EA" />
    <div style={{ color: '#F5F1EA', fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22 }}>קרן שריג</div>
  </div>
)
