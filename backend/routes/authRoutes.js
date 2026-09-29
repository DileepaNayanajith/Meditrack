import express from 'express'
import {
  register,
  login,
  getCurrentUser,
  getAllUsers,
} from '../controllers/authController.js'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authenticateToken, getCurrentUser)
router.get('/users', authenticateToken, requireAdmin, getAllUsers)

export default router
