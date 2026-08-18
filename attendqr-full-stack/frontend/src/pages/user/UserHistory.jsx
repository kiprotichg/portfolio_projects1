import { useState } from 'react'
import { api } from '../../api.js'
import { Card, CardTitle, CardSub, Toast, Empty } from '../../components/UI.jsx'

export default function UserHistory() {
  const [search, setSearch] = useState('')
  const [records, setRecords] = useState(null)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSearch() {
    if (!search.trim()) return
    setLoading(true); setMsg(null)
    try {
      const data = await api.lookupAttendee(search.trim())
      setRecords(data)
      if (data.length === 0) setMsg({ type:'warn', text:'No records found for that name/ID.' })
    } catch(err) {
      setMsg({ type:'error', text: err.message })
    } finally { setLoading(false) }
  }

  const inp = { background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:'.7rem .9rem', fontSize:'.87rem', color:'var(--text)', outline:'none', flex:1, minWidth:200, transition:'border-color .2s', fontFamily:'var(--font-body)' }

  return (
    <div className="fu">
      <Card>
        <CardTitle>My Attendance History</CardTitle>
        <CardSub>Enter your name or ID to fetch your complete attendance history from the database.</CardSub>
        <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap' }}>
          <input style={inp} placeholder="Your name or ID…" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} />
          <button onClick={handleSearch} disabled={loading} style={{ background:'var(--green)', color:'#fff', border:'none', borderRadius:8, padding:'.65rem 1.25rem', fontSize:'.82rem', fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)', opacity:loading?.7:1 }}>
            {loading ? '…' : '🔍 Search'}
          </button>
        </div>
        <Toast msg={msg} />
      </Card>

      {records !== null && records.length > 0 && (
        <Card>
          <CardTitle>Results for "{search}"</CardTitle>
          <CardSub>{records.length} record{records.length!==1?'s':''} found</CardSub>
          <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid var(--border)' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--bg3)' }}>
                  {['Session','Date','Signed In','Signed Out','Status'].map(h=><th key={h} style={{ padding:'.6rem 1rem', textAlign:'left', fontSize:'.68rem', letterSpacing:'.08em', textTransform:'uppercase', color:'var(--text3)', fontWeight:600 }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {records.map(r=>(
                  <tr key={r.id} style={{ borderTop:'1px solid var(--border)' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg3)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{ padding:'.65rem 1rem', fontSize:'.84rem', color:'var(--text)', fontWeight:600 }}>{r.event_name}</td>
                    <td style={{ padding:'.65rem 1rem', fontSize:'.82rem', color:'var(--text2)' }}>{r.date}</td>
                    <td style={{ padding:'.65rem 1rem', fontSize:'.8rem', color:'var(--green)', fontFamily:'monospace' }}>{r.sign_in_time}</td>
                    <td style={{ padding:'.65rem 1rem', fontSize:'.8rem', color: r.sign_out_time?'var(--warn)':'var(--text3)', fontFamily:'monospace' }}>{r.sign_out_time || '—'}</td>
                    <td style={{ padding:'.65rem 1rem' }}>
                      <span style={{ fontSize:'.72rem', fontWeight:600, padding:'.2rem .6rem', borderRadius:20, background: r.sign_out_time?'var(--bg3)':'var(--green-s)', color: r.sign_out_time?'var(--text3)':'var(--green)', border:`1px solid ${r.sign_out_time?'var(--border)':'rgba(34,197,94,.25)'}` }}>
                        {r.sign_out_time ? 'Completed' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
