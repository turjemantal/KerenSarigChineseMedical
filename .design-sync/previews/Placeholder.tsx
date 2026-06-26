import { Placeholder } from 'keren-sarig-ui'

export const Tones = () => (
  <div style={{ padding: 24, background: '#F5F1EA', display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Placeholder label="sage" height={100} tone="sage" />
    <Placeholder label="vellum" height={100} tone="vellum" />
    <Placeholder label="ink" height={100} tone="ink" />
    <Placeholder label="clay" height={100} tone="clay" />
  </div>
)

export const Hero = () => (
  <div style={{ padding: 24, background: '#F5F1EA' }}>
    <Placeholder label="תמונת פרופיל — 400×300" height={300} tone="sage" />
  </div>
)
