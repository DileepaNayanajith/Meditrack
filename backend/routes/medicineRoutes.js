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

const router = express.Router()

// Special query / analytics routes
router.get('/summary', getInventorySummary)
router.get('/low-stock', getLowStockMedicines)
router.get('/expiring', getExpiringMedicines)

// Standard CRUD routes
router.get('/', getAllMedicines)
router.get('/:id', getMedicineById)
router.post('/', addMedicine)
router.put('/:id', updateMedicine)
router.delete('/:id', deleteMedicine)

export default router
