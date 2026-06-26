import { AdminLogin } from 'keren-sarig-ui'

export const Default = () => (
  <div style={{ minHeight: 480, background: '#F5F1EA' }}>
    <AdminLogin onSuccess={() => {}} />
  </div>
)

export const SessionExpired = () => (
  <div style={{ minHeight: 480, background: '#F5F1EA' }}>
    <AdminLogin onSuccess={() => {}} expired />
  </div>
)
