import nodemailer from 'nodemailer'
import pool from '../config/db.js'

function transporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
}

async function logEmail(type, recipient, referenceId, status, error = null) {
  await pool.query(
    `INSERT INTO email_notifications (notification_type, recipient, reference_id, status, error_message) VALUES (?, ?, ?, ?, ?)`,
    [type, recipient, referenceId || null, status, error?.slice(0, 255) || null]
  ).catch(() => {})
}

export async function sendReceipt(sale, items) {
  if (!sale.customer_email) return { sent: false, reason: 'No customer email' }
  const mailer = transporter()
  if (!mailer) {
    await logEmail('receipt', sale.customer_email, sale.id, 'skipped', 'SMTP not configured')
    return { sent: false, reason: 'SMTP not configured' }
  }
  const rows = items.map((item) => `<tr><td>${item.medicine_name}</td><td>${item.quantity}</td><td>LKR ${Number(item.line_total).toFixed(2)}</td></tr>`).join('')
  try {
    await mailer.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: sale.customer_email,
      subject: `MediTrack receipt ${sale.sale_number}`,
      html: `<h2>Thank you${sale.customer_name ? `, ${sale.customer_name}` : ''}</h2><p>Receipt: <b>${sale.sale_number}</b></p><table cellpadding="8" border="1" cellspacing="0"><tr><th>Medicine</th><th>Qty</th><th>Total</th></tr>${rows}</table><h3>Total: LKR ${Number(sale.total).toFixed(2)}</h3>`,
    })
    await logEmail('receipt', sale.customer_email, sale.id, 'sent')
    return { sent: true }
  } catch (error) {
    await logEmail('receipt', sale.customer_email, sale.id, 'failed', error.message)
    return { sent: false, reason: error.message }
  }
}

export async function sendExpiryAlert(recipient, medicines) {
  const mailer = transporter()
  if (!mailer) return { sent: false, reason: 'SMTP not configured' }
  const rows = medicines.map((item) => `<li>${item.name} · batch ${item.batch_number} · expires ${item.expiry_date} (${item.days_until_expiry} days)</li>`).join('')
  try {
    await mailer.sendMail({ from: process.env.EMAIL_FROM || process.env.SMTP_USER, to: recipient, subject: `MediTrack expiry alert: ${medicines.length} item(s)`, html: `<h2>Expiry alert</h2><ul>${rows}</ul>` })
    await logEmail('expiry_alert', recipient, null, 'sent')
    return { sent: true }
  } catch (error) {
    await logEmail('expiry_alert', recipient, null, 'failed', error.message)
    return { sent: false, reason: error.message }
  }
}
