import test from 'node:test'
import assert from 'node:assert/strict'
import bcrypt from 'bcryptjs'
import pool from '../config/db.js'
import { register, login } from '../controllers/authController.js'

const records = []
// In-memory SQL adapter: exercises the actual controllers and real bcrypt/JWT.
pool.query = async (sql, args) => {
  if (sql.startsWith('INSERT')) {
    const [username, email, password_hash, full_name, role] = args
    const id = records.length + 1
    records.push({ id, username, email, password_hash, full_name, role })
    return [{ insertId: id }]
  }
  if (sql.includes('SELECT id')) return [records.filter(u => u.username === args[0] || u.email === args[1])]
  if (sql.includes('OR username')) return [records.filter(u => u.email === args[0] || u.username === args[1])]
  return [records.filter(u => sql.includes('WHERE email') ? u.email === args[0] : u.username === args[0])]
}
async function request(handler, body) {
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this }, json(data) { this.body = data; return this } }
  await handler({ body }, res, error => { throw error })
  return res
}

test('register, discard session, login; email/username collisions and invalid credentials', async () => {
  // Older account whose username is the new account's email.
  await request(register, { username: 'person@example.com', email: 'other@example.com', password: 'OtherPass123!', full_name: 'Other' })
  const created = await request(register, { username: 'person', email: ' Person@Example.COM ', password: ' MyPass123! ', full_name: 'Person' })
  assert.equal(created.statusCode, 201)
  assert.ok(created.body.token)
  assert.notEqual(records[1].password_hash, ' MyPass123! ')
  assert.equal(await bcrypt.compare(' MyPass123! ', records[1].password_hash), true)
  const signedIn = await request(login, { email: ' PERSON@example.COM ', password: ' MyPass123! ' })
  assert.equal(signedIn.statusCode, 200)
  assert.equal(signedIn.body.user.id, created.body.user.id)
  assert.ok(signedIn.body.token)
  assert.equal((await request(login, { email: 'person', password: ' MyPass123! ' })).statusCode, 200)
  assert.equal((await request(login, { email: 'person@example.com', password: 'wrong' })).statusCode, 401)
  assert.equal((await request(login, { email: 'missing@example.com', password: 'wrong' })).statusCode, 401)
  assert.equal((await request(login, { email: {}, password: [] })).statusCode, 400)
  assert.equal((await request(register, { username: 'another', email: 'PERSON@EXAMPLE.COM', password: 'abc', full_name: 'Person' })).statusCode, 400)
})

test('Docker seed hashes match the documented demo password', async () => {
  const { readFile } = await import('node:fs/promises')
  const sql = await readFile(new URL('../database/seed.sql', import.meta.url), 'utf8')
  const hashes = sql.match(/\$2[aby]\$10\$[./A-Za-z0-9]{53}/g)
  assert.equal(hashes.length, 2)
  for (const hash of hashes) assert.equal(await bcrypt.compare('MediTrack2026!', hash), true)
})
