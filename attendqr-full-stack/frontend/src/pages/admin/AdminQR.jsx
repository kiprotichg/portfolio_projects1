import { useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { api } from '../../api.js'
import { Card, CardTitle, CardSub, Input, PrimaryBtn, Toast, Empty, Spinner } from '../../components/UI.jsx'

export default function AdminQR({ session, onGoLog }) {
  const [attendees, setAttendees] = useState([])
  const [selected,  setSelected]  = useState(null)
  const [form,      setForm]      = useState({ name: '', attendee_id: '', email: '', phone: '' })
  const [msg,       setMsg]       = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [fetching,  setFetching]  = useState(false)
  const [pcIp,      setPcIp]      = useState(() => localStorage.getItem('aqr_pc_ip') || '')
  const [showHelp,  setShowHelp]  = useState(false)

  function saveIp(val) { setPcIp(val); localStorage.setItem('aqr_pc_ip', val) }

  const baseUrl = pcIp ? `http://${pcIp}:5173` : window.location.origin

  function buildQRUrl(attendee) {
    // No 'type' param needed — backend decides sign-in vs sign-out automatically
    return `${baseUrl}/?attend=1&session=${session.id}&attendee=${attendee.id}`
  }

  useEffect(() => {
    if (!session) return
    setFetching(true)
    api.getAttendees(session.id).then(setAttendees).finally(() => setFetching(false))
  }, [session?.id])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleAdd() {
    if (!form.name.trim()) { setMsg({ type: 'warn', text: 'Name is required' }); return }
    setLoading(true); setMsg(null)
    try {
      const a = await api.addAttendee(session.id, form)
      setAttendees(prev => [...prev, a])
      setForm({ name: '', attendee_id: '', email: '', phone: '' })
      setMsg({ type: 'ok', text: `✓ ${a.name} added. QR code is ready.` })
      setSelected(a)
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally { setLoading(false) }
    setTimeout(() => setMsg(null), 3000)
  }

  async function handleRemove(id) {
    await api.deleteAttendee(session.id, id)
    setAttendees(prev => prev.filter(a => a.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  function downloadQR(attendee) {
    const el = document.getElementById(`qr-dl-${attendee.id}`)?.querySelector('canvas')
    if (!el) return
    const a = document.createElement('a')
    a.download = `${attendee.name}-qr.png`
    a.href = el.toDataURL('image/png')
    a.click()
  }

  if (!session) return (
    <div className="fu"><Card><Empty icon="🔲" text="Create a session first to manage QR codes." /></Card></div>
  )

  return (
    <div className="fu" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

      {/* ── LEFT ── */}
      <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* PC IP banner */}
        <Card style={{ marginBottom: 0, border: pcIp ? '1px solid rgba(34,197,94,.35)' : '1.5px solid var(--warn)', background: pcIp ? 'var(--green-s)' : 'var(--warn-s)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
            <div style={{ fontWeight: 700, color: pcIp ? 'var(--green)' : 'var(--warn)', fontSize: '.85rem' }}>
              {pcIp ? `✅ Phone URL: http://${pcIp}:5173` : '⚠️ Enter your PC IP for phone scanning'}
            </div>
            <button onClick={() => setShowHelp(!showHelp)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '.76rem', fontFamily: 'var(--font-body)' }}>
              {showHelp ? 'Hide ▲' : 'How? ▼'}
            </button>
          </div>
          {showHelp && (
            <div style={{ fontSize: '.77rem', color: 'var(--text2)', lineHeight: 1.75, marginBottom: '.75rem', padding: '.75rem', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
              1. Open PowerShell → run: <code style={{ background: 'var(--bg3)', padding: '.1rem .4rem', borderRadius: 4 }}>ipconfig</code><br />
              2. Find <strong>IPv4 Address</strong> under Wireless LAN (e.g. <code>192.168.1.105</code>)<br />
              3. Paste below — <strong>phone must be on the same WiFi as your PC</strong>
            </div>
          )}
          <div style={{ display: 'flex', gap: '.6rem' }}>
            <input style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '.6rem .85rem', fontSize: '.85rem', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-body)' }}
              placeholder="e.g. 192.168.1.105" value={pcIp} onChange={e => saveIp(e.target.value.trim())} />
            {pcIp && <button onClick={() => saveIp('')} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '.6rem .85rem', color: 'var(--text3)', cursor: 'pointer', fontSize: '.8rem', fontFamily: 'var(--font-body)' }}>Clear</button>}
          </div>
        </Card>

        {/* How it works callout */}
        <Card style={{ marginBottom: 0, background: 'var(--accent-s)', border: '1px solid var(--accent-b)' }}>
          <div style={{ fontSize: '.82rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '.4rem' }}>🔄 One QR — Smart Toggle</div>
          <div style={{ fontSize: '.78rem', color: 'var(--text2)', lineHeight: 1.8 }}>
            Each attendee gets <strong>one QR code</strong>.<br />
            • <strong>1st scan</strong> → Signs them <span style={{ color: 'var(--green)', fontWeight: 700 }}>IN</span><br />
            • <strong>2nd scan</strong> → Signs them <span style={{ color: 'var(--red)', fontWeight: 700 }}>OUT</span><br />
            • <strong>3rd scan</strong> → Signs them <span style={{ color: 'var(--green)', fontWeight: 700 }}>IN</span> again, etc.
          </div>
        </Card>

        {/* Add attendee */}
        <Card style={{ marginBottom: 0 }}>
          <CardTitle>Register Attendees</CardTitle>
          <CardSub>Each attendee gets one QR code for sign-in and sign-out.</CardSub>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            <Input label="Full Name *" placeholder="e.g. Jane Wambui" value={form.name} onChange={e => set('name', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
              <Input label="ID / Badge" placeholder="EMP-001" value={form.attendee_id} onChange={e => set('attendee_id', e.target.value)} />
              <Input label="Email" type="email" placeholder="jane@…" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <Input label="Phone" placeholder="+254…" value={form.phone} onChange={e => set('phone', e.target.value)} />
            <Toast msg={msg} />
            <PrimaryBtn onClick={handleAdd} style={{ opacity: loading ? .7 : 1 }} disabled={loading}>
              {loading ? 'Adding…' : '+ Add Attendee & Generate QR'}
            </PrimaryBtn>
          </div>
        </Card>

        {/* Attendee list */}
        <Card style={{ marginBottom: 0 }}>
          <CardTitle>Registered Attendees</CardTitle>
          <CardSub>{attendees.length} people</CardSub>
          {fetching ? <Spinner /> : attendees.length === 0 ? (
            <Empty icon="👥" text="No attendees yet. Add them above." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '.5rem' }}>
              {attendees.map(a => (
                <div key={a.id} onClick={() => setSelected(a)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem 1rem', borderRadius: 10, cursor: 'pointer', background: selected?.id === a.id ? 'var(--accent-s)' : 'var(--bg3)', border: `1px solid ${selected?.id === a.id ? 'var(--accent)' : 'var(--border)'}`, transition: 'all .15s', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '.88rem' }}>{a.name}</div>
                    <div style={{ fontSize: '.71rem', color: 'var(--text3)', marginTop: '.1rem' }}>
                      {[a.attendee_id, a.email, a.phone].filter(Boolean).join(' · ') || 'No extra info'}
                    </div>
                    <div style={{ display: 'flex', gap: '.35rem', marginTop: '.3rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '.63rem', fontWeight: 600, padding: '.1rem .4rem', borderRadius: 10,
                        background: (a.scan_count||0) >= 2 ? '#fee2e2' : '#dcfce7',
                        color: (a.scan_count||0) >= 2 ? '#dc2626' : '#16a34a',
                        border: `1px solid ${(a.scan_count||0) >= 2 ? '#fca5a5' : '#86efac'}` }}>
                        {(a.scan_count||0) >= 2 ? '🔒 Used' : `${a.scan_count||0}/2 scans`}
                      </span>
                      {a.qr_expires_at && (() => {
                        const d = Math.ceil((new Date(a.qr_expires_at) - new Date()) / 86400000)
                        return <span style={{ fontSize: '.63rem', fontWeight: 600, padding: '.1rem .4rem', borderRadius: 10,
                          background: d <= 0 ? '#fee2e2' : d <= 2 ? '#fef3c7' : 'var(--bg2)',
                          color: d <= 0 ? '#dc2626' : d <= 2 ? '#d97706' : 'var(--text3)',
                          border: '1px solid var(--border)' }}>
                          {d <= 0 ? '⏰ Expired' : `⏳ ${d}d left`}
                        </span>
                      })()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '.4rem' }}>
                    <button onClick={e => { e.stopPropagation(); setSelected(a) }} style={{ background: 'var(--accent-s)', color: 'var(--accent)', border: '1px solid var(--accent-b)', borderRadius: 6, padding: '.25rem .55rem', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>QR</button>
                    <button onClick={e => { e.stopPropagation(); handleRemove(a.id) }} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '.2rem .35rem' }}>✕</button>
                  </div>
                  {/* Hidden canvas for download */}
                  <div id={`qr-dl-${a.id}`} style={{ display: 'none' }}>
                    <QRCodeCanvas value={buildQRUrl(a)} size={400} level="H" bgColor="#ffffff" fgColor="#0d1117" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── RIGHT: QR display ── */}
      <div style={{ flex: '0 0 auto', width: 300 }}>
        <Card style={{ marginBottom: 0, position: 'sticky', top: 80 }}>
          {!selected ? (
            <Empty icon="👈" text="Select an attendee to see their QR code." />
          ) : (
            <>
              <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '.1rem' }}>{selected.name}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginBottom: '1rem' }}>{selected.attendee_id || 'No badge ID'}</div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                {/* QR Code */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '1.1rem', boxShadow: '0 0 0 4px var(--accent-s)', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem' }}>
                  <QRCodeCanvas value={buildQRUrl(selected)} size={200} level="H" bgColor="#ffffff" fgColor="#0d1117" />
                  <div style={{ fontSize: '.65rem', color: '#64748b', textAlign: 'center', maxWidth: 195, lineHeight: 1.5 }}>
                    🔄 Sign In &amp; Sign Out<br />
                    {pcIp ? `→ http://${pcIp}:5173` : '⚠️ Set PC IP above for phones'}
                  </div>
                </div>

                {/* Instructions */}
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '.85rem', width: '100%', fontSize: '.76rem', color: 'var(--text2)', lineHeight: 1.9 }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: '.3rem' }}>📱 How attendee uses this QR</div>
                  🟢 <strong>Scan on arrival</strong> → signed in<br />
                  🔴 <strong>Scan when leaving</strong> → signed out<br />
                  📧 You get an email for both actions
                </div>

                <button onClick={() => downloadQR(selected)} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--accent)', borderRadius: 8, padding: '.55rem 1.2rem', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', width: '100%', fontFamily: 'var(--font-body)' }}>
                  ↓ Download QR PNG
                </button>

                <button onClick={() => onGoLog(session)} style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))', color: '#fff', border: 'none', borderRadius: 8, padding: '.6rem 1.2rem', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: 'var(--font-display)' }}>
                  View Attendance Log →
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
