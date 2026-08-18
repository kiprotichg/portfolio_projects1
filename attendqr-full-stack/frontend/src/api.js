const BASE = '/api'

function getToken() { return localStorage.getItem('aqr_token') }

async function req(method, path, body) {
  const token = getToken()
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    })
  } catch (networkErr) {
    // fetch itself threw — server unreachable (backend not running, no network, etc.)
    throw new Error('Cannot reach the server. Is the backend running on port 3001?')
  }

  // Read the body as text first — some failure responses (proxy errors, crashed
  // backend, wrong port) come back with an empty or non-JSON body, and calling
  // res.json() directly on those throws a cryptic "Unexpected end of JSON input".
  const raw = await res.text()
  let data
  try {
    data = raw ? JSON.parse(raw) : {}
  } catch (parseErr) {
    throw new Error(
      `Server returned an invalid response (status ${res.status}). ` +
      `Make sure the backend is running on http://localhost:3001.`
    )
  }

  if (!res.ok) {
    const err = new Error(data.error || data.message || `Request failed (${res.status})`)
    err.code = data.error   // pass error code (e.g. 'qr_expired', 'qr_used_up')
    err.data = data         // pass full response data
    throw err
  }
  return data
}

export const api = {
  // Auth
  register:       (b)  => req('POST', '/auth/register', b),
  login:          (b)  => req('POST', '/auth/login', b),
  me:             ()   => req('GET',  '/auth/me'),
  updateEmail:    (b)  => req('PUT',  '/auth/email', b),

  // Sessions
  createSession:     (b)  => req('POST',   '/sessions', b),
  getSessions:       ()   => req('GET',    '/sessions'),
  getPublicSessions: ()   => req('GET',    '/sessions/public'),
  getSession:        (id) => req('GET',    `/sessions/${id}`),
  deleteSession:     (id) => req('DELETE', `/sessions/${id}`),

  // Attendees (pre-registered)
  addAttendee:    (sessionId, b) => req('POST',   `/sessions/${sessionId}/attendees`, b),
  getAttendees:   (sessionId)    => req('GET',    `/sessions/${sessionId}/attendees`),
  deleteAttendee: (sessionId, aid) => req('DELETE', `/sessions/${sessionId}/attendees/${aid}`),

  // Attendance / scanning
  scanQR:      (b)  => req('POST', '/attendance/scan', b),        // called on QR scan
  signIn:      (b)  => req('POST', '/attendance/signin', b),      // admin manual
  signOut:     (id) => req('POST', `/attendance/signout/${id}`),
  getAttendance: (sessionId) => req('GET', `/attendance/session/${sessionId}`),
  lookupAttendee: (name)     => req('GET', `/attendance/lookup?name=${encodeURIComponent(name)}`),
  deleteRecord: (id) => req('DELETE', `/attendance/${id}`),
}
