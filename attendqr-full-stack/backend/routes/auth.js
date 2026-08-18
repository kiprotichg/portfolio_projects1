const express = require('express')
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const { stmts } = require('../db')
const auth    = require('../middleware/auth')
require('dotenv').config()

const router = express.Router()
const SECRET = process.env.JWT_SECRET || 'attendqr_secret_key'

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' })
    const existing = await stmts.getAdminByEmail(email)
    if (existing) return res.status(409).json({ error: 'Email already registered' })
    const hashed = await bcrypt.hash(password, 10)
    const result = await stmts.createAdmin(name, email, hashed)
    const token  = jwt.sign({ id: result.lastID, email, name }, SECRET, { expiresIn: '7d' })
    res.json({ token, admin: { id: result.lastID, name, email } })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const admin = await stmts.getAdminByEmail(email)
    if (!admin) return res.status(401).json({ error: 'Invalid email or password' })
    const match = await bcrypt.compare(password, admin.password)
    if (!match) return res.status(401).json({ error: 'Invalid email or password' })
    const token = jwt.sign({ id: admin.id, email: admin.email, name: admin.name }, SECRET, { expiresIn: '7d' })
    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/me', auth, async (req, res) => {
  try {
    const admin = await stmts.getAdminById(req.admin.id)
    if (!admin) return res.status(404).json({ error: 'Not found' })
    res.json(admin)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/email', auth, async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })
    await stmts.updateAdminEmail(email, req.admin.id)
    res.json({ message: 'Email updated' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Send test email
router.post('/test-email', auth, async (req, res) => {
  try {
    const admin = await stmts.getAdminById(req.admin.id)
    if (!admin) return res.status(404).json({ error: 'Admin not found' })
    const { sendTestEmail } = require('../mailer')
    await sendTestEmail(admin.email, admin.name)
    res.json({ message: `Test email sent to ${admin.email}` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
