const express = require('express')
const { stmts } = require('../db')
const auth = require('../middleware/auth')
const { sendAttendanceAlert } = require('../mailer')

const router = express.Router()

function fireEmail(payload) {
  sendAttendanceAlert(payload)
    .then(ok => { if (!ok) console.warn('📧 Email not sent — check .env config') })
    .catch(err => console.error('📧 Email error:', err.message))
}

function todayStr() {
  const d = new Date()
  const pad = n => String(n).padStart(2,'0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
}

// ── SMART QR SCAN ─────────────────────────────────────────────
// Rules:
//   1. QR expires 7 days after registration (Monday → Monday)
//   2. Each day: 1st scan = sign in, 2nd scan = sign out
//   3. After signing out for the day → blocked until tomorrow
router.post('/scan', async (req, res) => {
  try {
    const { session_id, attendee_ref } = req.body
    if (!session_id || !attendee_ref)
      return res.status(400).json({ error: 'session_id and attendee_ref required' })

    const session  = await stmts.getSessionById(session_id)
    if (!session)  return res.status(404).json({ error: 'Session not found' })
    const attendee = await stmts.getAttendeeById(attendee_ref)
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' })
    const admin    = await stmts.getAdminById(session.admin_id)

    // ── Rule 1: Check QR expiry ──────────────────────────────
    if (attendee.qr_expires_at) {
      const expiry = new Date(attendee.qr_expires_at)
      if (new Date() > expiry) {
        return res.status(403).json({
          error:      'qr_expired',
          message:    'This QR code has expired.',
          sub:        `Valid for 7 days. Expired on ${expiry.toLocaleDateString()}.`,
          expired_at: attendee.qr_expires_at
        })
      }
    }

    const today = todayStr()
    const daysLeft = attendee.qr_expires_at
      ? Math.ceil((new Date(attendee.qr_expires_at) - new Date()) / 86400000)
      : 7

    // ── Rule 2: Check if already completed sign-in+out today ──
    const todayRecord = await stmts.getTodayRecord(session_id, attendee.name, today)

    if (todayRecord && todayRecord.sign_out_time) {
      // Already fully signed in AND out today → come back tomorrow
      return res.status(403).json({
        error:   'done_for_today',
        message: 'You have already signed in and out today.',
        sub:     'Come back tomorrow to sign in again. Your QR is still valid.',
        days_left: daysLeft,
        sign_in_time:  todayRecord.sign_in_time,
        sign_out_time: todayRecord.sign_out_time
      })
    }

    if (todayRecord && !todayRecord.sign_out_time) {
      // ── Already signed in today → SIGN OUT ──────────────
      await stmts.signOut(todayRecord.id)
      const updated = await stmts.getAttendanceById(todayRecord.id)
      console.log(`🔴 Sign-out: ${attendee.name} → "${session.event_name}"`)

      if (admin?.email) fireEmail({
        adminEmail: admin.email, adminName: admin.name, session,
        attendee: { name: attendee.name, attendee_id: attendee.attendee_id || '', sign_out_time: updated.sign_out_time },
        type: 'signout'
      })

      return res.json({
        success:   true,
        action:    'signout',
        message:   `Goodbye, ${attendee.name}!`,
        sub:       'Signed out for today. Admin has been notified.',
        time:      updated.sign_out_time,
        days_left: daysLeft,
        attendee:  { name: attendee.name, id: attendee.attendee_id },
        session:   { name: session.event_name, date: session.date, org: session.org_name },
        qr_expires_at: attendee.qr_expires_at
      })
    }

    // ── No record today → SIGN IN ────────────────────────────
    const result = await stmts.markSignIn(session_id, attendee.id, attendee.name, attendee.attendee_id)
    const record  = await stmts.getAttendanceById(result.lastID)
    console.log(`🟢 Sign-in:  ${attendee.name} → "${session.event_name}"`)

    if (admin?.email) fireEmail({
      adminEmail: admin.email, adminName: admin.name, session,
      attendee: { name: attendee.name, attendee_id: attendee.attendee_id || '', sign_in_time: record.sign_in_time },
      type: 'signin'
    })

    return res.json({
      success:   true,
      action:    'signin',
      message:   `Welcome, ${attendee.name}!`,
      sub:       'Attendance recorded. Admin has been notified.',
      time:      record.sign_in_time,
      days_left: daysLeft,
      attendee:  { name: attendee.name, id: attendee.attendee_id },
      session:   { name: session.event_name, date: session.date, org: session.org_name },
      qr_expires_at: attendee.qr_expires_at
    })

  } catch (err) {
    console.error('Scan error:', err)
    res.status(500).json({ error: err.message })
  }
})

router.post('/signin', auth, async (req, res) => {
  try {
    const { session_id, attendee_name, attendee_badge } = req.body
    if (!session_id || !attendee_name) return res.status(400).json({ error: 'session_id and attendee_name required' })
    const session = await stmts.getSessionById(session_id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    const dup = await stmts.checkDuplicate(session_id, attendee_name)
    if (dup) return res.status(409).json({ error: `"${attendee_name}" is already signed in.` })
    const result = await stmts.markSignIn(session_id, null, attendee_name, attendee_badge || '')
    const record  = await stmts.getAttendanceById(result.lastID)
    const admin   = await stmts.getAdminById(session.admin_id)
    if (admin?.email) fireEmail({ adminEmail: admin.email, adminName: admin.name, session, attendee: { name: attendee_name, attendee_id: attendee_badge || '', sign_in_time: record.sign_in_time }, type: 'signin' })
    res.json({ message: 'Signed in successfully', record })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/signout/:id', async (req, res) => {
  try {
    const record = await stmts.getAttendanceById(req.params.id)
    if (!record)              return res.status(404).json({ error: 'Record not found' })
    if (record.sign_out_time) return res.status(400).json({ error: 'Already signed out' })
    await stmts.signOut(req.params.id)
    const updated = await stmts.getAttendanceById(req.params.id)
    const session  = await stmts.getSessionById(record.session_id)
    const admin    = await stmts.getAdminById(session.admin_id)
    if (admin?.email) fireEmail({ adminEmail: admin.email, adminName: admin.name, session, attendee: { name: record.attendee_name, attendee_id: record.attendee_badge || '', sign_out_time: updated.sign_out_time }, type: 'signout' })
    res.json({ success: true, record: updated })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/session/:id', auth, async (req, res) => {
  try { res.json(await stmts.getBySession(req.params.id)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/lookup', async (req, res) => {
  try {
    const { name } = req.query
    if (!name) return res.status(400).json({ error: 'name required' })
    res.json(await stmts.getByName(name))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/:id', auth, async (req, res) => {
  try { await stmts.deleteAttendance(req.params.id); res.json({ message: 'Deleted' }) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
