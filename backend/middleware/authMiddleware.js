import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required. Please sign in.',
    })
  }

  try {
    const secret = process.env.JWT_SECRET || 'meditrack_jwt_secret'
    const decoded = jwt.verify(token, secret)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
    })
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({
      success: false,
      message: 'Admin authorization required.',
    })
  }
}
