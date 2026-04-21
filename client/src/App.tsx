import { useState, useEffect } from 'react'
import Landing from './components/Landing'
import BookingModal from './components/BookingModal'
import ContactModal from './components/ContactModal'
import Dashboard from './components/Dashboard'
import ClientPortal from './components/ClientPortal'
import AdminLogin from './components/AdminLogin'
import { getToken, getAdminToken } from './auth'

const ACCENTS: Record<string, string> = {
  cinnabar: '#C4634A',
  gold:     '#B8893B',
  ink:      '#1C2A24',
  plum:     '#7A4A5C',
}

type AppView = 'public' | 'manager' | 'portal'

function getInitialView(): AppView {
  const q = window.location.search
  if (q.includes('manager')) return 'manager'
  if (q.includes('portal')) return 'portal'
  return 'public'
}

export default function App() {
  const [view, setView] = useState<AppView>(getInitialView)
  const [booking, setBooking] = useState(false)
  const [contact, setContact] = useState(false)
  const [accent] = useState('cinnabar')
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken())
  const [isAdmin, setIsAdmin] = useState(!!getAdminToken())

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', ACCENTS[accent] || '#C4634A')
  }, [accent])

  const exitToPublic = () => {
    setView('public')
    window.history.replaceState(null, '', '/')
  }

  if (view === 'manager') {
    if (!isAdmin) return <AdminLogin onSuccess={() => setIsAdmin(true)} />
    return <Dashboard onExit={exitToPublic} />
  }

  if (view === 'portal') {
    return <ClientPortal onExit={exitToPublic} />
  }

  const goPortal = () => {
    setView('portal')
    window.history.replaceState(null, '', '/?portal')
  }

  return (
    <>
      <Landing
        onBook={() => setBooking(true)}
        onContact={() => setContact(true)}
        onPortal={goPortal}
        isLoggedIn={isLoggedIn}
      />
      <BookingModal
        open={booking}
        onClose={() => { setBooking(false); setIsLoggedIn(!!getToken()) }}
        onPortal={goPortal}
      />
      <ContactModal open={contact} onClose={() => setContact(false)} />
    </>
  )
}
