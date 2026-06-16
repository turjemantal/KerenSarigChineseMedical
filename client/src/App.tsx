import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Landing from './components/Landing'
import BookingModal from './components/BookingModal'
import ContactModal from './components/ContactModal'
import Dashboard from './components/Dashboard'
import ClientPortal from './components/ClientPortal'
import AdminLogin from './components/AdminLogin'
import { AccessibilityStatement, PrivacyPolicy } from './components/Legal'
import { hasValidClientToken, hasValidAdminToken, adminSessionExpired, ADMIN_UNAUTHORIZED_EVENT } from './auth'

function PublicView() {
  const navigate = useNavigate()
  const [booking, setBooking] = useState(false)
  const [contact, setContact] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(hasValidClientToken())

  return (
    <>
      <Landing
        onBook={() => setBooking(true)}
        onContact={() => setContact(true)}
        onPortal={() => navigate('/portal')}
        isLoggedIn={isLoggedIn}
      />
      <BookingModal
        open={booking}
        onClose={() => { setBooking(false); setIsLoggedIn(hasValidClientToken()) }}
        onPortal={() => navigate('/portal')}
      />
      <ContactModal open={contact} onClose={() => setContact(false)} />
    </>
  )
}

function ManagerView() {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(hasValidAdminToken())
  const [expired, setExpired] = useState(adminSessionExpired())

  useEffect(() => {
    const onUnauthorized = () => { setIsAdmin(false); setExpired(true) }
    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  if (!isAdmin) return <AdminLogin expired={expired} onSuccess={() => { setExpired(false); setIsAdmin(true) }} />
  return <Dashboard onExit={() => navigate('/')} />
}

function PortalView() {
  const navigate = useNavigate()
  return <ClientPortal onExit={() => navigate('/')} />
}

function AccessibilityView() {
  const navigate = useNavigate()
  return <AccessibilityStatement onBack={() => navigate('/')} />
}

function PrivacyView() {
  const navigate = useNavigate()
  return <PrivacyPolicy onBack={() => navigate('/')} />
}

export default function App() {
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', '#C4634A')
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicView />} />
        <Route path="/manager" element={<ManagerView />} />
        <Route path="/portal" element={<PortalView />} />
        <Route path="/accessibility" element={<AccessibilityView />} />
        <Route path="/privacy" element={<PrivacyView />} />
      </Routes>
    </BrowserRouter>
  )
}
