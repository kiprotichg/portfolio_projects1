import { useState } from 'react'
import { api } from '../api.js'
import { ThemeToggle, Toast } from '../components/UI.jsx'

export default function LoginPage({ onAdminLogin, onUserEnter }) {
  const [mode, setMode] = useState('home') // home | login | register
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleAuth() {
    setLoading(true); setMsg(null)
    try {
      const data = mode === 'login'
        ? await api.login({ email: form.email, password: form.password })
        : await api.register({ name: form.name, email: form.email, password: form.password })
      onAdminLogin(data.admin, data.token)
    } catch (err) {
      setMsg({ type:'error', text: err.message })
    } finally { setLoading(false) }
  }

  const inputStyle = { width:'100%', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:'.7rem .9rem', fontSize:'.9rem', color:'var(--text)', outline:'none', fontFamily:'var(--font-body)', marginBottom:'.75rem', transition:'border-color .2s' }
  const btnStyle = { width:'100%', background:'linear-gradient(135deg,var(--accent),var(--accent2))', color:'#fff', border:'none', borderRadius:10, padding:'.88rem', fontSize:'.92rem', fontWeight:700, fontFamily:'var(--font-display)', cursor:'pointer', marginTop:'.25rem' }
  const linkStyle = { background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:'.82rem', fontWeight:600, fontFamily:'var(--font-body)', padding:0 }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>
      {/* Topbar */}
      <div style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)', padding:'.9rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', fontWeight:800, color:'var(--text)' }}>◈ AttendQR</span>
        <ThemeToggle />
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem 1.5rem', gap:'2rem' }}>
        {mode === 'home' && (
          <div className="fu" style={{ width:'100%', maxWidth:580, display:'flex', flexDirection:'column', alignItems:'center', gap:'2rem' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ display:'inline-block', fontSize:'.65rem', letterSpacing:'.15em', color:'var(--accent)', background:'var(--accent-s)', border:'1px solid var(--accent-b)', borderRadius:20, padding:'.3rem .9rem', marginBottom:'1.25rem', fontWeight:600 }}>QR-BASED ATTENDANCE SYSTEM</div>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3rem)', fontWeight:800, color:'var(--text)', lineHeight:1.1, letterSpacing:'-.03em', marginBottom:'.75rem' }}>
                Welcome to<br /><span style={{ color:'var(--accent)' }}>AttendQR</span>
              </h1>
              <p style={{ fontSize:'.95rem', color:'var(--text2)', lineHeight:1.7 }}>Universal attendance management for every industry.</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', width:'100%' }}>
              {/* Admin card */}
              <button onClick={() => setMode('login')} style={{ background:'var(--bg2)', border:'1.5px solid var(--border)', borderRadius:16, padding:'1.75rem 1.5rem', textAlign:'left', cursor:'pointer', transition:'all .2s', display:'flex', flexDirection:'column', gap:'.6rem', fontFamily:'var(--font-body)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                <span style={{ fontSize:'2rem' }}>🛡️</span>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:700, color:'var(--text)' }}>Admin</span>
                <span style={{ fontSize:'.82rem', color:'var(--text2)', lineHeight:1.6 }}>Manage sessions, generate QR codes, view logs and receive email alerts.</span>
                <span style={{ fontSize:'.78rem', color:'var(--accent)', fontWeight:600, marginTop:'.25rem' }}>Login / Register →</span>
              </button>

              {/* User card */}
              <button onClick={onUserEnter} style={{ background:'var(--bg2)', border:'1.5px solid var(--border)', borderRadius:16, padding:'1.75rem 1.5rem', textAlign:'left', cursor:'pointer', transition:'all .2s', display:'flex', flexDirection:'column', gap:'.6rem', fontFamily:'var(--font-body)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--green)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                <span style={{ fontSize:'2rem' }}>👤</span>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:700, color:'var(--text)' }}>Attendee</span>
                <span style={{ fontSize:'.82rem', color:'var(--text2)', lineHeight:1.6 }}>Sign in to a session, mark your attendance and sign out when leaving.</span>
                <span style={{ fontSize:'.78rem', color:'var(--green)', fontWeight:600, marginTop:'.25rem' }}>Enter as Attendee →</span>
              </button>
            </div>
            <p style={{ fontSize:'.74rem', color:'var(--text3)' }}>Admins need an account · Attendees enter freely</p>
          </div>
        )}

        {(mode === 'login' || mode === 'register') && (
          <div className="fu" style={{ width:'100%', maxWidth:400 }}>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, padding:'2rem', boxShadow:'var(--shadow)' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:800, color:'var(--text)', marginBottom:'.25rem' }}>
                {mode === 'login' ? 'Admin Login' : 'Create Admin Account'}
              </h2>
              <p style={{ fontSize:'.78rem', color:'var(--text3)', marginBottom:'1.5rem' }}>
                {mode === 'login' ? 'Sign in to your admin dashboard' : 'Register to start managing attendance'}
              </p>

              {mode === 'register' && (
                <input style={inputStyle} placeholder="Full Name" value={form.name} onChange={e=>set('name',e.target.value)} />
              )}
              <input style={inputStyle} type="email" placeholder="Email Address" value={form.email} onChange={e=>set('email',e.target.value)} />
              <input style={inputStyle} type="password" placeholder="Password" value={form.password} onChange={e=>set('password',e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAuth()} />

              <Toast msg={msg} />

              <button style={{ ...btnStyle, opacity: loading ? .7 : 1 }} onClick={handleAuth} disabled={loading}>
                {loading ? 'Please wait…' : mode === 'login' ? 'Login →' : 'Create Account →'}
              </button>

              <div style={{ marginTop:'1.25rem', textAlign:'center', fontSize:'.82rem', color:'var(--text3)' }}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button style={linkStyle} onClick={() => { setMode(mode==='login'?'register':'login'); setMsg(null) }}>
                  {mode === 'login' ? 'Register' : 'Login'}
                </button>
              </div>
              <div style={{ marginTop:'.75rem', textAlign:'center' }}>
                <button style={{ ...linkStyle, color:'var(--text3)' }} onClick={() => { setMode('home'); setMsg(null) }}>← Back</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
