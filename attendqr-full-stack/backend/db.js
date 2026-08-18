const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const db = new sqlite3.Database(path.join(__dirname, 'attendqr.db'))

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err)
      else resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => { if (err) reject(err); else resolve(row) })
  })
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows || []) })
  })
}

async function initDB() {
  await run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`)

  await run(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    org_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    event_name TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (admin_id) REFERENCES admins(id)
  )`)

  await run(`CREATE TABLE IF NOT EXISTS attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    attendee_id TEXT DEFAULT '',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    qr_expires_at TEXT,        -- QR expiry: 7 days from creation
    scan_count INTEGER DEFAULT 0,  -- tracks how many times QR has been scanned (max 2)
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  )`)

  // Migrate existing attendees table to add new columns if they don't exist
  await run(`ALTER TABLE attendees ADD COLUMN qr_expires_at TEXT`).catch(() => {})
  await run(`ALTER TABLE attendees ADD COLUMN scan_count INTEGER DEFAULT 0`).catch(() => {})

  await run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    attendee_id_ref INTEGER,
    attendee_name TEXT NOT NULL,
    attendee_badge TEXT DEFAULT '',
    sign_in_time TEXT DEFAULT (datetime('now')),
    sign_out_time TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (attendee_id_ref) REFERENCES attendees(id)
  )`)

  console.log('💾 Database ready')
}

function localTime() {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ` +
         `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

// Returns expiry date 7 days from now
function expiryTime() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const stmts = {
  // Admins
  createAdmin:      (name, email, password) =>
    run('INSERT INTO admins (name, email, password) VALUES (?, ?, ?)', [name, email, password]),
  getAdminByEmail:  (email) =>
    get('SELECT * FROM admins WHERE email = ?', [email]),
  getAdminById:     (id) =>
    get('SELECT id, name, email, created_at FROM admins WHERE id = ?', [id]),
  updateAdminEmail: (email, id) =>
    run('UPDATE admins SET email = ? WHERE id = ?', [email, id]),

  // Sessions
  createSession: (admin_id, org_name, industry, event_name, date, location, notes) =>
    run('INSERT INTO sessions (admin_id, org_name, industry, event_name, date, location, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [admin_id, org_name, industry, event_name, date, location, notes]),
  getSessionsByAdmin: (admin_id) =>
    all('SELECT * FROM sessions WHERE admin_id = ? ORDER BY created_at DESC', [admin_id]),
  getSessionById: (id) =>
    get('SELECT * FROM sessions WHERE id = ?', [id]),
  deleteSession: (id, admin_id) =>
    run('DELETE FROM sessions WHERE id = ? AND admin_id = ?', [id, admin_id]),
  getAllSessions: () =>
    all('SELECT s.*, a.name as admin_name FROM sessions s JOIN admins a ON s.admin_id = a.id ORDER BY s.created_at DESC'),

  // Attendees — now with qr_expires_at and scan_count
  addAttendee: (session_id, name, attendee_id, email, phone) =>
    run('INSERT INTO attendees (session_id, name, attendee_id, email, phone, qr_expires_at, scan_count) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [session_id, name, attendee_id || '', email || '', phone || '', expiryTime()]),
  getAttendeesBySession: (session_id) =>
    all('SELECT * FROM attendees WHERE session_id = ? ORDER BY created_at ASC', [session_id]),
  getAttendeeById: (id) =>
    get('SELECT * FROM attendees WHERE id = ?', [id]),
  deleteAttendee: (id) =>
    run('DELETE FROM attendees WHERE id = ?', [id]),
  incrementScanCount: (id) =>
    run('UPDATE attendees SET scan_count = scan_count + 1 WHERE id = ?', [id]),

  // Attendance records
  markSignIn: (session_id, attendee_id_ref, attendee_name, attendee_badge) =>
    run('INSERT INTO attendance (session_id, attendee_id_ref, attendee_name, attendee_badge, sign_in_time) VALUES (?, ?, ?, ?, ?)',
      [session_id, attendee_id_ref || null, attendee_name, attendee_badge || '', localTime()]),
  signOut: (id) =>
    run('UPDATE attendance SET sign_out_time = ? WHERE id = ?', [localTime(), id]),
  getBySession: (session_id) =>
    all('SELECT * FROM attendance WHERE session_id = ? ORDER BY sign_in_time DESC', [session_id]),
  getByName: (name) =>
    all(`SELECT a.*, s.event_name, s.date, s.org_name
         FROM attendance a JOIN sessions s ON a.session_id = s.id
         WHERE lower(a.attendee_name) = lower(?) OR lower(a.attendee_badge) = lower(?)`, [name, name]),
  checkDuplicate: (session_id, name) =>
    get(`SELECT id FROM attendance
         WHERE session_id = ? AND lower(attendee_name) = lower(?) AND sign_out_time IS NULL`, [session_id, name]),
  // Get today's record for this attendee (signed in or signed in+out)
  getTodayRecord: (session_id, name, today) =>
    get(`SELECT * FROM attendance
         WHERE session_id = ? AND lower(attendee_name) = lower(?)
         AND date(sign_in_time) = ?
         ORDER BY sign_in_time DESC LIMIT 1`, [session_id, name, today]),
  // Returns a completed (signed in + out) record for today
  getCompletedToday: (session_id, name, today) =>
    get(`SELECT id, sign_in_time, sign_out_time FROM attendance
         WHERE session_id = ? AND lower(attendee_name) = lower(?)
         AND sign_out_time IS NOT NULL
         AND date(sign_in_time) = ?`, [session_id, name, today]),
  deleteAttendance: (id) =>
    run('DELETE FROM attendance WHERE id = ?', [id]),
  getAttendanceById: (id) =>
    get(`SELECT a.*, s.event_name, s.org_name, s.date
         FROM attendance a JOIN sessions s ON a.session_id = s.id WHERE a.id = ?`, [id]),
}

module.exports = { db, stmts, initDB, expiryTime }
