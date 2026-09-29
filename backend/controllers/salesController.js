import pool from '../config/db.js'
import { sendReceipt, sendExpiryAlert } from '../services/emailService.js'

export async function createSale(req, res, next) {
  const connection = await pool.getConnection()
  try {
    const { items, customer_name = '', customer_email = '', payment_method = 'cash' } = req.body
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, message: 'Add at least one medicine to the cart.' })
    await connection.beginTransaction()
    const saleItems = []
    let total = 0
    for (const requested of items) {
      const quantity = Number(requested.quantity)
      if (!Number.isInteger(quantity) || quantity < 1) throw Object.assign(new Error('Every sale quantity must be a positive whole number.'), { statusCode: 400 })
      const [rows] = await connection.query(`SELECT id, name, batch_number, stock_quantity, unit_price, expiry_date FROM medicines WHERE id = ? FOR UPDATE`, [requested.medicine_id])
      const medicine = rows[0]
      if (!medicine) throw Object.assign(new Error('A medicine in the cart no longer exists.'), { statusCode: 404 })
      if (medicine.expiry_date < new Date().toISOString().slice(0, 10)) throw Object.assign(new Error(`${medicine.name} is expired and cannot be sold.`), { statusCode: 409 })
      if (Number(medicine.stock_quantity) < quantity) throw Object.assign(new Error(`Only ${medicine.stock_quantity} unit(s) of ${medicine.name} are available.`), { statusCode: 409 })
      const lineTotal = Number(medicine.unit_price) * quantity
      total += lineTotal
      saleItems.push({ ...medicine, medicine_name: medicine.name, quantity, line_total: lineTotal })
    }
    const saleNumber = `MT-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`
    const [result] = await connection.query(`INSERT INTO sales (sale_number, customer_name, customer_email, subtotal, total, payment_method, sold_by) VALUES (?, ?, ?, ?, ?, ?, ?)`, [saleNumber, customer_name || null, customer_email || null, total, total, payment_method, req.user.id])
    for (const item of saleItems) {
      await connection.query(`INSERT INTO sale_items (sale_id, medicine_id, medicine_name, batch_number, quantity, unit_price, line_total, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [result.insertId, item.id, item.medicine_name, item.batch_number, item.quantity, item.unit_price, item.line_total, item.expiry_date])
      await connection.query(`UPDATE medicines SET stock_quantity = stock_quantity - ? WHERE id = ?`, [item.quantity, item.id])
    }
    await connection.commit()
    const sale = { id: result.insertId, sale_number: saleNumber, customer_name, customer_email, total, payment_method }
    const email = await sendReceipt(sale, saleItems)
    res.status(201).json({ success: true, message: 'Sale completed and stock updated.', data: { ...sale, items: saleItems, email } })
  } catch (error) {
    await connection.rollback().catch(() => {})
    next(error)
  } finally { connection.release() }
}

export async function listSales(req, res, next) {
  try {
    const [rows] = await pool.query(`SELECT s.*, u.full_name AS cashier_name FROM sales s LEFT JOIN users u ON u.id = s.sold_by ORDER BY s.created_at DESC LIMIT 100`)
    res.json({ success: true, count: rows.length, data: rows })
  } catch (error) { next(error) }
}

export async function emailExpiryAlert(req, res, next) {
  try {
    const recipient = req.body.email || process.env.ALERT_EMAIL
    if (!recipient) return res.status(400).json({ success: false, message: 'Add ALERT_EMAIL to backend/.env or provide an email.' })
    const [items] = await pool.query(`SELECT name, batch_number, expiry_date, DATEDIFF(expiry_date, CURDATE()) AS days_until_expiry FROM medicines WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 60 DAY) ORDER BY expiry_date`)
    const email = await sendExpiryAlert(recipient, items)
    if (!email.sent) return res.status(503).json({ success: false, message: email.reason })
    res.json({ success: true, message: `Expiry alert sent to ${recipient}.`, count: items.length })
  } catch (error) { next(error) }
}
