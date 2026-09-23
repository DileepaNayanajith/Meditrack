import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowRight,
  Bell,
  Box,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  HeartPulse,
  LockKeyhole,
  Mail,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import './styles.css'
import './theme.css'

const DEMO_EMAIL = 'demo@meditrack.app'
const DEMO_PASSWORD = 'MediTrack2026!'
const SESSION_KEY = 'meditrack-demo-session'

function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? 'brand-light' : ''}`}>
      <span className="brand-mark">
        <HeartPulse size={21} strokeWidth={2.4} />
      </span>

      <span>
        Medi
        <span className="brand-accent">Track</span>
        <small>.</small>
      </span>
    </div>
  )
}

function App() {
  const [signedIn, setSignedIn] = useState(
    () =>
      sessionStorage.getItem(SESSION_KEY) === 'true' ||
      localStorage.getItem(SESSION_KEY) === 'true'
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function signIn(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      return setError('Please enter your email and password.')
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return setError('Enter a valid email address.')
    }

    setBusy(true)

    window.setTimeout(() => {
      setBusy(false)

      if (
        email.trim().toLowerCase() !== DEMO_EMAIL ||
        password !== DEMO_PASSWORD
      ) {
        setError(
          'Those details do not match the demo account. Use the demo sign-in below.'
        )
        return
      }

      const storage = remember ? localStorage : sessionStorage
      storage.setItem(SESSION_KEY, 'true')
      setSignedIn(true)
    }, 450)
  }

  function useDemo() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setError('')
  }

  function signOut() {
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_KEY)
    setSignedIn(false)
    setPassword('')
  }

  if (signedIn) {
    return <Dashboard onSignOut={signOut} />
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <Brand />

        <nav className="top-links" aria-label="Main navigation">
          <a href="#features">Why MediTrack</a>
          <a href="#security">Security</a>
          <span className="nav-divider" />

          <span className="nav-help">
            Need help?{' '}
            <a href="mailto:hello@meditrack.app">
              Contact us <ArrowRight size={13} />
            </a>
          </span>
        </nav>
      </header>

      <main className="login-layout">
        <section
          className="story-panel"
          aria-label="MediTrack introduction"
        >
          <div className="story-content">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              THE SMARTER WAY TO CARE
            </div>

            <h1>
              Every medicine.
              <br />
              <em>Every moment.</em>
              <br />
              In your hands.
            </h1>

            <p className="story-copy">
              Stay ahead of stock levels and expiry dates with an inventory
              workspace that feels as thoughtful as the care you provide.
            </p>

            <div className="feature-row" id="features">
              <span>
                <span className="feature-icon">
                  <PackageCheck size={18} />
                </span>
                Stock clarity
              </span>

              <span>
                <span className="feature-icon">
                  <Bell size={18} />
                </span>
                Expiry alerts
              </span>

              <span>
                <span className="feature-icon">
                  <TrendingUp size={18} />
                </span>
                Better decisions
              </span>
            </div>
          </div>

          <div className="visual-card" aria-hidden="true">
            <div className="visual-card-header">
              <span className="window-dots">
                <i />
                <i />
                <i />
              </span>

              <span>Inventory overview</span>

              <span className="visual-more">•••</span>
            </div>

            <div className="visual-card-inner">
              <div className="mini-title">
                Good morning, Alex <span>✳</span>
              </div>

              <div className="mini-subtitle">
                Here's how your inventory is looking today.
              </div>

              <div className="mini-stats">
                <div>
                  <span className="mini-icon mint">
                    <Box size={15} />
                  </span>

                  <small>In stock</small>
                  <strong>1,284</strong>
                  <span className="positive">↑ 8.2%</span>
                </div>

                <div>
                  <span className="mini-icon peach">
                    <Bell size={15} />
                  </span>

                  <small>Expiring soon</small>
                  <strong>12</strong>
                  <span className="muted">Next 30 days</span>
                </div>
              </div>

              <div className="mini-chart">
                <div className="chart-top">
                  <span>Stock activity</span>

                  <span>
                    This month <ChevronDown size={10} />
                  </span>
                </div>

                <div className="bars">
                  {[37, 58, 46, 68, 55, 78, 64, 88, 70, 95, 80, 100].map(
                    (v, i) => (
                      <i
                        key={i}
                        style={{ height: `${v}%` }}
                      />
                    )
                  )}
                </div>

                <div className="chart-labels">
                  <span>1 Sep</span>
                  <span>15 Sep</span>
                  <span>30 Sep</span>
                </div>
              </div>
            </div>
          </div>

          <div className="story-footer">
            <span>
              <ShieldCheck size={17} /> Built for peace of mind
            </span>

            <span>© 2026 MediTrack</span>
          </div>
        </section>

        <section className="form-panel">
          <div className="form-wrap">
            <div className="form-kicker">
              <span className="kicker-line" />
              WELCOME BACK
            </div>

            <h2>
              Sign in to your
              <br />
              <span>workspace.</span>
            </h2>

            <p className="form-intro">
              Your inventory is ready when you are.
            </p>

            <form onSubmit={signIn} noValidate>
              <label htmlFor="email">Email address</label>

              <div className="input-wrap">
                <Mail size={19} />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@yourpharmacy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <label htmlFor="password">Password</label>

              <div className="input-wrap">
                <LockKeyhole size={19} />

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              <div className="form-options">
                <label className="remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />

                  <span>Remember me</span>
                </label>

                <span className="forgot">
                  Demo only · no password reset yet
                </span>
              </div>

              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="submit-button"
                type="submit"
                disabled={busy}
              >
                {busy ? 'Signing in…' : 'Sign in to MediTrack'}

                {!busy && <ArrowRight size={19} />}
              </button>
            </form>

            <div className="divider">
              <span>OR TRY IT OUT</span>
            </div>

            <button
              className="demo-button"
              type="button"
              onClick={useDemo}
            >
              <Sparkles size={18} />
              Fill in demo account
              <ArrowRight size={17} />
            </button>

            <p className="demo-note">
              This is a local preview. The demo account does not access real
              patient or pharmacy data.
            </p>
          </div>

          <div className="form-footer" id="security">
            <ShieldCheck size={16} />
            A thoughtfully protected workspace
            <span className="footer-dot">·</span>
            Local demo
          </div>
        </section>
      </main>
    </div>
  )
}

function Dashboard({ onSignOut }) {
  return (
    <div className="dashboard">
      <aside className="dash-sidebar">
        <Brand />

        <div className="sidebar-label">WORKSPACE</div>

        <a className="active" href="#overview">
          <Box size={18} />
          Overview
        </a>

        <a href="#inventory">
          <PackageCheck size={18} />
          Inventory
          <span>Coming soon</span>
        </a>

        <a href="#alerts">
          <Bell size={18} />
          Expiry alerts
          <span>Coming soon</span>
        </a>

        <div className="sidebar-bottom">
          <div className="avatar">A</div>

          <div>
            <strong>Alex Morgan</strong>
            <small>Demo account</small>
          </div>
        </div>
      </aside>

      <main className="dash-main">
        <header>
          <span>Workspace / Overview</span>

          <button onClick={onSignOut}>
            Sign out <ArrowRight size={16} />
          </button>
        </header>

        <div className="dash-content" id="overview">
          <div className="dash-welcome">
            MONDAY, SEPTEMBER 21, 2026
          </div>

          <h1>
            Welcome back, Alex <span>✳</span>
          </h1>

          <p>Here’s your medicine inventory at a glance.</p>

          <div className="dash-grid">
            <div>
              <span className="dash-icon">
                <Box />
              </span>

              <small>Medicines in stock</small>
              <strong>1,284</strong>

              <span className="dash-caption">
                Demo preview
              </span>
            </div>

            <div>
              <span className="dash-icon amber">
                <Bell />
              </span>

              <small>Expiring soon</small>
              <strong>12</strong>

              <span className="dash-caption">
                Next 30 days · demo preview
              </span>
            </div>

            {/* NEW UI IMPLEMENTATION */}
            <div>
              <span className="dash-icon blue">
                <PackageCheck />
              </span>

              <small>Low stock</small>
              <strong>8</strong>

              <span className="dash-caption">
                Needs attention
              </span>
            </div>
          </div>

          <div className="next-card">
            <span className="next-icon">
              <Check size={21} />
            </span>

            <div>
              <strong>You’re signed in.</strong>

              <p>
                The login flow is working. Inventory management and live
                data are the next step once a backend is connected.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)