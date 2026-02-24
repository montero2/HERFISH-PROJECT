import { useEffect, useMemo, useState } from 'react'
import { apiClient } from './api'
import logo from './assets/logo_symbol.png'

type Customer = {
  id: string
  name: string
  email: string
}

type CatalogItem = {
  id: string
  product: string
  category: string
  availableQty: number
  unit: string
  unitPrice: number
  currency: string
}

type Order = {
  id: string
  date: string
  status: 'Pending Payment' | 'Paid' | 'Processing' | 'Delivered'
  paymentStatus: 'Pending' | 'Paid'
  subtotal: number
  currency: string
}

type AuthResponse = {
  token: string
  customer: Customer
}

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const tokenKey = 'herfish_customer_token'
const formatter = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' })

export default function App() {
  const [activeView, setActiveView] = useState<'catalog' | 'orders' | 'account'>('catalog')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [token, setToken] = useState(localStorage.getItem(tokenKey) ?? sessionStorage.getItem(tokenKey) ?? '')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [orders, setOrders] = useState<Order[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [compactMode, setCompactMode] = useState<boolean>(() => window.innerWidth < 1024)
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)

  const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : undefined), [token])

  const selectedItems = useMemo(
    () =>
      catalog
        .map((item) => ({ inventoryId: item.id, qty: quantities[item.id] ?? 0 }))
        .filter((entry) => entry.qty > 0),
    [catalog, quantities],
  )

  const total = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      const catalogItem = catalog.find((entry) => entry.id === item.inventoryId)
      if (!catalogItem) {
        return sum
      }
      return sum + catalogItem.unitPrice * item.qty
    }, 0)
  }, [catalog, selectedItems])

  const loadCatalog = async () => {
    const response = await apiClient.get('/customer/catalog')
    const data = Array.isArray(response.data?.data) ? (response.data.data as CatalogItem[]) : []
    setCatalog(data)
  }

  const loadProfile = async () => {
    if (!authHeaders) {
      setCustomer(null)
      setOrders([])
      return
    }

    const [meResponse, ordersResponse] = await Promise.all([
      apiClient.get('/auth/me', { headers: authHeaders }),
      apiClient.get('/customer/orders', { headers: authHeaders }),
    ])

    setCustomer(meResponse.data?.data as Customer)
    setOrders(Array.isArray(ordersResponse.data?.data) ? (ordersResponse.data.data as Order[]) : [])
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const onChange = () => {
      setCompactMode(mediaQuery.matches)
      if (!mediaQuery.matches) {
        setMobileMenuOpen(false)
      }
    }
    onChange()
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onChange)
      return () => mediaQuery.removeEventListener('change', onChange)
    }
    mediaQuery.addListener(onChange)
    return () => mediaQuery.removeListener(onChange)
  }, [])

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
      setCanInstall(true)
    }
    const onInstalled = () => {
      setInstallPrompt(null)
      setCanInstall(false)
      setMessage('Customer app installed successfully on this device.')
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        return
      }
      try {
        await Promise.all([loadCatalog(), loadProfile()])
      } catch (_error) {
        localStorage.removeItem(tokenKey)
        sessionStorage.removeItem(tokenKey)
        setToken('')
        setCustomer(null)
        setOrders([])
        setMessage('Session expired. Please login again.')
      }
    }

    bootstrap()
  }, [token])

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = authForm.email.trim().toLowerCase()
    const password = authForm.password.trim()
    const name = authForm.name.trim()

    if (!email || !password || (authMode === 'register' && !name)) {
      setMessage('Please complete all required fields.')
      return
    }

    try {
      setBusy(true)
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login'
      const payload = authMode === 'register' ? { name, email, password } : { email, password }
      const response = await apiClient.post(endpoint, payload)
      const authData = response.data?.data as AuthResponse
      setToken(authData.token)
      if (rememberMe) {
        localStorage.setItem(tokenKey, authData.token)
        sessionStorage.removeItem(tokenKey)
      } else {
        sessionStorage.setItem(tokenKey, authData.token)
        localStorage.removeItem(tokenKey)
      }
      setCustomer(authData.customer)
      setMessage(authMode === 'register' ? 'Account created successfully.' : 'Login successful.')
      await Promise.all([loadCatalog(), loadProfile()])
    } catch (_error) {
      setMessage('Authentication failed. Verify your credentials.')
    } finally {
      setBusy(false)
    }
  }

  const placeOrder = async () => {
    if (!authHeaders) {
      setMessage('Login before placing an order.')
      return
    }
    if (selectedItems.length === 0) {
      setMessage('Select at least one item.')
      return
    }

    try {
      setBusy(true)
      await apiClient.post('/customer/orders', { items: selectedItems }, { headers: authHeaders })
      setQuantities({})
      setMessage('Order placed and synced to ERP.')
      await Promise.all([loadCatalog(), loadProfile()])
    } catch (_error) {
      setMessage('Order failed. Check quantities or stock and try again.')
    } finally {
      setBusy(false)
    }
  }

  const payOrder = async (orderId: string) => {
    if (!authHeaders) {
      return
    }
    try {
      setBusy(true)
      await apiClient.post(`/customer/orders/${orderId}/payments`, { method: 'Card' }, { headers: authHeaders })
      setMessage(`Payment recorded for ${orderId}.`)
      await loadProfile()
    } catch (_error) {
      setMessage('Payment failed. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const signOut = async () => {
    try {
      if (authHeaders) {
        await apiClient.post('/auth/logout', {}, { headers: authHeaders })
      }
    } catch (_error) {
      // Ignore network errors while clearing local session.
    } finally {
      localStorage.removeItem(tokenKey)
      sessionStorage.removeItem(tokenKey)
      setToken('')
      setCustomer(null)
      setOrders([])
      setCatalog([])
      setMobileMenuOpen(false)
      setMessage('Signed out.')
    }
  }

  const installCustomerApp = async () => {
    if (!installPrompt) {
      setMessage('Install option not available on this browser. Use Add to Home Screen from browser menu.')
      return
    }
    await installPrompt.prompt()
    const result = await installPrompt.userChoice
    if (result.outcome === 'accepted') {
      setMessage('Install request accepted. App will be available from your device home/apps screen.')
    } else {
      setMessage('Install canceled.')
    }
    setInstallPrompt(null)
    setCanInstall(false)
  }

  if (!customer) {
    return (
      <div className="customer-root">
        <main className="customer-main">
          <section className="login-card">
            <div className="brand-left">
              <img src={logo} alt="HERFISH LEGACY logo" className="logo-mark" />
              <div>
                <h1>HERFISH LEGACY</h1>
                <p>Customer App Login</p>
              </div>
            </div>
            <div className="auth-switch">
              <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Login</button>
              <button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>Register</button>
            </div>
            <form onSubmit={handleAuth} className="auth-form">
              {authMode === 'register' && (
                <input
                  value={authForm.name}
                  onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Business name"
                />
              )}
              <input
                type="email"
                value={authForm.email}
                onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="Email"
              />
              <div className="password-row">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={authForm.password}
                  onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Password"
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="secondary-btn">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <label className="remember-row">
                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                <span>Remember me on this device</span>
              </label>
              <button className="primary-btn" disabled={busy} type="submit">{busy ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Create Account'}</button>
            </form>
            {message && <p className="message">{message}</p>}
            {canInstall && (
              <button type="button" className="primary-btn" onClick={installCustomerApp}>
                Install Customer App
              </button>
            )}
          </section>
          <footer className="app-footer">
            <p className="footer-brand">MADE BY MOSESTA LIMITED</p>
            <p className="footer-rights">© All rights reserved</p>
          </footer>
        </main>
      </div>
    )
  }

  return (
    <div className="customer-root">
      <header className="top-header">
        <div className="brand-row">
          <div className="brand-nav-row">
            <div className="brand-left">
              <img src={logo} alt="HERFISH LEGACY logo" className="logo-mark" />
              <div>
                <h1>HERFISH LEGACY</h1>
                <p>Customer App</p>
              </div>
            </div>
            <nav className="bubble-nav" style={{ display: compactMode ? 'none' : 'flex' }}>
              <button className={`bubble-item ${activeView === 'catalog' ? 'active' : ''}`} onClick={() => setActiveView('catalog')}>Catalog and Cart</button>
              <button className={`bubble-item ${activeView === 'orders' ? 'active' : ''}`} onClick={() => setActiveView('orders')}>My Orders</button>
              <button className={`bubble-item ${activeView === 'account' ? 'active' : ''}`} onClick={() => setActiveView('account')}>Account</button>
            </nav>
          </div>
          <div className="header-right desktop-right">
            <button type="button" className="menu-toggle mobile-menu-only" style={{ display: compactMode ? 'inline-flex' : 'none' }} onClick={() => setMobileMenuOpen((current) => !current)} aria-label="Open customer menu">
              ☰
            </button>
            <div className="user-badge">{customer.name.slice(0, 2).toUpperCase()}</div>
            <button className="ghost-btn desktop-signout" style={{ display: compactMode ? 'none' : 'inline-flex' }} onClick={signOut}>Sign Out</button>
            {canInstall && (
              <button className="ghost-btn desktop-signout" style={{ display: compactMode ? 'none' : 'inline-flex' }} onClick={installCustomerApp}>
                Install App
              </button>
            )}
          </div>
        </div>

        {mobileMenuOpen && compactMode && (
          <div className="mobile-corner-menu">
            <button className={`mobile-corner-item ${activeView === 'catalog' ? 'active' : ''}`} onClick={() => { setActiveView('catalog'); setMobileMenuOpen(false) }}>Catalog and Cart</button>
            <button className={`mobile-corner-item ${activeView === 'orders' ? 'active' : ''}`} onClick={() => { setActiveView('orders'); setMobileMenuOpen(false) }}>My Orders</button>
            <button className={`mobile-corner-item ${activeView === 'account' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setMobileMenuOpen(false) }}>Account</button>
            <button className="mobile-corner-item" onClick={signOut}>Sign Out</button>
            {canInstall && <button className="mobile-corner-item" onClick={installCustomerApp}>Install App</button>}
          </div>
        )}
      </header>

      <main className="customer-main">
        <section className="customer-content">
          {message && <p className="message">{message}</p>}

          {activeView === 'catalog' && (
            <section className="card">
              <div className="section-title">
                <h3>Catalog</h3>
                <span>{catalog.length} products</span>
              </div>
              <div className="catalog-grid">
                {catalog.map((item) => (
                  <article key={item.id} className="catalog-item">
                    <h4>{item.product}</h4>
                    <p>{item.category}</p>
                    <p className="price">{formatter.format(item.unitPrice)} / {item.unit}</p>
                    <p className="stock">In stock: {item.availableQty} {item.unit}</p>
                    <input
                      type="number"
                      min={0}
                      max={item.availableQty}
                      value={quantities[item.id] ?? 0}
                      onChange={(event) => {
                        const raw = Number(event.target.value)
                        const quantity = Number.isFinite(raw) ? Math.min(Math.max(0, raw), item.availableQty) : 0
                        setQuantities((current) => ({ ...current, [item.id]: quantity }))
                      }}
                    />
                  </article>
                ))}
              </div>
              <div className="order-bar">
                <div>
                  <p>Selected: {selectedItems.length} item(s)</p>
                  <p className="total">Total {formatter.format(total)}</p>
                </div>
                <button className="primary-btn" onClick={placeOrder} disabled={busy}>Place Order</button>
              </div>
            </section>
          )}

          {activeView === 'orders' && (
            <section className="card">
              <div className="section-title">
                <h3>My Orders</h3>
                <span>{orders.length} order(s)</span>
              </div>
              {orders.length === 0 && <p className="empty">No orders yet.</p>}
              <div className="orders">
                {orders.map((order) => (
                  <div className="order" key={order.id}>
                    <div>
                      <strong>{order.id}</strong>
                      <p>{order.date}</p>
                      <p>{formatter.format(order.subtotal)}</p>
                    </div>
                    <div className="order-right">
                      <span className={order.paymentStatus === 'Paid' ? 'tag paid' : 'tag pending'}>{order.paymentStatus}</span>
                      {order.paymentStatus === 'Pending' && (
                        <button className="primary-btn" disabled={busy} onClick={() => payOrder(order.id)}>Pay Now</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeView === 'account' && (
            <section className="card">
              <div className="section-title">
                <h3>Account</h3>
              </div>
              <p><strong>Business:</strong> {customer.name}</p>
              <p><strong>Email:</strong> {customer.email}</p>
              <p className="hint-text">This account is used to place orders and payments that sync into HERFISH ERP.</p>
            </section>
          )}
        </section>
        <footer className="app-footer">
          <p className="footer-brand">MADE BY MOSESTA LIMITED</p>
          <p className="footer-rights">{'\u00A9'} All rights reserved</p>
        </footer>
      </main>
    </div>
  )
}
