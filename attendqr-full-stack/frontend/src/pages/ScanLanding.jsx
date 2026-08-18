import { useState, useEffect } from 'react'
import { api } from '../api.js'

export default function ScanLanding({ params, onDone }) {
  const [status, setStatus] = useState('loading')
  const [data,   setData]   = useState(null)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    if (!params?.session_id || !params?.attendee_ref) {
      setStatus('error'); setErrMsg('Invalid QR code.')
      return
    }
    doScan()
  }, [])

  async function doScan() {
    setStatus('loading')
    try {
      const res = await api.scanQR({
        session_id:   parseInt(params.session_id),
        attendee_ref: parseInt(params.attendee_ref),
      })
      setData(res)
      setStatus(res.action) // 'signin' | 'signout'
    } catch (err) {
      const code = err.code || err.message
      if      (code === 'qr_expired')    { setData(err.data); setStatus('expired') }
      else if (code === 'done_for_today') { setData(err.data); setStatus('done_today') }
      else { setStatus('error'); setErrMsg(err.message || 'Something went wrong.') }
    }
  }

  const green  = { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' }
  const amber  = { color: '#d97706', bg: '#fffbeb', border: '#fde68a' }
  const blue   = { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' }
  const red    = { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
  const purple = { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' }

  const themeMap = { loading: blue, signin: green, signout: amber, expired: red, done_today: purple, error: red }
  const th = themeMap[status] || red

  const iconMap = { loading: null, signin: '✅', signout: '👋', expired: '⏰', done_today: '🌙', error: '❌' }

  const titleMap = {
    loading:    'Processing…',
    signin:     `Welcome, ${data?.attendee?.name}!`,
    signout:    `Goodbye, ${data?.attendee?.name}!`,
    expired:    'QR Code Expired',
    done_today: 'Done for Today',
    error:      'Something went wrong',
  }

  const subMap = {
    loading:    'Please wait a moment',
    signin:     'You have been signed in. Scan again when you leave.',
    signout:    'You have been signed out for today.',
    expired:    'This QR code is no longer valid. Please contact your admin.',
    done_today: 'You have already signed in and out today. Come back tomorrow!',
    error:      errMsg,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem', fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* Logo */}
      <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-.02em' }}>◈ AttendQR</div>
        <div style={{ fontSize: '.68rem', color: '#94a3b8', letterSpacing: '.12em', textTransform: 'uppercase', marginTop: '.25rem' }}>Attendance System</div>
      </div>

      {/* Status badge */}
      {(status === 'signin' || status === 'signout') && (
        <div style={{ marginBottom: '1.25rem', background: th.bg, color: th.color, border: `1px solid ${th.border}`, borderRadius: 20, padding: '.4rem 1.1rem', fontSize: '.75rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
          {status === 'signin' ? '🟢 Signed In' : '🔴 Signed Out'}
        </div>
      )}

      {/* Main card */}
      <div style={{ width: '100%', maxWidth: 370, background: '#fff', border: `1.5px solid ${th.border}`, borderRadius: 22, padding: '2rem 1.75rem', textAlign: 'center', boxShadow: '0 10px 48px rgba(0,0,0,.1)', animation: 'popIn .4s cubic-bezier(.175,.885,.32,1.275)' }}>

        {/* Icon / spinner */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: th.bg, border: `2px solid ${th.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.2rem' }}>
          {status === 'loading'
            ? <div style={{ width: 34, height: 34, border: `3.5px solid ${th.color}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
            : iconMap[status]}
        </div>

        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '.5rem', lineHeight: 1.25 }}>{titleMap[status]}</h1>
        <p style={{ fontSize: '.85rem', color: '#475569', marginBottom: '1.5rem', lineHeight: 1.65 }}>{subMap[status]}</p>

        {/* ── Success details ── */}
        {(status === 'signin' || status === 'signout') && data && (
          <>
            <div style={{ background: th.bg, border: `1px solid ${th.border}`, borderRadius: 10, padding: '.75rem 1rem', marginBottom: '1rem', fontSize: '.84rem', color: th.color, fontWeight: 700 }}>
              🕐 {status === 'signin' ? 'Signed in at' : 'Signed out at'}: {data.time ? new Date(data.time).toLocaleTimeString() : new Date().toLocaleTimeString()}
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '.8rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.75rem', textAlign: 'left' }}>
              <span style={{ fontSize: '1.3rem' }}>📧</span>
              <div>
                <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#1d4ed8' }}>Admin Notified</div>
                <div style={{ fontSize: '.71rem', color: '#3b82f6', marginTop: '.1rem', lineHeight: 1.5 }}>An email alert was sent to the session admin.</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '.9rem', textAlign: 'left', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
              {[['Attendee', data.attendee?.name], ['Session', data.session?.name], ['Org', data.session?.org], ['Date', data.session?.date]]
                .filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '.38rem 0', borderBottom: '1px solid #f1f5f9', gap: '.75rem' }}>
                    <span style={{ fontSize: '.69rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em' }}>{k}</span>
                    <span style={{ fontSize: '.82rem', color: '#0f172a', fontWeight: 600, textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
            </div>

            <div style={{ background: th.bg, border: `1px solid ${th.border}`, borderRadius: 8, padding: '.65rem', marginBottom: '1.25rem', fontSize: '.78rem', color: th.color, fontWeight: 600 }}>
              {status === 'signin'
                ? `💡 Scan again when leaving to sign out. QR valid for ${data.days_left || 7} more day(s).`
                : `✅ Done for today! Come back tomorrow. QR valid for ${data.days_left || 7} more day(s).`}
            </div>
          </>
        )}

        {/* ── Done for today ── */}
        {status === 'done_today' && data && (
          <div style={{ background: purple.bg, border: `1px solid ${purple.border}`, borderRadius: 10, padding: '1rem', fontSize: '.8rem', color: '#5b21b6', marginBottom: '1.25rem', lineHeight: 1.8, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, marginBottom: '.4rem' }}>📅 Today's record:</div>
            🟢 Signed in: <strong>{data.sign_in_time ? new Date(data.sign_in_time).toLocaleTimeString() : '—'}</strong><br />
            🔴 Signed out: <strong>{data.sign_out_time ? new Date(data.sign_out_time).toLocaleTimeString() : '—'}</strong><br /><br />
            Your QR is still valid — come back <strong>tomorrow</strong> to sign in again.<br />
            <span style={{ fontSize: '.72rem', color: '#7c3aed' }}>({data.days_left || '?'} day(s) remaining on QR)</span>
          </div>
        )}

        {/* ── Expired ── */}
        {status === 'expired' && data?.expired_at && (
          <div style={{ background: red.bg, border: `1px solid ${red.border}`, borderRadius: 10, padding: '.85rem', fontSize: '.8rem', color: '#991b1b', marginBottom: '1.25rem', lineHeight: 1.65 }}>
            ⏰ Expired on: <strong>{new Date(data.expired_at).toLocaleDateString()}</strong><br />
            QR codes are valid for 7 days from registration. Please ask your admin for a new one.
          </div>
        )}

        {status === 'error' && (
          <button onClick={doScan} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '.82rem', fontSize: '.9rem', fontWeight: 700, cursor: 'pointer', marginBottom: '.75rem' }}>
            Try Again
          </button>
        )}

        <button onClick={onDone} style={{ width: '100%', background: 'none', border: '1px solid #e2e8f0', borderRadius: 10, padding: '.68rem', fontSize: '.82rem', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
          Back to Home
        </button>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg) } }
        @keyframes popIn { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  )
}
