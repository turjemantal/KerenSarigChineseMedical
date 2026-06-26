import { Chop } from 'keren-sarig-ui'

export const Default = () => (
  <div style={{ padding: 32, background: '#F5F1EA', display: 'flex', gap: 24, alignItems: 'center' }}>
    <Chop />
  </div>
)

export const Sizes = () => (
  <div style={{ padding: 32, background: '#F5F1EA', display: 'flex', gap: 24, alignItems: 'center' }}>
    <Chop size={40} />
    <Chop size={56} />
    <Chop size={72} />
  </div>
)

export const Custom = () => (
  <div style={{ padding: 32, background: '#F5F1EA', display: 'flex', gap: 24, alignItems: 'center' }}>
    <Chop char="針" />
    <Chop char="氣" />
    <Chop char="愈" />
  </div>
)
