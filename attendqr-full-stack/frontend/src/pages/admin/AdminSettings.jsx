import { useState } from 'react'
import { api } from '../../api.js'
import { Card, CardTitle, CardSub, Input, PrimaryBtn, Toast } from '../../components/UI.jsx'

export default function AdminSettings({ admin }) {
  const [email, setEmail]     = useState(admin?.email || '')
  const [msg, setMsg]         = useState(null)
  const [saving, setSaving]   = useState(false)
  const [testing, setTesting] = useState(false)

  async function handleSave() {
    if (!email.trim()) return
    setSaving(true); setMsg(null)
    try {
      await api.updateEmail({ email })
      setMsg({ type: 'ok', text: '✓ Notification email saved.' })
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally { setSaving(false) }
  }

  async function handleTestEmail() {
    setTesting(true); setMsg(null)
    try {
      const res = await fetch('/api/auth/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('aqr_token')}`
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setMsg({ type: 'ok', text: `📧 Test email sent to ${email}! Check your inbox.` })
    } catch (err) {
      setMsg({ type: 'error', text: `❌ ${err.message}` })
    } finally { setTesting(false) }
  }

  const step = (n, color, title, body) => (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.1rem', alignItems: 'flex-start' }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: color + '20', border: `1.5px solid ${color}50`, color, fontWeight: 800, fontSize: '.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '.88rem', marginBottom: '.25rem' }}>{title}</div>
        <div style={{ fontSize: '.8rem', color: 'var(--text2)', lineHeight: 1.7 }}>{body}</div>
      </div>
    </div>
  )

  return (
    <div className="fu">

      {/* Brevo setup guide */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.35rem' }}>
          <CardTitle>📧 Email Setup — Brevo (Free)</CardTitle>
          <span style={{ fontSize: '.68rem', fontWeight: 700, background: 'var(--green-s)', color: 'var(--green)', border: '1px solid rgba(34,197,94,.25)', borderRadius: 20, padding: '.2rem .7rem', letterSpacing: '.06em' }}>NO 2FA NEEDED</span>
        </div>
        <CardSub>300 free emails/day · No credit card · Works with any Gmail</CardSub>

        <div style={{ marginTop: '1rem' }}>
          {step(1, '#3b82f6', 'Create a FREE Brevo account',
            <span>Go to <a href="https://app.brevo.com/account/register" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>app.brevo.com/account/register</a> and sign up with <strong>gideonkipro001@gmail.com</strong>. It's free, no credit card needed.</span>
          )}

          {step(2, '#8b5cf6', 'Get your API Key',
            <span>After signing in → click your name (top right) → <strong>SMTP &amp; API</strong> → <strong>API Keys</strong> tab → click <strong>"Generate a new API key"</strong> → name it <em>AttendQR</em> → copy the key.</span>
          )}

          {step(3, '#f59e0b', 'Paste it into backend/.env',
            <div>
              <div style={{ marginBottom: '.5rem' }}>Open <code style={{ background: 'var(--bg3)', padding: '.15rem .5rem', borderRadius: 5, fontSize: '.78rem' }}>backend/.env</code> and update it:</div>
              <div style={{ background: '#0d1117', borderRadius: 10, padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '.8rem', lineHeight: 2, color: '#e2e8f0', whiteSpace: 'pre' }}>
<span style={{ color: '#94a3b8' }}># Paste your key from Brevo here:</span>{'\n'}
<span style={{ color: '#7dd3fc' }}>BREVO_API_KEY</span>=<span style={{ color: '#86efac' }}>xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</span>{'\n'}
<span style={{ color: '#7dd3fc' }}>BREVO_SENDER_EMAIL</span>=<span style={{ color: '#86efac' }}>gideonkipro001@gmail.com</span>{'\n'}
<span style={{ color: '#7dd3fc' }}>BREVO_SENDER_NAME</span>=<span style={{ color: '#86efac' }}>AttendQR</span>
              </div>
            </div>
          )}

          {step(4, '#22c55e', 'Restart backend & test',
            <span>Stop backend terminal (<kbd style={{ background: 'var(--bg3)', padding: '.1rem .4rem', borderRadius: 4, fontSize: '.76rem', border: '1px solid var(--border)' }}>Ctrl+C</kbd>) → run <code style={{ background: 'var(--bg3)', padding: '.1rem .5rem', borderRadius: 5, fontSize: '.78rem' }}>npm start</code> again → you should see <strong style={{ color: 'var(--green)' }}>✅ Brevo email ready</strong> → then click the test button below.</span>
          )}
        </div>
      </Card>

      {/* Email + test */}
      <Card>
        <CardTitle>Notification Email Address</CardTitle>
        <CardSub>Attendance alerts will be sent here whenever someone signs in or out.</CardSub>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 500, marginTop: '.5rem' }}>
          <Input label="Admin Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />

          <Toast msg={msg} />

          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <PrimaryBtn onClick={handleSave} style={{ flex: 1, opacity: saving ? .7 : 1 }} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save Email'}
            </PrimaryBtn>

            <button onClick={handleTestEmail} disabled={testing} style={{
              flex: 1, background: 'var(--green-s)', border: '1px solid rgba(34,197,94,.3)',
              color: 'var(--green)', borderRadius: 10, padding: '.88rem', fontSize: '.9rem',
              fontWeight: 700, fontFamily: 'var(--font-display)', cursor: testing ? 'not-allowed' : 'pointer',
              opacity: testing ? .7 : 1
            }}>
              {testing ? '⏳ Sending…' : '📧 Send Test Email'}
            </button>
          </div>

          <div style={{ fontSize: '.76rem', color: 'var(--text2)', lineHeight: 1.7, padding: '.75rem 1rem', background: 'var(--accent-s)', border: '1px solid var(--accent-b)', borderRadius: 10 }}>
            💡 <strong>Tip:</strong> The test email lets you confirm everything works before your first event. Check spam if it doesn't appear within 30 seconds. Watch the backend terminal for detailed error messages.
          </div>
        </div>
      </Card>

      {/* Account info */}
      <Card>
        <CardTitle>Account Info</CardTitle>
        {[['Name', admin?.name], ['Login Email', admin?.email], ['Joined', admin?.created_at?.slice(0, 10)]].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '.6rem 0', borderBottom: '1px solid var(--border)', gap: '1rem' }}>
            <span style={{ fontSize: '.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{k}</span>
            <span style={{ fontSize: '.85rem', color: 'var(--text)', fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}
