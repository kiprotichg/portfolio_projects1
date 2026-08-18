import { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import UserDashboard from './pages/user/UserDashboard.jsx'
import ScanLanding from './pages/ScanLanding.jsx'

export default function App() {
  const [view, setView]             = useState('home')
  const [scanParams, setScanParams] = useState(null)
  const [admin, setAdmin]           = useState(() => {
    try { return JSON.parse(localStorage.getItem('aqr_admin')) } catch { return null }
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('attend') === '1') {
      setScanParams({
        session_id:   params.get('session'),
        attendee_ref: params.get('attendee'),
        // No type — backend decides sign-in or sign-out automatically
      })
      setView('scan')
      window.history.replaceState({}, '', '/')
    }
  }, [])

  function loginAdmin(adminData, token) {
    localStorage.setItem('aqr_token', token)
    localStorage.setItem('aqr_admin', JSON.stringify(adminData))
    setAdmin(adminData)
    setView('admin')
  }

  function logoutAdmin() {
    localStorage.removeItem('aqr_token')
    localStorage.removeItem('aqr_admin')
    setAdmin(null)
    setView('home')
  }

  return (
    <ThemeProvider>
      {view === 'home'  && <LoginPage onAdminLogin={loginAdmin} onUserEnter={() => setView('user')} />}
      {view === 'admin' && <AdminDashboard admin={admin} onLogout={logoutAdmin} />}
      {view === 'user'  && <UserDashboard onBack={() => setView('home')} />}
      {view === 'scan'  && <ScanLanding params={scanParams} onDone={() => setView('home')} />}
    </ThemeProvider>
  )
}
