import { useState, useEffect } from 'react'
import { api } from '../../api.js'
import { Card, CardTitle, CardSub, Toast, Spinner, Empty } from '../../components/UI.jsx'

export default function AdminLog({ session, onSelect }) {
  const [sessions, setSessions] = useState([])
  const [records, setRecords]   = useState([])
  const [msg, setMsg]           = useState(null)
  const [loading, setLoading]   = useState(false)

  useEffect(() => { api.getSessions().then(setSessions) }, [])

  useEffect(() => {
    if (!session) return
    setLoading(true)
    api.getAttendance(session.id).then(setRecords).finally(() => setLoading(false))
  }, [session])

  async function handleSignOut(id) {
    try {
      await api.signOut(id)
      setMsg({ type: 'ok', text: '✓ Signed out. 📧 Admin notified.' })
      setRecords(await api.getAttendance(session.id))
    } catch (err) {
      setMsg({ type: 'warn', text: err.message })
    }
    setTimeout(() => setMsg(null), 3000)
  }

  async function handleDelete(id) {
    await api.deleteRecord(id)
    setRecords(r => r.filter(x => x.id !== id))
  }

  function exportCSV() {
    const rows = [
      'Name,Badge/ID,Signed In,Signed Out,Duration',
      ...records.map(r => {
        const duration = r.sign_out_time
          ? Math.round((new Date(r.sign_out_time) - new Date(r.sign_in_time)) / 60000) + ' min'
          : 'Active'
        return `"${r.attendee_name}","${r.attendee_badge || ''}","${r.sign_in_time}","${r.sign_out_time || ''}","${duration}"`
      })
    ].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([rows], { type: 'text/csv' }))
    a.download = `${session?.event_name}-log.csv`
    a.click()
  }

  const active   = records.filter(r => !r.sign_out_time)
  const finished = records.filter(r =>  r.sign_out_time)

  return (
    <div className="fu">
      {/* Session selector chips */}
      <Card>
        <CardTitle>Select Session</CardTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.5rem' }}>
          {sessions.length === 0
            ? <span style={{ fontSize: '.84rem', color: 'var(--text3)' }}>No sessions yet.</span>
            : sessions.map(s => (
              <button key={s.id} onClick={() => onSelect(s)} style={{
                background: session?.id === s.id ? 'var(--accent-s)' : 'var(--bg3)',
                border: `1px solid ${session?.id === s.id ? 'var(--accent)' : 'var(--border)'}`,
                color: session?.id === s.id ? 'var(--accent)' : 'var(--text2)',
                borderRadius: 20, padding: '.4rem .9rem', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)'
              }}>
                {s.event_name} · {s.date}
              </button>
            ))
          }
        </div>
      </Card>

      {!session
        ? <Card><Empty icon="📋" text="Select a session above to view its log." /></Card>
        : (
          <>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              {[
                { label: 'Total Scanned', value: records.length,   color: 'var(--accent)' },
                { label: 'Active',        value: active.length,    color: 'var(--green)'  },
                { label: 'Signed Out',    value: finished.length,  color: 'var(--warn)'   },
              ].map(s => (
                <Card key={s.label} style={{ marginBottom: 0, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '.25rem' }}>{s.label}</div>
                </Card>
              ))}
            </div>

            {/* Log table */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem', marginBottom: '1rem' }}>
                <div>
                  <CardTitle>{session.event_name} — Attendance Log</CardTitle>
                  <CardSub>{records.length} record{records.length !== 1 ? 's' : ''} · Emails sent automatically on each scan</CardSub>
                </div>
                {records.length > 0 && (
                  <button onClick={exportCSV} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--accent)', borderRadius: 8, padding: '.5rem 1rem', fontSize: '.76rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    ↓ Export CSV
                  </button>
                )}
              </div>

              <Toast msg={msg} />

              {loading ? <Spinner /> : records.length === 0 ? (
                <Empty icon="📭" text="No scans yet. Share QR codes with attendees." />
              ) : (
                <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', marginTop: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg3)' }}>
                        {['#', 'Name', 'Badge / ID', 'Signed In', 'Signed Out', 'Status', ''].map(h => (
                          <th key={h} style={{ padding: '.6rem 1rem', textAlign: 'left', fontSize: '.68rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r, i) => (
                        <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td style={{ padding: '.65rem 1rem', fontSize: '.82rem', color: 'var(--text3)' }}>{records.length - i}</td>
                          <td style={{ padding: '.65rem 1rem', fontSize: '.84rem', color: 'var(--text)', fontWeight: 600 }}>{r.attendee_name}</td>
                          <td style={{ padding: '.65rem 1rem', fontSize: '.82rem', color: 'var(--text2)' }}>{r.attendee_badge || '—'}</td>
                          <td style={{ padding: '.65rem 1rem', fontSize: '.78rem', color: 'var(--green)', fontFamily: 'monospace' }}>{r.sign_in_time}</td>
                          <td style={{ padding: '.65rem 1rem', fontSize: '.78rem', color: r.sign_out_time ? 'var(--warn)' : 'var(--text3)', fontFamily: 'monospace' }}>{r.sign_out_time || '—'}</td>
                          <td style={{ padding: '.65rem 1rem' }}>
                            <span style={{
                              fontSize: '.7rem', fontWeight: 600, padding: '.2rem .6rem', borderRadius: 20,
                              background: r.sign_out_time ? 'var(--bg3)' : 'var(--green-s)',
                              color: r.sign_out_time ? 'var(--text3)' : 'var(--green)',
                              border: `1px solid ${r.sign_out_time ? 'var(--border)' : 'rgba(34,197,94,.25)'}`
                            }}>
                              {r.sign_out_time ? 'Done' : '● Active'}
                            </span>
                          </td>
                          <td style={{ padding: '.65rem 1rem', display: 'flex', gap: '.35rem' }}>
                            {!r.sign_out_time && (
                              <button onClick={() => handleSignOut(r.id)} style={{ background: 'var(--warn-s)', border: '1px solid rgba(245,158,11,.25)', color: 'var(--warn)', borderRadius: 6, padding: '.25rem .6rem', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                                Sign Out
                              </button>
                            )}
                            <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '.2rem .4rem', borderRadius: 4 }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
    </div>
  )
}
