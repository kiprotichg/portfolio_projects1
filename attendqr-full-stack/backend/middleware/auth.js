const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
