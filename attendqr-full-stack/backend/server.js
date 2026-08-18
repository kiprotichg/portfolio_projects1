const express = require('express')
const cors    = require('cors')
const { initDB }       = require('./db')
const { verifyMailer } = require('./mailer')
require('dotenv').config()

const app = express()

// Allow requests from any device on the local network
app.use(cors({ origin: '*', credentials: false }))
app.use(express.json())

app.use('/api/auth',       require('./routes/auth'))
app.use('/api/sessions',   require('./routes/sessions'))
app.use('/api/attendance', require('./routes/attendance'))
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3001

async function start() {
  await initDB()
  await verifyMailer()
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 AttendQR backend → http://localhost:${PORT}`)
    console.log(`📱 For phone access  → http://YOUR_PC_IP:${PORT}`)
    console.log(`   (Run 'ipconfig' in PowerShell to find your IP)\n`)
  })
}

start().catch(err => {
  console.error('Startup error:', err)
  process.exit(1)
})
