import { useState, useEffect } from 'react'
import { api } from '../../api.js'
import { Card, CardTitle, CardSub, Spinner, Empty } from '../../components/UI.jsx'

export default function AdminOverview({ admin, onNew, onQR, onLog }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.getSessions().then(setSessions).finally(() => setLoading(false)) }, [])

  const today = new Date().toISOString().slice(0,10)

  return (
    <div className="fu">
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.25rem' }}>
        {[
          { label:'Total Sessions', value: sessions.length, color:'var(--accent)' },
          { label:"Today's Sessions", value: sessions.filter(s=>s.date===today).length, color:'var(--green)' },
          { label:'Admin Email', value: admin?.email, color:'var(--warn)', small: true },
        ].map(s => (
          <Card key={s.label} style={{ marginBottom:0 }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize: s.small ? '1rem' : '2.2rem', fontWeight:800, color:s.color, lineHeight:1, marginBottom:'.35rem', wordBreak:'break-all' }}>{s.value}</div>
            <div style={{ fontSize:'.72rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.06em' }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Sessions */}
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'.5rem' }}>
          <div><CardTitle>All Sessions</CardTitle><CardSub>{sessions.length} sessions</CardSub></div>
          <button onClick={onNew} style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, padding:'.5rem 1rem', fontSize:'.8rem', fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)' }}>+ New Session</button>
        </div>

        {loading ? <Spinner /> : sessions.length === 0 ? (
          <Empty icon="📋" text="No sessions yet. Create your first one." />
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
            {sessions.map(s => (
              <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.25rem', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, gap:'1rem', flexWrap:'wrap', transition:'border-color .2s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, color:'var(--text)', marginBottom:'.2rem' }}>{s.event_name}</div>
                  <div style={{ fontSize:'.74rem', color:'var(--text3)' }}>{s.industry} · {s.org_name} · {s.date}{s.location ? ` · ${s.location}` : ''}</div>
                </div>
                <div style={{ display:'flex', gap:'.5rem', flexShrink:0 }}>
                  <button onClick={() => onQR(s)} style={{ background:'var(--accent-s)', color:'var(--accent)', border:'1px solid var(--accent-b)', borderRadius:6, padding:'.3rem .7rem', fontSize:'.74rem', fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)' }}>QR</button>
                  <button onClick={() => onLog(s)} style={{ background:'var(--green-s)', color:'var(--green)', border:'1px solid rgba(34,197,94,.25)', borderRadius:6, padding:'.3rem .7rem', fontSize:'.74rem', fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)' }}>Log</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
