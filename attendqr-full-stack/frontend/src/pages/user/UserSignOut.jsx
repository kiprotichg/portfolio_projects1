import { useState } from 'react'
import { api } from '../../api.js'
import { Card, CardTitle, CardSub, Toast, Empty } from '../../components/UI.jsx'

export default function UserSignOut() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState(null)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleLookup() {
    if (!search.trim()) return
    setLoading(true); setMsg(null)
    try {
      const data = await api.lookupAttendee(search.trim())
      setResults(data)
      if (data.length === 0) setMsg({ type:'warn', text:'No active sign-in found for that name/ID.' })
    } catch(err) {
      setMsg({ type:'error', text: err.message })
    } finally { setLoading(false) }
  }

  async function handleSignOut(id) {
    try {
      await api.signOut(id)
      setMsg({ type:'ok', text:'✅ Signed out successfully! Admin has been notified.' })
      setResults(r => r.map(x => x.id === id ? { ...x, sign_out_time: new Date().toLocaleTimeString() } : x))
    } catch(err) {
      setMsg({ type:'warn', text: err.message })
    }
    setTimeout(() => setMsg(null), 4000)
  }

  const inp = { background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:'.7rem .9rem', fontSize:'.87rem', color:'var(--text)', outline:'none', flex:1, minWidth:200, transition:'border-color .2s', fontFamily:'var(--font-body)' }

  return (
    <div className="fu">
      <Card>
        <CardTitle>Sign Out</CardTitle>
        <CardSub>Enter your name or ID to find your active sign-in and sign out. The admin will be notified.</CardSub>
        <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap' }}>
          <input style={inp} placeholder="Your name or ID…" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLookup()} />
          <button onClick={handleLookup} disabled={loading} style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, padding:'.65rem 1.25rem', fontSize:'.82rem', fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)', opacity:loading?.7:1 }}>
            {loading ? '…' : '🔍 Find'}
          </button>
        </div>
        <Toast msg={msg} />
      </Card>

      {results !== null && (
        <Card>
          <CardTitle>Your Active Sessions</CardTitle>
          {results.filter(r => !r.sign_out_time).length === 0 ? (
            <Empty icon="✅" text="No active sign-ins found. You may already be signed out." />
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'.75rem', marginTop:'.5rem' }}>
              {results.filter(r => !r.sign_out_time).map(r => (
                <div key={r.id} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
                  <div>
                    <div style={{ fontWeight:700, color:'var(--text)', marginBottom:'.25rem' }}>{r.event_name}</div>
                    <div style={{ fontSize:'.76rem', color:'var(--text3)', marginBottom:'.15rem' }}>{r.org_name} · {r.date}</div>
                    <div style={{ fontSize:'.76rem', color:'var(--green)' }}>Signed in: {r.sign_in_time}</div>
                  </div>
                  <button onClick={() => handleSignOut(r.id)} style={{ background:'linear-gradient(135deg,var(--warn),#d97706)', color:'#fff', border:'none', borderRadius:8, padding:'.6rem 1.2rem', fontSize:'.82rem', fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)' }}>
                    Sign Out →
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
