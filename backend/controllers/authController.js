import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/db.js'

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { username, email, password, full_name, role = 'staff' } = req.body

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, and full name are required.',
      })
    }

    // Check if user or email already exists
    const [existing] = await pool.query(
      `SELECT id FROM users WHERE username = ? OR email = ?`,
      [username, email]
    )

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or Email is already registered.',
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    const [result] = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`,
      [username, email.toLowerCase(), password_hash, full_name, role]
    )

    const userId = result.insertId

    // Generate token
    const token = jwt.sign(
      { id: userId, username, role },
      process.env.JWT_SECRET || 'meditrack_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    )

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: userId,
        username,
        email,
        full_name,
        role,
      },
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      })
    }

    // Query user by email or username
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE email = ? OR username = ?`,
      [email.toLowerCase(), email]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      })
    }

    const user = rows[0]

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      })
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'meditrack_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    )

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/auth/me
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id
    const [rows] = await pool.query(
      `SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?`,
      [userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      })
    }

    res.json({
      success: true,
      user: rows[0],
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/users
export const getAllUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      `SELECT id, username, email, full_name, role, created_at FROM users ORDER BY created_at DESC`
    )

    res.json({
      success: true,
      count: users.length,
      data: users,
    })
  } catch (error) {
    next(error)
  }
}
