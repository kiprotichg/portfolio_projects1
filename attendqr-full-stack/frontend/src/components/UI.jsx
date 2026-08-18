import { useTheme } from '../context/ThemeContext.jsx'

const c = {
  card:    { background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:'1.75rem', marginBottom:'1.25rem', boxShadow:'var(--shadow-s)' },
  title:   { fontFamily:'var(--font-display)', fontSize:'1.05rem', fontWeight:700, color:'var(--text)', marginBottom:'.2rem' },
  sub:     { fontSize:'.76rem', color:'var(--text3)', marginBottom:'1.25rem' },
  inp:     { background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:'.65rem .9rem', fontSize:'.87rem', color:'var(--text)', width:'100%', outline:'none', transition:'border-color .2s, box-shadow .2s', fontFamily:'var(--font-body)' },
  lbl:     { fontSize:'.68rem', letterSpacing:'.08em', color:'var(--text3)', marginBottom:'.35rem', textTransform:'uppercase', fontWeight:600, display:'block' },
  primaryBtn: { width:'100%', background:'linear-gradient(135deg,var(--accent),var(--accent2))', color:'#fff', border:'none', borderRadius:10, padding:'.88rem', fontSize:'.9rem', fontWeight:700, fontFamily:'var(--font-display)', cursor:'pointer', transition:'filter .15s', letterSpacing:'.02em' },
  secondaryBtn: { background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text2)', borderRadius:8, padding:'.5rem 1rem', fontSize:'.8rem', fontWeight:600, cursor:'pointer', transition:'all .2s', fontFamily:'var(--font-body)' },
  dangerBtn: { background:'var(--red-s)', border:'1px solid rgba(239,68,68,.25)', color:'var(--red)', borderRadius:8, padding:'.4rem .8rem', fontSize:'.76rem', fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)' },
}

export function Card({ children, style }) { return <div style={{ ...c.card, ...style }}>{children}</div> }
export function CardTitle({ children }) { return <div style={c.title}>{children}</div> }
export function CardSub({ children }) { return <div style={c.sub}>{children}</div> }

export function Input({ label, error, style, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', marginBottom: error ? 0 : '.1rem' }}>
      {label && <label style={c.lbl}>{label}</label>}
      <input style={{ ...c.inp, ...(error ? { borderColor:'var(--red)' } : {}), ...style }} {...props} />
      {error && <span style={{ fontSize:'.7rem', color:'var(--red)', marginTop:'.25rem' }}>{error}</span>}
    </div>
  )
}

export function Select({ label, error, children, style, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      {label && <label style={c.lbl}>{label}</label>}
      <select style={{ ...c.inp, ...(error ? { borderColor:'var(--red)' } : {}), ...style }} {...props}>{children}</select>
      {error && <span style={{ fontSize:'.7rem', color:'var(--red)', marginTop:'.25rem' }}>{error}</span>}
    </div>
  )
}

export function Textarea({ label, style, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      {label && <label style={c.lbl}>{label}</label>}
      <textarea style={{ ...c.inp, resize:'vertical', minHeight:72, ...style }} {...props} />
    </div>
  )
}

export function PrimaryBtn({ children, style, ...props }) {
  return <button style={{ ...c.primaryBtn, ...style }} {...props}>{children}</button>
}

export function SecondaryBtn({ children, style, ...props }) {
  return <button style={{ ...c.secondaryBtn, ...style }} {...props}>{children}</button>
}

export function DangerBtn({ children, style, ...props }) {
  return <button style={{ ...c.dangerBtn, ...style }} {...props}>{children}</button>
}

export function Toast({ msg }) {
  if (!msg) return null
  const colors = {
    ok:   { bg:'var(--green-s)', color:'var(--green)', border:'rgba(34,197,94,.25)' },
    error:{ bg:'var(--red-s)',   color:'var(--red)',   border:'rgba(239,68,68,.25)' },
    warn: { bg:'var(--warn-s)',  color:'var(--warn)',  border:'rgba(245,158,11,.25)' },
  }
  const col = colors[msg.type] || colors.ok
  return (
    <div style={{ marginTop:'.75rem', padding:'.65rem 1rem', borderRadius:8, fontSize:'.82rem', fontWeight:600, background:col.bg, color:col.color, border:`1px solid ${col.border}` }}>
      {msg.text}
    </div>
  )
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'.4rem .85rem', fontSize:'.8rem', fontWeight:600, color:'var(--text2)', cursor:'pointer', display:'flex', alignItems:'center', gap:'.4rem', transition:'all .2s', fontFamily:'var(--font-body)' }}>
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}

export function Topbar({ role, name, onBack, right }) {
  const roleColors = { admin: { bg:'var(--accent-s)', color:'var(--accent)', border:'var(--accent-b)' }, user: { bg:'var(--green-s)', color:'var(--green)', border:'rgba(34,197,94,.25)' } }
  const rc = roleColors[role] || roleColors.admin
  return (
    <header style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)', padding:'.85rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'.75rem', position:'sticky', top:0, zIndex:100, boxShadow:'var(--shadow-s)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'1.15rem', fontWeight:800, color:'var(--text)' }}>◈ AttendQR</span>
        <span style={{ fontSize:'.7rem', fontWeight:600, padding:'.25rem .7rem', borderRadius:20, background:rc.bg, color:rc.color, border:`1px solid ${rc.border}` }}>
          {role === 'admin' ? `🛡️ ${name || 'Admin'}` : '👤 Attendee'}
        </span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'.6rem', flexWrap:'wrap' }}>
        {right}
        <ThemeToggle />
        <button onClick={onBack} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'.4rem .85rem', fontSize:'.78rem', fontWeight:600, color:'var(--text2)', cursor:'pointer', transition:'all .2s', fontFamily:'var(--font-body)' }}>
          ← {role === 'admin' ? 'Logout' : 'Back'}
        </button>
      </div>
    </header>
  )
}

export function Grid2({ children }) {
  return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>{children}</div>
}

export function Spinner() {
  return <div style={{ textAlign:'center', padding:'2rem', color:'var(--text3)', fontSize:'.9rem' }}>Loading…</div>
}

export function Empty({ icon = '📭', text }) {
  return <div style={{ textAlign:'center', padding:'2.5rem', color:'var(--text3)', display:'flex', flexDirection:'column', alignItems:'center', gap:'.75rem', fontSize:'.88rem' }}><span style={{ fontSize:'2rem' }}>{icon}</span>{text}</div>
}

export const styles = c
