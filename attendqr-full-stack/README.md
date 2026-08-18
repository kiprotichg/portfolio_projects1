# ◈ AttendQR v3 — Full Stack with Database & Email

## Architecture
- **Backend**: Node.js + Express + SQLite (better-sqlite3)
- **Frontend**: React + Vite
- **Email**: Nodemailer (Gmail)
- **Auth**: JWT + bcrypt

---

## Setup Instructions

### Step 1 — Install dependencies

Open TWO PowerShell terminals.

**Terminal 1 (Backend):**
```powershell
cd backend
npm install
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm install
```

---

### Step 2 — Configure email (Gmail)

1. Go to your Gmail account → **Security** → **2-Step Verification** (enable it)
2. Then go to: https://myaccount.google.com/apppasswords
3. Create an App Password for "AttendQR"
4. Edit `backend/.env`:

```env
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx   ← 16-char app password (no spaces)
SMTP_FROM=AttendQR <your_gmail@gmail.com>
JWT_SECRET=any_long_random_string_here
```

---

### Step 3 — Start both servers

**Terminal 1 (Backend):**
```powershell
cd backend
npm start
```
You should see: `🚀 AttendQR backend running on http://localhost:3001`

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

Open **http://localhost:5173** in Chrome.

---

## How to Use

### Admin
1. Click **Admin** → Register with your email
2. Create a session → Get a QR code
3. Share the QR with attendees
4. Go to **Settings** to confirm your notification email
5. Every sign-in and sign-out → you get an instant email

### Attendee
1. Click **Attendee** → Select session → Enter name → **Sign In**
2. To leave: go to **Sign Out** tab → search your name → **Sign Out**
3. **History** tab shows your full attendance record

---

## Database
All data is stored in `backend/attendqr.db` (SQLite).
Tables: `admins`, `sessions`, `attendance`
