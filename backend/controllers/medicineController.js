import pool from '../config/db.js'

// GET /api/medicines
// Query params: q, category, status (low, expiring, expired), supplier_id, sort_by, order
export const getAllMedicines = async (req, res, next) => {
  try {
    const { q, category, status, supplier_id, sort_by = 'created_at', order = 'DESC' } = req.query

    let sql = `
      SELECT m.*, s.name AS supplier_name 
      FROM medicines m
      LEFT JOIN suppliers s ON m.supplier_id = s.id
      WHERE 1=1
    `
    const params = []

    if (q) {
      sql += ` AND (m.name LIKE ? OR m.generic_name LIKE ? OR m.batch_number LIKE ?)`
      const searchPattern = `%${q}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    if (category) {
      sql += ` AND m.category = ?`
      params.push(category)
    }

    if (supplier_id) {
      sql += ` AND m.supplier_id = ?`
      params.push(supplier_id)
    }

    if (status === 'low') {
      sql += ` AND m.stock_quantity <= m.min_stock_level`
    } else if (status === 'expiring') {
      sql += ` AND m.expiry_date >= CURDATE() AND m.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 60 DAY)`
    } else if (status === 'expired') {
      sql += ` AND m.expiry_date < CURDATE()`
    }

    // Allowed sort columns
    const allowedSorts = ['name', 'category', 'stock_quantity', 'expiry_date', 'unit_price', 'created_at']
    const cleanSort = allowedSorts.includes(sort_by) ? `m.${sort_by}` : 'm.created_at'
    const cleanOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

    sql += ` ORDER BY ${cleanSort} ${cleanOrder}`

    const [rows] = await pool.query(sql, params)
    res.json({
      success: true,
      count: rows.length,
      data: rows,
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/medicines/summary
export const getInventorySummary = async (req, res, next) => {
  try {
    const [summaryRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_medicines,
        COALESCE(SUM(stock_quantity), 0) AS total_stock_qty,
        COALESCE(SUM(stock_quantity * unit_price), 0) AS total_inventory_value,
        SUM(CASE WHEN stock_quantity <= min_stock_level THEN 1 ELSE 0 END) AS low_stock_count,
        SUM(CASE WHEN expiry_date >= CURDATE() AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 60 DAY) THEN 1 ELSE 0 END) AS expiring_soon_count,
        SUM(CASE WHEN expiry_date < CURDATE() THEN 1 ELSE 0 END) AS expired_count
      FROM medicines
    `)

    const summary = summaryRows[0] || {}

    res.json({
      success: true,
      data: {
        totalMedicines: Number(summary.total_medicines || 0),
        totalStockQty: Number(summary.total_stock_qty || 0),
        totalInventoryValue: Number(summary.total_inventory_value || 0),
        lowStockCount: Number(summary.low_stock_count || 0),
        expiringSoonCount: Number(summary.expiring_soon_count || 0),
        expiredCount: Number(summary.expired_count || 0),
      },
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/medicines/low-stock
export const getLowStockMedicines = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, s.name AS supplier_name 
      FROM medicines m
      LEFT JOIN suppliers s ON m.supplier_id = s.id
      WHERE m.stock_quantity <= m.min_stock_level
      ORDER BY m.stock_quantity ASC
    `)

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/medicines/expiring
// Query param: days (default 60)
export const getExpiringMedicines = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days || '60', 10)

    const [rows] = await pool.query(`
      SELECT m.*, s.name AS supplier_name,
        DATEDIFF(m.expiry_date, CURDATE()) AS days_until_expiry
      FROM medicines m
      LEFT JOIN suppliers s ON m.supplier_id = s.id
      WHERE m.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY m.expiry_date ASC
    `, [days])

    res.json({
      success: true,
      count: rows.length,
      daysThreshold: days,
      data: rows,
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/medicines/:id
export const getMedicineById = async (req, res, next) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query(`
      SELECT m.*, s.name AS supplier_name, s.email AS supplier_email, s.phone AS supplier_phone
      FROM medicines m
      LEFT JOIN suppliers s ON m.supplier_id = s.id
      WHERE m.id = ?
    `, [id])

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Medicine with ID ${id} not found.`,
      })
    }

    res.json({
      success: true,
      data: rows[0],
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/medicines
export const addMedicine = async (req, res, next) => {
  try {
    const {
      name,
      generic_name,
      category = 'General',
      batch_number,
      stock_quantity = 0,
      min_stock_level = 10,
      expiry_date,
      unit_price = 0.00,
      supplier_id = null,
      location = 'Main Shelf',
      notes = '',
    } = req.body

    if (!name || !batch_number || !expiry_date) {
      return res.status(400).json({
        success: false,
        message: 'Name, batch number, and expiry date are required fields.',
      })
    }

    const [result] = await pool.query(`
      INSERT INTO medicines 
        (name, generic_name, category, batch_number, stock_quantity, min_stock_level, expiry_date, unit_price, supplier_id, location, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      generic_name || null,
      category,
      batch_number,
      stock_quantity,
      min_stock_level,
      expiry_date,
      unit_price,
      supplier_id || null,
      location,
      notes,
    ])

    const [newRow] = await pool.query(`SELECT * FROM medicines WHERE id = ?`, [result.insertId])

    res.status(201).json({
      success: true,
      message: 'Medicine item added successfully.',
      data: newRow[0],
    })
  } catch (error) {
    next(error)
  }
}

// PUT /api/medicines/:id
export const updateMedicine = async (req, res, next) => {
  try {
    const { id } = req.params
    const {
      name,
      generic_name,
      category,
      batch_number,
      stock_quantity,
      min_stock_level,
      expiry_date,
      unit_price,
      supplier_id,
      location,
      notes,
    } = req.body

    const [existing] = await pool.query(`SELECT * FROM medicines WHERE id = ?`, [id])
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Medicine with ID ${id} not found.`,
      })
    }

    await pool.query(`
      UPDATE medicines SET
        name = COALESCE(?, name),
        generic_name = COALESCE(?, generic_name),
        category = COALESCE(?, category),
        batch_number = COALESCE(?, batch_number),
        stock_quantity = COALESCE(?, stock_quantity),
        min_stock_level = COALESCE(?, min_stock_level),
        expiry_date = COALESCE(?, expiry_date),
        unit_price = COALESCE(?, unit_price),
        supplier_id = COALESCE(?, supplier_id),
        location = COALESCE(?, location),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `, [
      name ?? null,
      generic_name ?? null,
      category ?? null,
      batch_number ?? null,
      stock_quantity ?? null,
      min_stock_level ?? null,
      expiry_date ?? null,
      unit_price ?? null,
      supplier_id ?? null,
      location ?? null,
      notes ?? null,
      id,
    ])

    const [updatedRow] = await pool.query(`SELECT * FROM medicines WHERE id = ?`, [id])

    res.json({
      success: true,
      message: 'Medicine updated successfully.',
      data: updatedRow[0],
    })
  } catch (error) {
    next(error)
  }
}

// DELETE /api/medicines/:id
export const deleteMedicine = async (req, res, next) => {
  try {
    const { id } = req.params

    const [result] = await pool.query(`DELETE FROM medicines WHERE id = ?`, [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Medicine with ID ${id} not found.`,
      })
    }

    res.json({
      success: true,
      message: `Medicine ID ${id} deleted successfully.`,
    })
  } catch (error) {
    next(error)
  }
}
