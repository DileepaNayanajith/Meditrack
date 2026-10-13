import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AlertTriangle, ArrowLeft, ArrowRight, Bell, Box, Check, ClipboardList, DollarSign, Eye, EyeOff, HeartPulse, LayoutDashboard, LockKeyhole, Mail, Minus, PackageCheck, Pencil, Plus, ReceiptText, Search, ShieldCheck, ShoppingCart, Trash2, TrendingUp, UserRound, X } from 'lucide-react'
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
  const [metrics, setMetrics] = useState({ totalStockQty: 0, totalInventoryValue: 0, expiringSoonCount: 0, lowStockCount: 0, expiredCount: 0 })
  const [medicines, setMedicines] = useState([])
  const [state, setState] = useState({ loading: true, error: '' })
  const [view, setView] = useState('overview')
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [customer, setCustomer] = useState({ name: '', email: '', payment: 'cash' })
  const [checkout, setCheckout] = useState({ busy: false, error: '', success: '' })
  const [sales, setSales] = useState([])
  const [salesState, setSalesState] = useState({ loading: false, error: '' })

  const authenticatedApi = (path, options = {}) => api(path, { ...options, headers: { Authorization: `Bearer ${session.token}`, ...options.headers } })

  function loadInventory() {
    setState({ loading: true, error: '' })
    Promise.all([api('/medicines/summary'), api('/medicines')])
      .then(([summary, list]) => { setMetrics(summary.data); setMedicines(list.data || []); setState({ loading: false, error: '' }) })
      .catch((error) => setState({ loading: false, error: error instanceof TypeError ? 'Backend is offline. Run npm run server.' : error.message }))
  }

  useEffect(loadInventory, [])

  useEffect(() => {
    if (view !== 'sales') return
    setSalesState({ loading: true, error: '' })
    authenticatedApi('/sales')
      .then((data) => { setSales(data.data || []); setSalesState({ loading: false, error: '' }) })
      .catch((error) => setSalesState({ loading: false, error: error.message }))
  }, [view])

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
  const viewName = { overview: 'Overview', inventory: 'Inventory', pos: 'Point of sale', sales: 'Sales history', expiry: 'Expiry alerts' }[view]
  return <div className="dashboard"><aside className="dash-sidebar"><Brand/><div className="sidebar-label">WORKSPACE</div><button className={view === 'overview' ? 'active' : ''} onClick={() => setView('overview')}><Box size={18}/> Overview</button><button className={view === 'inventory' ? 'active' : ''} onClick={() => setView('inventory')}><PackageCheck size={18}/> Inventory <span>{medicines.length}</span></button><button className={view === 'pos' ? 'active' : ''} onClick={() => setView('pos')}><ShoppingCart size={18}/> Point of sale <span>{cart.length || ''}</span></button><button className={view === 'sales' ? 'active' : ''} onClick={() => setView('sales')}><ClipboardList size={18}/> Sales history</button><button className={view === 'expiry' ? 'active' : ''} onClick={() => setView('expiry')}><Bell size={18}/> Expiry alerts <span>{expiring.length}</span></button><div className="sidebar-bottom"><div className="avatar">{firstName[0]?.toUpperCase()}</div><div><strong>{name}</strong><small>{session.user.role}</small></div></div></aside>
    <main className="dash-main"><header><span>Workspace / {viewName}</span><button onClick={onSignOut}>Sign out <ArrowRight size={16}/></button></header>
      {view === 'overview' && <Overview firstName={firstName} metrics={metrics} medicines={medicines} state={state}/>}
      {view === 'inventory' && <InventoryManager medicines={medicines} apiCall={authenticatedApi} onChanged={loadInventory}/>}
      {view === 'pos' && <POS medicines={sellable} search={search} setSearch={setSearch} cart={cart} addToCart={addToCart} changeQuantity={changeQuantity} total={cartTotal} customer={customer} setCustomer={setCustomer} checkout={checkout} completeSale={completeSale}/>}
      {view === 'sales' && <SalesHistory sales={sales} state={salesState}/>}
      {view === 'expiry' && <ExpiryView items={expiring} today={today} checkout={checkout} sendExpiryEmail={sendExpiryEmail} canEmail={session.user.role === 'admin'}/>}
    </main><nav className="mobile-nav" aria-label="Mobile navigation"><button className={view === 'overview' ? 'active' : ''} onClick={() => setView('overview')}><LayoutDashboard/><span>Home</span></button><button className={view === 'inventory' ? 'active' : ''} onClick={() => setView('inventory')}><PackageCheck/><span>Stock</span></button><button className={view === 'pos' ? 'active pos-mobile' : 'pos-mobile'} onClick={() => setView('pos')}><ShoppingCart/><span>Sale</span></button><button className={view === 'sales' ? 'active' : ''} onClick={() => setView('sales')}><ClipboardList/><span>History</span></button><button className={view === 'expiry' ? 'active' : ''} onClick={() => setView('expiry')}><Bell/><span>Alerts</span></button></nav></div>
}

function Overview({ firstName, metrics, medicines, state }) {
  const lowStock = medicines.filter((item) => Number(item.stock_quantity) <= Number(item.min_stock_level)).slice(0, 4)
  const healthyCount = Math.max(0, medicines.length - Number(metrics.lowStockCount || 0) - Number(metrics.expiredCount || 0))
  const healthPercent = medicines.length ? Math.round((healthyCount / medicines.length) * 100) : 0
  return <div className="dash-content overview-page" id="overview"><div className="overview-hero"><div><div className="dash-welcome">LIVE INVENTORY</div><h1>Welcome back, {firstName}</h1><p>Here’s your pharmacy performance and stock health today.</p></div><div className="live-badge"><i/> Live database</div></div><div className="dash-grid dashboard-kpis"><Metric icon={<Box/>} label="Units in stock" value={metrics.totalStockQty}/><Metric className="value" icon={<DollarSign/>} label="Inventory value" value={`LKR ${Number(metrics.totalInventoryValue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} caption="Current stock value"/><Metric className="amber" icon={<Bell/>} label="Expiring soon" value={metrics.expiringSoonCount} caption="Next 60 days"/><Metric className="danger" icon={<AlertTriangle/>} label="Expired items" value={metrics.expiredCount} caption="Action required"/></div>{state.error && <div className="data-error"><strong>Could not load MySQL data</strong><p>{state.error}</p></div>}<div className="insight-grid"><section className="health-card"><div className="card-heading"><div><span>STOCK HEALTH</span><h2>Inventory overview</h2></div><strong>{healthPercent}%</strong></div><div className="health-track"><i style={{ width: `${healthPercent}%` }}/></div><div className="health-legend"><span><i className="healthy"/> Healthy <b>{healthyCount}</b></span><span><i className="warning"/> Low stock <b>{metrics.lowStockCount}</b></span><span><i className="expired-dot"/> Expired <b>{metrics.expiredCount}</b></span></div></section><section className="attention-card"><div className="card-heading"><div><span>NEEDS ATTENTION</span><h2>Low stock items</h2></div><PackageCheck/></div>{lowStock.map((item) => <div className="attention-row" key={item.id}><div><strong>{item.name}</strong><small>Batch {item.batch_number}</small></div><span>{item.stock_quantity} left</span></div>)}{lowStock.length === 0 && <p className="all-good"><Check/> All stock levels look healthy.</p>}</section></div><InventoryTable medicines={medicines} loading={state.loading}/></div>
}

function InventoryTable({ medicines, loading }) {
  return <section className="inventory-card"><div className="inventory-heading"><div><span>DATABASE RECORDS</span><h2>Medicine inventory</h2></div><strong>{loading ? 'Loading…' : `${medicines.length} items`}</strong></div>{!loading && medicines.length === 0 && <p className="empty-state">No medicine records found.</p>}{medicines.length > 0 && <div className="table-scroll"><table><thead><tr><th>Medicine</th><th>Batch</th><th>Stock</th><th>Expiry</th><th>Supplier</th></tr></thead><tbody>{medicines.map((medicine) => <tr key={medicine.id}><td><strong>{medicine.name}</strong><small>{medicine.category}</small></td><td>{medicine.batch_number}</td><td><span className={Number(medicine.stock_quantity) <= Number(medicine.min_stock_level) ? 'stock-low' : 'stock-ok'}>{medicine.stock_quantity}</span></td><td>{medicine.expiry_date}</td><td>{medicine.supplier_name || '—'}</td></tr>)}</tbody></table></div>}</section>
}

const emptyMedicine = { name: '', generic_name: '', category: 'General', batch_number: '', stock_quantity: 0, min_stock_level: 10, expiry_date: '', unit_price: 0, location: 'Main Shelf' }

function InventoryManager({ medicines, apiCall, onChanged }) {
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyMedicine)
  const [message, setMessage] = useState({ busy: false, error: '', success: '' })
  const shown = medicines.filter((item) => `${item.name} ${item.generic_name || ''} ${item.batch_number}`.toLowerCase().includes(query.toLowerCase()))
  const update = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }))

  function openForm(item = null) {
    setEditing(item?.id || 'new')
    setForm(item ? { ...emptyMedicine, ...item, expiry_date: String(item.expiry_date).slice(0, 10) } : emptyMedicine)
    setMessage({ busy: false, error: '', success: '' })
  }

  async function save(event) {
    event.preventDefault(); setMessage({ busy: true, error: '', success: '' })
    try {
      const path = editing === 'new' ? '/medicines' : `/medicines/${editing}`
      const method = editing === 'new' ? 'POST' : 'PUT'
      const data = await apiCall(path, { method, body: JSON.stringify({ ...form, stock_quantity: Number(form.stock_quantity), min_stock_level: Number(form.min_stock_level), unit_price: Number(form.unit_price) }) })
      setMessage({ busy: false, error: '', success: data.message }); setEditing(null); onChanged()
    } catch (error) { setMessage({ busy: false, error: error.message, success: '' }) }
  }

  async function remove(item) {
    if (!window.confirm(`Delete ${item.name} (${item.batch_number})?`)) return
    setMessage({ busy: true, error: '', success: '' })
    try { const data = await apiCall(`/medicines/${item.id}`, { method: 'DELETE' }); setMessage({ busy: false, error: '', success: data.message }); onChanged() }
    catch (error) { setMessage({ busy: false, error: error.message, success: '' }) }
  }

  return <div className="dash-content inventory-page"><div className="section-toolbar"><div><div className="dash-welcome">STOCK CONTROL</div><h1>Inventory management</h1><p>Add medicines and keep quantities, prices and expiry dates accurate.</p></div><button className="primary-action" onClick={() => openForm()}><Plus size={17}/> Add medicine</button></div>
    <div className="inventory-tools"><div className="pos-search"><Search size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search medicine or batch…"/></div><strong>{shown.length} records</strong></div>
    {message.error && <p className="checkout-error">{message.error}</p>}{message.success && <p className="success-message">{message.success}</p>}
    <section className="inventory-card"><div className="table-scroll"><table><thead><tr><th>Medicine</th><th>Batch</th><th>Stock</th><th>Price</th><th>Expiry</th><th>Location</th><th>Actions</th></tr></thead><tbody>{shown.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.generic_name || item.category}</small></td><td>{item.batch_number}</td><td><span className={Number(item.stock_quantity) <= Number(item.min_stock_level) ? 'stock-low' : 'stock-ok'}>{item.stock_quantity}</span></td><td>LKR {Number(item.unit_price).toFixed(2)}</td><td>{item.expiry_date}</td><td>{item.location || '—'}</td><td><div className="row-actions"><button onClick={() => openForm(item)} aria-label={`Edit ${item.name}`}><Pencil/></button><button className="danger" onClick={() => remove(item)} aria-label={`Delete ${item.name}`}><Trash2/></button></div></td></tr>)}</tbody></table></div>{shown.length === 0 && <p className="empty-state">No matching medicines found.</p>}</section>
    {editing && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setEditing(null)}><form className="medicine-modal" onSubmit={save}><div className="modal-title"><div><span>INVENTORY RECORD</span><h2>{editing === 'new' ? 'Add medicine' : 'Edit medicine'}</h2></div><button type="button" onClick={() => setEditing(null)}><X/></button></div><div className="medicine-fields"><label>Medicine name<input value={form.name} onChange={update('name')} required/></label><label>Generic name<input value={form.generic_name || ''} onChange={update('generic_name')}/></label><label>Category<input value={form.category} onChange={update('category')} required/></label><label>Batch number<input value={form.batch_number} onChange={update('batch_number')} required/></label><label>Stock quantity<input type="number" min="0" value={form.stock_quantity} onChange={update('stock_quantity')} required/></label><label>Minimum stock<input type="number" min="0" value={form.min_stock_level} onChange={update('min_stock_level')} required/></label><label>Unit price (LKR)<input type="number" min="0" step="0.01" value={form.unit_price} onChange={update('unit_price')} required/></label><label>Expiry date<input type="date" value={form.expiry_date} onChange={update('expiry_date')} required/></label><label className="field-wide">Shelf location<input value={form.location} onChange={update('location')}/></label></div>{message.error && <p className="checkout-error">{message.error}</p>}<button className="submit-button" disabled={message.busy}>{message.busy ? 'Saving…' : 'Save medicine'} {!message.busy && <Check size={18}/>}</button></form></div>}
  </div>
}

function SalesHistory({ sales, state }) {
  const revenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
  return <div className="dash-content"><div className="section-toolbar"><div><div className="dash-welcome">TRANSACTIONS</div><h1>Sales history</h1><p>Latest completed sales recorded by the point of sale.</p></div><div className="sales-total"><small>Total shown</small><strong>LKR {revenue.toFixed(2)}</strong></div></div>{state.error && <div className="data-error"><strong>Could not load sales</strong><p>{state.error}</p></div>}<section className="inventory-card"><div className="table-scroll"><table><thead><tr><th>Receipt</th><th>Customer</th><th>Cashier</th><th>Payment</th><th>Date</th><th>Total</th></tr></thead><tbody>{sales.map((sale) => <tr key={sale.id}><td><strong>{sale.sale_number}</strong><small>{sale.status}</small></td><td>{sale.customer_name || 'Walk-in customer'}</td><td>{sale.cashier_name || '—'}</td><td><span className="payment-pill">{sale.payment_method}</span></td><td>{new Date(sale.created_at).toLocaleString()}</td><td><strong>LKR {Number(sale.total).toFixed(2)}</strong></td></tr>)}</tbody></table></div>{!state.loading && sales.length === 0 && <p className="empty-state">No sales recorded yet.</p>}{state.loading && <p className="empty-state">Loading sales…</p>}</section></div>
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
  const formatted = typeof value === 'number' ? Number(value || 0).toLocaleString() : value
  return <div><span className={`dash-icon ${className}`}>{icon}</span><small>{label}</small><strong>{formatted}</strong><span className="dash-caption">{caption}</span></div>
}

createRoot(document.getElementById('root')).render(<App/>)
