import { Landing } from 'keren-sarig-ui'

export const Default = () => (
  <div style={{ height: 700, overflow: 'hidden', background: '#F5F1EA' }}>
    <Landing onBook={() => {}} onContact={() => {}} onPortal={() => {}} isLoggedIn={false} />
  </div>
)

export const LoggedIn = () => (
  <div style={{ height: 700, overflow: 'hidden', background: '#F5F1EA' }}>
    <Landing onBook={() => {}} onContact={() => {}} onPortal={() => {}} isLoggedIn={true} />
  </div>
)
