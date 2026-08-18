const express = require('express')
const { stmts } = require('../db')
const auth = require('../middleware/auth')

const router = express.Router()

// Create session
router.post('/', auth, async (req, res) => {
  try {
    const { org_name, industry, event_name, date, location, notes } = req.body
    if (!org_name || !industry || !event_name || !date)
      return res.status(400).json({ error: 'org_name, industry, event_name, date required' })
    const result = await stmts.createSession(req.admin.id, org_name, industry, event_name, date, location || '', notes || '')
    const session = await stmts.getSessionById(result.lastID)
    res.json(session)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Get admin's sessions
router.get('/', auth, async (req, res) => {
  try {
    res.json(await stmts.getSessionsByAdmin(req.admin.id))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Public sessions list (for attendee dropdown)
router.get('/public', async (req, res) => {
  try {
    res.json(await stmts.getAllSessions())
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Get single session (public)
router.get('/:id', async (req, res) => {
  try {
    const session = await stmts.getSessionById(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    res.json(session)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Delete session
router.delete('/:id', auth, async (req, res) => {
  try {
    await stmts.deleteSession(req.params.id, req.admin.id)
    res.json({ message: 'Deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Attendee pre-registration ──────────────────────────────────

// Add attendee to session
router.post('/:id/attendees', auth, async (req, res) => {
  try {
    const { name, attendee_id, email, phone } = req.body
    if (!name) return res.status(400).json({ error: 'Name required' })
    const result = await stmts.addAttendee(req.params.id, name, attendee_id, email, phone)
    const attendee = await stmts.getAttendeeById(result.lastID)
    res.json(attendee)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Get attendees for session
router.get('/:id/attendees', auth, async (req, res) => {
  try {
    res.json(await stmts.getAttendeesBySession(req.params.id))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Delete attendee
router.delete('/:id/attendees/:aid', auth, async (req, res) => {
  try {
    await stmts.deleteAttendee(req.params.aid)
    res.json({ message: 'Removed' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
