import { useState } from 'react'
import { Topbar } from '../../components/UI.jsx'
import UserSignIn from './UserSignIn.jsx'
import UserSignOut from './UserSignOut.jsx'
import UserHistory from './UserHistory.jsx'

const TABS = ['Sign In','Sign Out','History']

export default function UserDashboard({ onBack }) {
  const [tab, setTab] = useState('Sign In')

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Topbar role="user" onBack={onBack} />

      <nav style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:800, margin:'0 auto', display:'flex', padding:'0 1.5rem' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background:'none', border:'none', borderBottom:`2px solid ${tab===t?'var(--green)':'transparent'}`, padding:'.85rem 1.1rem', fontSize:'.8rem', fontWeight:600, letterSpacing:'.03em', cursor:'pointer', color: tab===t?'var(--green)':'var(--text3)', transition:'all .2s', fontFamily:'var(--font-body)' }}>
              {t}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth:800, margin:'0 auto', padding:'1.75rem 1.5rem' }}>
        {tab === 'Sign In'  && <UserSignIn />}
        {tab === 'Sign Out' && <UserSignOut />}
        {tab === 'History'  && <UserHistory />}
      </main>
    </div>
  )
}
