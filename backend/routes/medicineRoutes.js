import express from 'express'
import {
  getAllMedicines,
  getMedicineById,
  getInventorySummary,
  getLowStockMedicines,
  getExpiringMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} from '../controllers/medicineController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Special query / analytics routes
router.get('/summary', getInventorySummary)
router.get('/low-stock', getLowStockMedicines)
router.get('/expiring', getExpiringMedicines)

// Standard CRUD routes
router.get('/', getAllMedicines)
router.get('/:id', getMedicineById)
router.post('/', authenticateToken, addMedicine)
router.put('/:id', authenticateToken, updateMedicine)
router.delete('/:id', authenticateToken, deleteMedicine)

export default router
