const axios = require('axios')
require('dotenv').config()

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email'

// ── Check config on startup ────────────────────────────────────
async function verifyMailer() {
  const key    = process.env.BREVO_API_KEY
  const sender = process.env.BREVO_SENDER_EMAIL

  if (!key || key === 'your_brevo_api_key_here') {
    console.warn('⚠️  Email NOT configured.')
    console.warn('   Sign up FREE at https://app.brevo.com')
    console.warn('   Then paste your API key into backend/.env → BREVO_API_KEY')
    return false
  }

  // Verify API key works by calling account info endpoint
  try {
    await axios.get('https://api.brevo.com/v3/account', {
      headers: { 'api-key': key }
    })
    console.log(`✅ Brevo email ready — sender: ${sender}`)
    return true
  } catch (err) {
    const status = err.response?.status
    if (status === 401) {
      console.error('❌ Brevo API key is invalid. Generate a new one at:')
      console.error('   https://app.brevo.com → Settings → SMTP & API → API Keys')
    } else {
      console.error('❌ Brevo connection error:', err.message)
    }
    return false
  }
}

// ── HTML row helper ────────────────────────────────────────────
function row(label, value) {
  return `<tr>
    <td style="padding:9px 12px;color:#64748b;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.07em;width:38%;vertical-align:top;border-bottom:1px solid #f1f5f9;background:#f8fafc;">${label}</td>
    <td style="padding:9px 12px;color:#0f172a;font-size:0.85rem;font-weight:500;border-bottom:1px solid #f1f5f9;">${value}</td>
  </tr>`
}

// ── Send attendance alert ──────────────────────────────────────
async function sendAttendanceAlert({ adminEmail, adminName, session, attendee, type }) {
  const key = process.env.BREVO_API_KEY
  if (!key || key === 'your_brevo_api_key_here') {
    console.warn('📧 Email skipped — BREVO_API_KEY not set in .env')
    return false
  }

  const isSignIn = type === 'signin'
  const color    = isSignIn ? '#22c55e' : '#f59e0b'
  const action   = isSignIn ? 'Signed In' : 'Signed Out'
  const timeVal  = isSignIn
    ? (attendee.sign_in_time  || new Date().toISOString())
    : (attendee.sign_out_time || new Date().toISOString())

  const subject = isSignIn
    ? `✅ ${attendee.name} signed in — ${session.event_name}`
    : `👋 ${attendee.name} signed out — ${session.event_name}`

  const tableRows = [
    row('Attendee',     `<strong>${attendee.name || '—'}</strong>`),
    attendee.attendee_id ? row('ID / Badge', attendee.attendee_id) : '',
    row('Event',        session.event_name  || '—'),
    row('Organization', session.org_name    || '—'),
    row('Industry',     session.industry    || '—'),
    row('Date',         session.date        || '—'),
    session.location   ? row('Location', session.location) : '',
    row(isSignIn ? 'Signed In At' : 'Signed Out At',
        `<span style="color:${color};font-weight:700;">${timeVal}</span>`),
  ].join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:580px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

    <!-- Header -->
    <div style="background:#0d1117;padding:24px 32px;">
      <span style="font-size:1.35rem;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">◈ AttendQR</span>
      <span style="background:${color};color:#fff;font-size:0.68rem;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:0.08em;text-transform:uppercase;margin-left:12px;">${action}</span>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#475569;font-size:0.92rem;margin:0 0 10px;">Hi <strong>${adminName || 'Admin'}</strong>,</p>
      <p style="color:#0f172a;font-size:1.05rem;font-weight:600;margin:0 0 24px;line-height:1.5;">
        ${isSignIn ? '✅' : '👋'} <strong>${attendee.name}</strong> has
        ${isSignIn ? 'signed in to' : 'signed out from'}
        <strong>${session.event_name}</strong>.
      </p>

      <!-- Details -->
      <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          ${tableRows}
        </table>
      </div>

      <!-- Email badge -->
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;margin-bottom:20px;display:flex;align-items:center;gap:10px;">
        <span style="font-size:1.4rem;">📧</span>
        <div>
          <div style="font-weight:700;color:#1d4ed8;font-size:0.82rem;margin-bottom:2px;">Admin Notified</div>
          <div style="color:#3b82f6;font-size:0.76rem;">This alert was sent automatically when the attendee scanned their QR code.</div>
        </div>
      </div>

      <p style="color:#94a3b8;font-size:0.76rem;margin:0;line-height:1.6;">
        Log in to your AttendQR admin dashboard to view the full attendance log and export reports.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 32px;text-align:center;">
      <p style="color:#cbd5e1;font-size:0.72rem;margin:0;">◈ AttendQR · Automated Attendance Notifications · Powered by Brevo</p>
    </div>
  </div>
</body>
</html>`

  try {
    await axios.post(BREVO_URL, {
      sender: {
        name:  process.env.BREVO_SENDER_NAME  || 'AttendQR',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@attendqr.com'
      },
      to: [{ email: adminEmail, name: adminName || 'Admin' }],
      subject,
      htmlContent: html
    }, {
      headers: {
        'api-key':      key,
        'Content-Type': 'application/json',
        'Accept':       'application/json'
      }
    })

    console.log(`📧 Email sent ✓ → ${adminEmail} | ${action} | ${attendee.name}`)
    return true
  } catch (err) {
    const status  = err.response?.status
    const detail  = err.response?.data?.message || err.message
    console.error(`❌ Email FAILED → ${adminEmail} | ${action} | ${attendee.name}`)
    console.error(`   Status: ${status} | Detail: ${detail}`)
    if (status === 401) console.error('   Fix: Invalid BREVO_API_KEY in .env')
    if (status === 400) console.error('   Fix: Sender email not verified on Brevo account')
    return false
  }
}

// ── Test email ─────────────────────────────────────────────────
async function sendTestEmail(adminEmail, adminName) {
  const key = process.env.BREVO_API_KEY
  if (!key || key === 'your_brevo_api_key_here') {
    throw new Error('BREVO_API_KEY not set in backend/.env')
  }

  try {
    await axios.post(BREVO_URL, {
      sender: {
        name:  process.env.BREVO_SENDER_NAME  || 'AttendQR',
        email: process.env.BREVO_SENDER_EMAIL || adminEmail
      },
      to: [{ email: adminEmail, name: adminName || 'Admin' }],
      subject: '✅ AttendQR — Email Notifications Working!',
      htmlContent: `<!DOCTYPE html>
<html><body style="font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;margin:0;padding:32px;">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,.08);">
  <div style="font-size:1.3rem;font-weight:800;color:#0d1117;margin-bottom:16px;">◈ AttendQR</div>
  <div style="font-size:3rem;margin-bottom:12px;">✅</div>
  <h2 style="color:#0f172a;margin:0 0 10px;font-size:1.3rem;">Email notifications are working!</h2>
  <p style="color:#475569;font-size:0.92rem;line-height:1.7;margin:0 0 20px;">
    Hi <strong>${adminName}</strong>! Your AttendQR email alerts are configured correctly via <strong>Brevo</strong>.
    You will receive instant notifications every time an attendee signs in or out.
  </p>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;color:#15803d;font-size:0.85rem;line-height:1.6;">
    📧 Alerts will be delivered to: <strong>${adminEmail}</strong>
  </div>
</div>
</body></html>`
    }, {
      headers: {
        'api-key':      key,
        'Content-Type': 'application/json',
        'Accept':       'application/json'
      }
    })

    console.log(`📧 Test email sent to ${adminEmail}`)
    return true
  } catch (err) {
    const detail = err.response?.data?.message || err.message
    console.error('❌ Test email failed:', detail)
    throw new Error(detail)
  }
}

module.exports = { sendAttendanceAlert, verifyMailer, sendTestEmail }
