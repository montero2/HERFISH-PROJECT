import { useEffect, useMemo, useState } from 'react'
import { apiClient } from './api'
import logo from './assets/logo_symbol.png'
import { BellIcon, BoxIcon, FileIcon, MenuIcon, UsersIcon } from './Icons'

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
  status: 'Pending Payment' | 'Paid' | 'Ready for Dispatch' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Completed'
  paymentStatus: 'Pending' | 'Paid'
  subtotal: number
  currency: string
  pickupPoint: string
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
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; read: boolean }>>([])
  const [compactMode, setCompactMode] = useState<boolean>(() => window.innerWidth < 1024)
  const [pickupPoint, setPickupPoint] = useState('Main Pickup Point')
  const [lastNotificationId, setLastNotificationId] = useState('')
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)

  const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : undefined), [token])
  const buildAuthHeaders = (tokenOverride?: string) => {
    const activeToken = tokenOverride ?? token
    return activeToken ? { Authorization: `Bearer ${activeToken}` } : undefined
  }

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

  const loadProfile = async (tokenOverride?: string) => {
    const headers = buildAuthHeaders(tokenOverride)
    if (!headers) {
      setCustomer(null)
      setOrders([])
      return
    }

    const [meResponse, ordersResponse] = await Promise.all([
      apiClient.get('/auth/me', { headers }),
      apiClient.get('/customer/orders', { headers }),
    ])

    setCustomer(meResponse.data?.data as Customer)
    setOrders(Array.isArray(ordersResponse.data?.data) ? (ordersResponse.data.data as Order[]) : [])

    try {
      const notificationsResponse = await apiClient.get('/notifications/customer', { headers })
      const notificationData = Array.isArray(notificationsResponse.data?.data) ? notificationsResponse.data.data : []
      setNotifications(notificationData)
      if (notificationData[0]?.id && notificationData[0].id !== lastNotificationId) {
        setLastNotificationId(notificationData[0].id)
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(notificationData[0].title, { body: notificationData[0].message })
          } catch (_error) {
            // Ignore browser notification constructor errors.
          }
        }
      }
    } catch (_error) {
      // Keep session active even if notifications endpoint is temporarily unavailable.
    }
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
    if (!authHeaders) {
      return
    }
    const timer = window.setInterval(() => {
      loadProfile().catch(() => {
        // Ignore polling errors.
      })
    }, 12000)
    return () => window.clearInterval(timer)
  }, [token])

  useEffect(() => {
    if (!('Notification' in window)) {
      return
    }
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => undefined)
    }
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
      await Promise.all([loadCatalog(), loadProfile(authData.token)])
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
      await apiClient.post('/customer/orders', { items: selectedItems, pickupPoint }, { headers: authHeaders })
      setQuantities({})
      setMessage('Order placed and synced to ERP.')
      await Promise.all([loadCatalog(), loadProfile()])
    } catch (_error) {
      setMessage('Order failed. Check quantities or stock and try again.')
    } finally {
      setBusy(false)
    }
  }

  const confirmDelivery = async (orderId: string) => {
    if (!authHeaders) {
      return
    }
    try {
      setBusy(true)
      await apiClient.patch(`/customer/orders/${orderId}/confirm-delivery`, {}, { headers: authHeaders })
      setMessage(`Delivery confirmed for ${orderId}.`)
      await loadProfile()
    } catch (_error) {
      setMessage('Could not confirm delivery yet.')
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

  const unreadCount = notifications.filter((item) => !item.read).length

  const timelineForStatus = (status: Order['status']) => {
    const stages: Array<{ key: Order['status']; label: string }> = [
      { key: 'Pending Payment', label: 'Order Placed' },
      { key: 'Paid', label: 'Payment Confirmed' },
      { key: 'Ready for Dispatch', label: 'ERP Confirmed' },
      { key: 'Packed', label: 'Packed' },
      { key: 'Out for Delivery', label: 'In Transit' },
      { key: 'Delivered', label: 'At Pickup Point' },
      { key: 'Completed', label: 'Collected' },
    ]
    const currentIndex = stages.findIndex((entry) => entry.key === status)
    return stages.map((entry, idx) => ({ ...entry, active: idx <= currentIndex }))
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
          <div className="brand-left">
            <img src={logo} alt="HERFISH LEGACY logo" className="logo-mark" />
            <div>
              <h1>HERFISH LEGACY</h1>
              <p>Customer App</p>
            </div>
          </div>
          <nav className="bubble-nav centered-nav" style={{ display: compactMode ? 'none' : 'flex' }}>
            <button className={`bubble-item ${activeView === 'catalog' ? 'active' : ''}`} onClick={() => setActiveView('catalog')}>
              <BoxIcon />
              <span>Catalog and Cart</span>
            </button>
            <button className={`bubble-item ${activeView === 'orders' ? 'active' : ''}`} onClick={() => setActiveView('orders')}>
              <FileIcon />
              <span>My Orders</span>
            </button>
            <button className={`bubble-item ${activeView === 'account' ? 'active' : ''}`} onClick={() => setActiveView('account')}>
              <UsersIcon />
              <span>Account</span>
            </button>
          </nav>
          <div className="header-right desktop-right">
            <button type="button" className="menu-toggle mobile-menu-only" style={{ display: compactMode ? 'inline-flex' : 'none' }} onClick={() => setMobileMenuOpen((current) => !current)} aria-label="Open customer menu"><MenuIcon /></button>
            <div className="user-badge">{customer.name.slice(0, 2).toUpperCase()}</div>
            <button className="ghost-btn desktop-signout" style={{ display: compactMode ? 'none' : 'inline-flex' }} onClick={signOut}>Sign Out</button>
            {canInstall && (
              <button className="ghost-btn desktop-signout" style={{ display: compactMode ? 'none' : 'inline-flex' }} onClick={installCustomerApp}>
                Install App
              </button>
            )}
            <button
              type="button"
              className="menu-toggle"
              style={{ display: compactMode ? 'none' : 'inline-flex' }}
              onClick={() => setNotificationOpen((current) => !current)}
              aria-label="Open notifications"
            >
              <BellIcon />
              {unreadCount > 0 && <span className="sr-only">{` ${unreadCount} unread`}</span>}
            </button>
          </div>
        </div>

        {mobileMenuOpen && compactMode && (
          <div className="mobile-corner-menu">
            <button className={`mobile-corner-item ${activeView === 'catalog' ? 'active' : ''}`} onClick={() => { setActiveView('catalog'); setMobileMenuOpen(false) }}>Catalog and Cart</button>
            <button className={`mobile-corner-item ${activeView === 'orders' ? 'active' : ''}`} onClick={() => { setActiveView('orders'); setMobileMenuOpen(false) }}>My Orders</button>
            <button className={`mobile-corner-item ${activeView === 'account' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setMobileMenuOpen(false) }}>Account</button>
            <button className="mobile-corner-item" onClick={signOut}>Sign Out</button>
            {canInstall && <button className="mobile-corner-item" onClick={installCustomerApp}>Install App</button>}
            <button className="mobile-corner-item" onClick={() => setNotificationOpen((current) => !current)}>Notifications ({unreadCount})</button>
          </div>
        )}
        {notificationOpen && (
          <div className="mobile-corner-menu" style={{ display: 'block', right: compactMode ? 16 : 70 }}>
            {notifications.length === 0 && <p className="hint-text">No notifications yet.</p>}
            {notifications.slice(0, 6).map((item) => (
              <div key={item.id} className="catalog-item" style={{ marginBottom: 8 }}>
                <h4>{item.title}</h4>
                <p>{item.message}</p>
              </div>
            ))}
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
                <select value={pickupPoint} onChange={(event) => setPickupPoint(event.target.value)}>
                  <option>Main Pickup Point</option>
                  <option>Beach Market Pickup</option>
                  <option>Town Center Pickup</option>
                  <option>Cold Room Hub Pickup</option>
                </select>
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
                      <p>Pickup: {order.pickupPoint}</p>
                      <p>Status: {order.status}</p>
                      <p>{formatter.format(order.subtotal)}</p>
                      <div className="timeline">
                        {timelineForStatus(order.status).map((step) => (
                          <span key={`${order.id}-${step.key}`} className={`timeline-step ${step.active ? 'active' : ''}`}>
                            {step.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="order-right">
                      <span className={order.paymentStatus === 'Paid' ? 'tag paid' : 'tag pending'}>{order.paymentStatus}</span>
                      {order.paymentStatus === 'Pending' && (
                        <button className="primary-btn" disabled={busy} onClick={() => payOrder(order.id)}>Pay Now</button>
                      )}
                      {order.status === 'Delivered' && (
                        <button className="primary-btn" disabled={busy} onClick={() => confirmDelivery(order.id)}>Confirm Pickup</button>
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

