import pool from '../config/db.js'

// GET /api/suppliers
export const getAllSuppliers = async (req, res, next) => {
  try {
    const [suppliers] = await pool.query(`
      SELECT s.*, COUNT(m.id) AS medicines_count
      FROM suppliers s
      LEFT JOIN medicines m ON s.id = m.supplier_id
      GROUP BY s.id
      ORDER BY s.name ASC
    `)

    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/suppliers/:id
export const getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params

    const [rows] = await pool.query(`SELECT * FROM suppliers WHERE id = ?`, [id])
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Supplier with ID ${id} not found.`,
      })
    }

    const supplier = rows[0]

    // Fetch supplied medicines
    const [medicines] = await pool.query(`
      SELECT id, name, generic_name, batch_number, stock_quantity, expiry_date, unit_price
      FROM medicines
      WHERE supplier_id = ?
      ORDER BY name ASC
    `, [id])

    res.json({
      success: true,
      data: {
        ...supplier,
        medicines,
      },
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/suppliers
export const addSupplier = async (req, res, next) => {
  try {
    const { name, contact_person, email, phone, address } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Supplier name is required.',
      })
    }

    const [result] = await pool.query(`
      INSERT INTO suppliers (name, contact_person, email, phone, address)
      VALUES (?, ?, ?, ?, ?)
    `, [name, contact_person || null, email || null, phone || null, address || null])

    const [newSupplier] = await pool.query(`SELECT * FROM suppliers WHERE id = ?`, [result.insertId])

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully.',
      data: newSupplier[0],
    })
  } catch (error) {
    next(error)
  }
}

// PUT /api/suppliers/:id
export const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, contact_person, email, phone, address } = req.body

    const [existing] = await pool.query(`SELECT * FROM suppliers WHERE id = ?`, [id])
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Supplier with ID ${id} not found.`,
      })
    }

    await pool.query(`
      UPDATE suppliers SET
        name = COALESCE(?, name),
        contact_person = COALESCE(?, contact_person),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address)
      WHERE id = ?
    `, [
      name ?? null,
      contact_person ?? null,
      email ?? null,
      phone ?? null,
      address ?? null,
      id,
    ])

    const [updated] = await pool.query(`SELECT * FROM suppliers WHERE id = ?`, [id])

    res.json({
      success: true,
      message: 'Supplier updated successfully.',
      data: updated[0],
    })
  } catch (error) {
    next(error)
  }
}

// DELETE /api/suppliers/:id
export const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params

    const [result] = await pool.query(`DELETE FROM suppliers WHERE id = ?`, [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Supplier with ID ${id} not found.`,
      })
    }

    res.json({
      success: true,
      message: `Supplier ID ${id} deleted successfully.`,
    })
  } catch (error) {
    next(error)
  }
}
