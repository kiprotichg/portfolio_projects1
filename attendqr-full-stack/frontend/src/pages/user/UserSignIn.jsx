import { useState, useEffect } from 'react'
import { api } from '../../api.js'
import { Card, CardTitle, CardSub, Toast, Spinner, Empty } from '../../components/UI.jsx'

export default function UserSignIn() {
  const [sessions, setSessions] = useState([])
  const [selected, setSelected] = useState('')
  const [name, setName] = useState('')
  const [attendeeId, setAttendeeId] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.getPublicSessions().then(setSessions).finally(() => setLoading(false)) }, [])

  const session = sessions.find(s => String(s.id) === String(selected))

  async function handleSignIn() {
    if (!name.trim()) { setMsg({ type:'warn', text:'Please enter your name.' }); return }
    if (!session)     { setMsg({ type:'warn', text:'Please select a session.' }); return }
    setMsg(null)
    try {
      await api.signIn({ session_id: session.id, attendee_name: name.trim(), attendee_badge: attendeeId.trim() })
      setMsg({ type:'ok', text:`✅ Signed in successfully! The admin has been notified.` })
      setName(''); setAttendeeId('')
    } catch(err) {
      setMsg({ type:'error', text: err.message })
    }
    setTimeout(() => setMsg(null), 5000)
  }

  const inp = { background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:'.7rem .9rem', fontSize:'.87rem', color:'var(--text)', outline:'none', width:'100%', transition:'border-color .2s', fontFamily:'var(--font-body)' }

  return (
    <div className="fu">
      {loading ? <Spinner /> : sessions.length === 0 ? (
        <Card><Empty icon="🔍" text="No active sessions available. Check back later." /></Card>
      ) : (
        <>
          <Card>
            <CardTitle>Sign In to Session</CardTitle>
            <CardSub>Select your session, enter your name, and sign in. The admin will receive an email notification.</CardSub>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div>
                <label style={{ fontSize:'.68rem', letterSpacing:'.08em', color:'var(--text3)', marginBottom:'.35rem', textTransform:'uppercase', fontWeight:600, display:'block' }}>SELECT SESSION</label>
                <select style={{ ...inp, color: selected ? 'var(--text)' : 'var(--text3)' }} value={selected} onChange={e=>setSelected(e.target.value)}>
                  <option value="">Choose a session…</option>
                  {sessions.map(s=><option key={s.id} value={s.id}>{s.event_name} — {s.date}{s.location?` (${s.location})`:''}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:'.68rem', letterSpacing:'.08em', color:'var(--text3)', marginBottom:'.35rem', textTransform:'uppercase', fontWeight:600, display:'block' }}>YOUR FULL NAME *</label>
                <input style={inp} placeholder="e.g. John Doe" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSignIn()} />
              </div>
              <div>
                <label style={{ fontSize:'.68rem', letterSpacing:'.08em', color:'var(--text3)', marginBottom:'.35rem', textTransform:'uppercase', fontWeight:600, display:'block' }}>EMPLOYEE / STUDENT ID (optional)</label>
                <input style={inp} placeholder="e.g. EMP-001 or STU-456" value={attendeeId} onChange={e=>setAttendeeId(e.target.value)} />
              </div>
              <Toast msg={msg} />
              <button onClick={handleSignIn} style={{ background:'linear-gradient(135deg,var(--green),#16a34a)', color:'#fff', border:'none', borderRadius:10, padding:'.9rem', fontSize:'.92rem', fontWeight:700, fontFamily:'var(--font-display)', cursor:'pointer', transition:'filter .15s' }}>
                ✓ Sign In
              </button>
            </div>
          </Card>

          {session && (
            <Card>
              <CardTitle>Session Info</CardTitle>
              {[['Event',session.event_name],['Organization',session.org_name],['Industry',session.industry],['Date',session.date],['Location',session.location||'—']].map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'.55rem 0', borderBottom:'1px solid var(--border)', gap:'1rem' }}>
                  <span style={{ fontSize:'.72rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.06em' }}>{k}</span>
                  <span style={{ fontSize:'.85rem', color:'var(--text)', fontWeight:600, textAlign:'right' }}>{v}</span>
                </div>
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  )
}
