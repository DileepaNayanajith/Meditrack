import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AlertTriangle, ArrowLeft, ArrowRight, Bell, Box, Check, Eye, EyeOff, HeartPulse, LockKeyhole, Mail, Minus, PackageCheck, Plus, ReceiptText, Search, ShieldCheck, ShoppingCart, TrendingUp, UserRound } from 'lucide-react'
import './styles.css'
import './theme.css'
import './auth.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
const TOKEN_KEY = 'meditrack-token'
const USER_KEY = 'meditrack-user'

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Request failed. Please try again.')
  return data
}

function Brand() {
  return <div className="brand"><span className="brand-mark"><HeartPulse size={21} strokeWidth={2.4}/></span><span>Medi<span className="brand-accent">Track</span><small>.</small></span></div>
}

function App() {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
    const rawUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
    try { return token && rawUser ? { token, user: JSON.parse(rawUser) } : null } catch { return null }
  })

  function completeAuth(data, remember) {
    const storage = remember ? localStorage : sessionStorage
    const other = remember ? sessionStorage : localStorage
    other.removeItem(TOKEN_KEY); other.removeItem(USER_KEY)
    storage.setItem(TOKEN_KEY, data.token); storage.setItem(USER_KEY, JSON.stringify(data.user))
    setSession({ token: data.token, user: data.user })
  }

  function signOut() {
    for (const storage of [localStorage, sessionStorage]) { storage.removeItem(TOKEN_KEY); storage.removeItem(USER_KEY) }
    setSession(null)
  }

  return session ? <Dashboard session={session} onSignOut={signOut}/> : <AuthPage onAuthenticated={completeAuth}/>
}

function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ full_name: '', username: '', email: '', password: '', newPassword: '' })
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const update = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }))
  const changeMode = (next) => { setMode(next); setMessage({ type: '', text: '' }); setShowPassword(false) }

  async function submit(event) {
    event.preventDefault(); setMessage({ type: '', text: '' }); setBusy(true)
    try {
      if (mode === 'login') {
        const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: form.email.trim(), password: form.password }) })
        onAuthenticated(data, remember)
      } else if (mode === 'register') {
        if (form.password.length < 8) throw new Error('Password must contain at least 8 characters.')
        const data = await api('/auth/register', { method: 'POST', body: JSON.stringify({ full_name: form.full_name.trim(), username: form.username.trim(), email: form.email.trim(), password: form.password }) })
        onAuthenticated(data, true)
      } else {
        const data = await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: form.email.trim(), newPassword: form.newPassword }) })
        setForm((value) => ({ ...value, password: '', newPassword: '' })); setMessage({ type: 'success', text: data.message }); setMode('login')
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof TypeError ? 'Cannot reach the backend. Start it with npm run server.' : error.message })
    } finally { setBusy(false) }
  }

  const titles = {
    login: ['WELCOME BACK', 'Sign in to your', 'workspace.', 'Your live inventory is ready when you are.'],
    register: ['CREATE ACCOUNT', 'Start your', 'workspace.', 'Create an account stored securely in MySQL.'],
    forgot: ['PASSWORD RESET', 'Reset your', 'password.', 'Choose a new password for your registered email.'],
  }
  const title = titles[mode]

  return <div className="page-shell">
    <header className="topbar"><Brand/><nav className="top-links" aria-label="Main navigation"><a href="#features">Why MediTrack</a><a href="#security">Security</a><span className="nav-divider"/><span className="nav-help">Connected workspace</span></nav></header>
    <main className="login-layout">
      <section className="story-panel" aria-label="MediTrack introduction">
        <div className="story-content"><div className="eyebrow"><span className="eyebrow-dot"/> THE SMARTER WAY TO CARE</div><h1>Every medicine.<br/><em>Every moment.</em><br/>In your hands.</h1><p className="story-copy">Manage stock levels and expiry dates using live information from your pharmacy database.</p><div className="feature-row" id="features"><span><span className="feature-icon"><PackageCheck size={18}/></span> Stock clarity</span><span><span className="feature-icon"><Bell size={18}/></span> Expiry alerts</span><span><span className="feature-icon"><TrendingUp size={18}/></span> Live MySQL data</span></div></div>
        <div className="visual-card auth-visual"><div className="visual-card-header"><span className="window-dots"><i/><i/><i/></span><span>Connected inventory</span><span className="visual-more">•••</span></div><div className="connected-preview"><span className="connected-icon"><Check/></span><div><strong>One secure workspace</strong><p>React frontend · Express API · MySQL database</p></div></div></div>
        <div className="story-footer"><span><ShieldCheck size={17}/> Account protected</span><span>© 2026 MediTrack</span></div>
      </section>
      <section className="form-panel"><div className="form-wrap auth-form-wrap">
        {mode !== 'login' && <button className="back-button" type="button" onClick={() => changeMode('login')}><ArrowLeft size={16}/> Back to sign in</button>}
        <div className="form-kicker"><span className="kicker-line"/> {title[0]}</div><h2>{title[1]}<br/><span>{title[2]}</span></h2><p className="form-intro">{title[3]}</p>
        <form onSubmit={submit} noValidate>
          {mode === 'register' && <><label htmlFor="full-name">Full name</label><div className="input-wrap"><UserRound size={19}/><input id="full-name" autoComplete="name" placeholder="Your full name" value={form.full_name} onChange={update('full_name')} required/></div><label htmlFor="username">Username</label><div className="input-wrap"><UserRound size={19}/><input id="username" autoComplete="username" placeholder="Choose a username" value={form.username} onChange={update('username')} required/></div></>}
          <label htmlFor="email">Email address</label><div className="input-wrap"><Mail size={19}/><input id="email" type="email" autoComplete="email" placeholder="you@yourpharmacy.com" value={form.email} onChange={update('email')} required/></div>
          {mode !== 'forgot' && <><label htmlFor="password">Password</label><PasswordInput id="password" value={form.password} onChange={update('password')} show={showPassword} toggle={() => setShowPassword((value) => !value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/></>}
          {mode === 'forgot' && <><label htmlFor="new-password">New password</label><PasswordInput id="new-password" value={form.newPassword} onChange={update('newPassword')} show={showPassword} toggle={() => setShowPassword((value) => !value)} autoComplete="new-password"/></>}
          {mode === 'login' && <div className="form-options"><label className="remember"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)}/><span>Remember me</span></label><button className="text-button" type="button" onClick={() => changeMode('forgot')}>Forgot password?</button></div>}
          {message.text && <p className={message.type === 'success' ? 'success-message' : 'error'} role="alert">{message.text}</p>}
          <button className="submit-button" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in to MediTrack' : mode === 'register' ? 'Create my account' : 'Update password'} {!busy && <ArrowRight size={19}/>}</button>
        </form>
        {mode === 'login' && <div className="account-prompt"><span>New to MediTrack?</span><button type="button" onClick={() => changeMode('register')}>Create an account</button></div>}
      </div><div className="form-footer" id="security"><ShieldCheck size={16}/> Connected to your Express and MySQL account system</div></section>
    </main>
  </div>
}

function PasswordInput({ id, value, onChange, show, toggle, autoComplete }) {
  return <div className="input-wrap"><LockKeyhole size={19}/><input id={id} type={show ? 'text' : 'password'} autoComplete={autoComplete} placeholder="At least 8 characters" value={value} onChange={onChange} required/><button type="button" className="eye-button" onClick={toggle} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div>
}

function Dashboard({ session, onSignOut }) {
  const [metrics, setMetrics] = useState({ totalStockQty: 0, expiringSoonCount: 0, lowStockCount: 0 })
  const [medicines, setMedicines] = useState([])
  const [state, setState] = useState({ loading: true, error: '' })
  const [view, setView] = useState('overview')
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [customer, setCustomer] = useState({ name: '', email: '', payment: 'cash' })
  const [checkout, setCheckout] = useState({ busy: false, error: '', success: '' })

  const authenticatedApi = (path, options = {}) => api(path, { ...options, headers: { Authorization: `Bearer ${session.token}`, ...options.headers } })

  function loadInventory() {
    setState({ loading: true, error: '' })
    Promise.all([api('/medicines/summary'), api('/medicines')])
      .then(([summary, list]) => { setMetrics(summary.data); setMedicines(list.data || []); setState({ loading: false, error: '' }) })
      .catch((error) => setState({ loading: false, error: error instanceof TypeError ? 'Backend is offline. Run npm run server.' : error.message }))
  }

  useEffect(loadInventory, [])

  const today = new Date().toISOString().slice(0, 10)
  const expiring = medicines.filter((item) => {
    const days = Math.ceil((new Date(`${item.expiry_date}T00:00:00`) - new Date(`${today}T00:00:00`)) / 86400000)
    return days <= 60
  })
  const sellable = medicines.filter((item) => item.expiry_date >= today && Number(item.stock_quantity) > 0 && item.name.toLowerCase().includes(search.toLowerCase()))
  const cartTotal = cart.reduce((total, item) => total + Number(item.unit_price) * item.quantity, 0)

  function addToCart(medicine) {
    setCheckout({ busy: false, error: '', success: '' })
    setCart((items) => {
      const found = items.find((item) => item.id === medicine.id)
      if (found) return items.map((item) => item.id === medicine.id ? { ...item, quantity: Math.min(item.quantity + 1, Number(item.stock_quantity)) } : item)
      return [...items, { ...medicine, quantity: 1 }]
    })
  }

  function changeQuantity(id, amount) {
    setCart((items) => items.map((item) => item.id === id ? { ...item, quantity: Math.max(0, Math.min(item.quantity + amount, Number(item.stock_quantity))) } : item).filter((item) => item.quantity > 0))
  }

  async function completeSale(event) {
    event.preventDefault(); setCheckout({ busy: true, error: '', success: '' })
    try {
      const data = await authenticatedApi('/sales', { method: 'POST', body: JSON.stringify({ customer_name: customer.name.trim(), customer_email: customer.email.trim(), payment_method: customer.payment, items: cart.map((item) => ({ medicine_id: item.id, quantity: item.quantity })) }) })
      const emailMessage = customer.email ? (data.data.email.sent ? ' Receipt emailed.' : ' Sale saved; email is not configured.') : ''
      setCheckout({ busy: false, error: '', success: `${data.message} Receipt ${data.data.sale_number}.${emailMessage}` })
      setCart([]); setCustomer({ name: '', email: '', payment: 'cash' }); loadInventory()
    } catch (error) { setCheckout({ busy: false, error: error.message, success: '' }) }
  }

  async function sendExpiryEmail() {
    setCheckout({ busy: true, error: '', success: '' })
    try {
      const data = await authenticatedApi('/sales/expiry-alert', { method: 'POST', body: JSON.stringify({}) })
      setCheckout({ busy: false, error: '', success: data.message })
    } catch (error) { setCheckout({ busy: false, error: error.message, success: '' }) }
  }

  const name = session.user.full_name || session.user.username
  const firstName = name.split(' ')[0]
  return <div className="dashboard"><aside className="dash-sidebar"><Brand/><div className="sidebar-label">WORKSPACE</div><button className={view === 'overview' ? 'active' : ''} onClick={() => setView('overview')}><Box size={18}/> Overview</button><button className={view === 'pos' ? 'active' : ''} onClick={() => setView('pos')}><ShoppingCart size={18}/> Point of sale <span>{cart.length || ''}</span></button><button className={view === 'expiry' ? 'active' : ''} onClick={() => setView('expiry')}><Bell size={18}/> Expiry alerts <span>{expiring.length}</span></button><div className="sidebar-bottom"><div className="avatar">{firstName[0]?.toUpperCase()}</div><div><strong>{name}</strong><small>{session.user.role}</small></div></div></aside>
    <main className="dash-main"><header><span>Workspace / {view === 'pos' ? 'Point of sale' : view === 'expiry' ? 'Expiry alerts' : 'Overview'}</span><button onClick={onSignOut}>Sign out <ArrowRight size={16}/></button></header>
      {view === 'overview' && <Overview firstName={firstName} metrics={metrics} medicines={medicines} state={state}/>}
      {view === 'pos' && <POS medicines={sellable} search={search} setSearch={setSearch} cart={cart} addToCart={addToCart} changeQuantity={changeQuantity} total={cartTotal} customer={customer} setCustomer={setCustomer} checkout={checkout} completeSale={completeSale}/>}
      {view === 'expiry' && <ExpiryView items={expiring} today={today} checkout={checkout} sendExpiryEmail={sendExpiryEmail} canEmail={session.user.role === 'admin'}/>}
    </main></div>
}

function Overview({ firstName, metrics, medicines, state }) {
  return <div className="dash-content" id="overview"><div className="dash-welcome">LIVE INVENTORY</div><h1>Welcome back, {firstName}</h1><p>Here’s your medicine inventory from MySQL.</p><div className="dash-grid"><Metric icon={<Box/>} label="Units in stock" value={metrics.totalStockQty}/><Metric className="amber" icon={<Bell/>} label="Expiring soon" value={metrics.expiringSoonCount} caption="Next 60 days"/><Metric className="blue" icon={<PackageCheck/>} label="Low stock" value={metrics.lowStockCount} caption="Needs attention"/></div>{state.error && <div className="data-error"><strong>Could not load MySQL data</strong><p>{state.error}</p></div>}<InventoryTable medicines={medicines} loading={state.loading}/></div>
}

function InventoryTable({ medicines, loading }) {
  return <section className="inventory-card"><div className="inventory-heading"><div><span>DATABASE RECORDS</span><h2>Medicine inventory</h2></div><strong>{loading ? 'Loading…' : `${medicines.length} items`}</strong></div>{!loading && medicines.length === 0 && <p className="empty-state">No medicine records found.</p>}{medicines.length > 0 && <div className="table-scroll"><table><thead><tr><th>Medicine</th><th>Batch</th><th>Stock</th><th>Expiry</th><th>Supplier</th></tr></thead><tbody>{medicines.map((medicine) => <tr key={medicine.id}><td><strong>{medicine.name}</strong><small>{medicine.category}</small></td><td>{medicine.batch_number}</td><td><span className={Number(medicine.stock_quantity) <= Number(medicine.min_stock_level) ? 'stock-low' : 'stock-ok'}>{medicine.stock_quantity}</span></td><td>{medicine.expiry_date}</td><td>{medicine.supplier_name || '—'}</td></tr>)}</tbody></table></div>}</section>
}

function POS({ medicines, search, setSearch, cart, addToCart, changeQuantity, total, customer, setCustomer, checkout, completeSale }) {
  return <div className="pos-page"><section className="product-panel"><div className="pos-title"><div><span>POINT OF SALE</span><h1>New sale</h1></div><div className="pos-search"><Search size={18}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicine…"/></div></div><div className="product-grid">{medicines.map((medicine) => <button className="product-card" key={medicine.id} onClick={() => addToCart(medicine)}><span className="product-icon"><PackageCheck/></span><strong>{medicine.name}</strong><small>{medicine.batch_number} · expires {medicine.expiry_date}</small><div><b>LKR {Number(medicine.unit_price).toFixed(2)}</b><span>{medicine.stock_quantity} in stock</span></div></button>)}</div></section>
    <form className="cart-panel" onSubmit={completeSale}><div className="cart-heading"><ShoppingCart size={20}/><div><strong>Current sale</strong><small>{cart.length} product(s)</small></div></div><div className="cart-items">{cart.length === 0 && <div className="cart-empty"><ShoppingCart/><p>Select a medicine to begin.</p></div>}{cart.map((item) => <div className="cart-item" key={item.id}><div><strong>{item.name}</strong><small>LKR {Number(item.unit_price).toFixed(2)} each</small></div><div className="quantity"><button type="button" onClick={() => changeQuantity(item.id, -1)}><Minus/></button><span>{item.quantity}</span><button type="button" onClick={() => changeQuantity(item.id, 1)}><Plus/></button></div><b>LKR {(Number(item.unit_price) * item.quantity).toFixed(2)}</b></div>)}</div><div className="customer-fields"><label>Customer name <input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Optional"/></label><label>Customer email <input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="Email receipt"/></label><label>Payment method <select value={customer.payment} onChange={(e) => setCustomer({ ...customer, payment: e.target.value })}><option value="cash">Cash</option><option value="card">Card</option><option value="other">Other</option></select></label></div>{checkout.error && <p className="checkout-error">{checkout.error}</p>}{checkout.success && <p className="checkout-success">{checkout.success}</p>}<div className="cart-total"><span>Total</span><strong>LKR {total.toFixed(2)}</strong></div><button className="checkout-button" disabled={!cart.length || checkout.busy}>{checkout.busy ? 'Processing…' : <><ReceiptText/> Complete sale</>}</button></form>
  </div>
}

function ExpiryView({ items, today, checkout, sendExpiryEmail, canEmail }) {
  return <div className="dash-content"><div className="expiry-header"><div><div className="dash-welcome">STOCK SAFETY</div><h1>Expiry alerts</h1><p>Expired items are blocked automatically at checkout.</p></div>{canEmail && <button className="email-alert-button" onClick={sendExpiryEmail} disabled={checkout.busy}><Mail size={17}/> Email alert</button>}</div>{checkout.error && <div className="data-error"><strong>Email not sent</strong><p>{checkout.error}</p></div>}{checkout.success && <p className="success-message">{checkout.success}</p>}<div className="expiry-list">{items.map((item) => { const days = Math.ceil((new Date(`${item.expiry_date}T00:00:00`) - new Date(`${today}T00:00:00`)) / 86400000); return <article className={days < 0 ? 'expired' : ''} key={item.id}><span><AlertTriangle/></span><div><strong>{item.name}</strong><small>Batch {item.batch_number} · {item.stock_quantity} unit(s)</small></div><div><b>{days < 0 ? 'Expired' : `${days} days left`}</b><small>{item.expiry_date}</small></div></article> })}{items.length === 0 && <p className="empty-state">No medicines expire within the next 60 days.</p>}</div></div>
}

function Metric({ icon, label, value = 0, caption = 'Live MySQL data', className = '' }) {
  return <div><span className={`dash-icon ${className}`}>{icon}</span><small>{label}</small><strong>{Number(value || 0).toLocaleString()}</strong><span className="dash-caption">{caption}</span></div>
}

createRoot(document.getElementById('root')).render(<App/>)
