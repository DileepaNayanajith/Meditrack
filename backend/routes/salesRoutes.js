import express from 'express'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js'
import { createSale, emailExpiryAlert, listSales } from '../controllers/salesController.js'

const router = express.Router()
router.use(authenticateToken)
router.get('/', listSales)
router.post('/', createSale)
router.post('/expiry-alert', requireAdmin, emailExpiryAlert)
export default router
