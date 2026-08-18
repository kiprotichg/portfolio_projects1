import { useState } from 'react'
import { Topbar } from '../../components/UI.jsx'
import AdminOverview from './AdminOverview.jsx'
import AdminSetup from './AdminSetup.jsx'
import AdminQR from './AdminQR.jsx'
import AdminLog from './AdminLog.jsx'
import AdminSettings from './AdminSettings.jsx'

const TABS = ['Overview','New Session','QR Code','Logs','Settings']

export default function AdminDashboard({ admin, onLogout }) {
  const [tab, setTab] = useState('Overview')
  const [activeSession, setActiveSession] = useState(null)

  function goToQR(session) { setActiveSession(session); setTab('QR Code') }
  function goToLog(session) { setActiveSession(session); setTab('Logs') }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Topbar role="admin" name={admin?.name} onBack={onLogout} />

      {/* Tabs */}
      <nav style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', padding:'0 1.5rem' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background:'none', border:'none', borderBottom:`2px solid ${tab===t?'var(--accent)':'transparent'}`, padding:'.85rem 1.1rem', fontSize:'.8rem', fontWeight:600, letterSpacing:'.03em', cursor:'pointer', color: tab===t?'var(--accent)':'var(--text3)', transition:'all .2s', fontFamily:'var(--font-body)' }}>
              {t}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth:1100, margin:'0 auto', padding:'1.75rem 1.5rem' }}>
        {tab === 'Overview'    && <AdminOverview admin={admin} onNew={()=>setTab('New Session')} onQR={goToQR} onLog={goToLog} />}
        {tab === 'New Session' && <AdminSetup onCreated={goToQR} />}
        {tab === 'QR Code'     && <AdminQR session={activeSession} onGoLog={goToLog} />}
        {tab === 'Logs'        && <AdminLog session={activeSession} onSelect={s=>{setActiveSession(s)}} />}
        {tab === 'Settings'    && <AdminSettings admin={admin} />}
      </main>
    </div>
  )
}
