import { useEffect, useMemo, useState } from 'react'
import { distributorApi } from './api'
import logo from './assets/logo_symbol.png'

type DistributorOrderStatus = 'Ready for Dispatch' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Completed'

type DistributorOrder = {
  id: string
  customerName: string
  customerEmail: string
  date: string
  status: DistributorOrderStatus
  paymentStatus: 'Pending' | 'Paid'
  subtotal: number
  currency: string
  pickupPoint: string
  items: Array<{ inventoryId: string; product: string; qty: number }>
}

const tokenKey = 'herfish_distributor_token'
const currencyFormatter = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' })

const nextActionMap: Partial<Record<DistributorOrderStatus, DistributorOrderStatus>> = {
  'Ready for Dispatch': 'Packed',
  Packed: 'Out for Delivery',
  'Out for Delivery': 'Delivered',
}

const nextActionLabelMap: Partial<Record<DistributorOrderStatus, string>> = {
  'Ready for Dispatch': 'Mark Packed',
  Packed: 'Mark Out for Delivery',
  'Out for Delivery': 'Mark Delivered',
}

export default function App() {
  const [email, setEmail] = useState('distributor@herfishlegacy.com')
  const [password, setPassword] = useState('distributor123')
  const [token, setToken] = useState(localStorage.getItem(tokenKey) ?? '')
  const [orders, setOrders] = useState<DistributorOrder[]>([])
  const [message, setMessage] = useState('')
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; read: boolean }>>([])
  const [lastNotificationId, setLastNotificationId] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionBusyByOrder, setActionBusyByOrder] = useState<Record<string, boolean>>({})

  const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : undefined), [token])

  const loadQueue = async (headers = authHeaders) => {
    if (!headers) {
      return
    }
    const response = await distributorApi.get('/distributor/orders', { headers })
    const queue = Array.isArray(response.data?.data) ? (response.data.data as DistributorOrder[]) : []
    setOrders(queue)
  }

  const loadNotifications = async (headers = authHeaders) => {
    if (!headers) {
      return
    }
    try {
      const response = await distributorApi.get('/notifications/distributor', { headers })
      const data = Array.isArray(response.data?.data) ? response.data.data : []
      setNotifications(data)
      if (data[0]?.id && data[0].id !== lastNotificationId) {
        setLastNotificationId(data[0].id)
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(data[0].title, { body: data[0].message })
          } catch (_error) {
            // Ignore browser notification constructor errors.
          }
        }
      }
    } catch (_error) {
      // Keep distributor session active even if notifications endpoint is temporarily unavailable.
    }
  }

  useEffect(() => {
    const bootstrap = async () => {
      if (!authHeaders) {
        return
      }
      try {
        await distributorApi.get('/auth/distributor/me', { headers: authHeaders })
        await loadQueue(authHeaders)
        await loadNotifications(authHeaders)
      } catch (_error) {
        localStorage.removeItem(tokenKey)
        setToken('')
      }
    }
    bootstrap()
  }, [token])

  useEffect(() => {
    if (!authHeaders) {
      return
    }
    const timer = window.setInterval(() => {
      Promise.all([loadQueue(authHeaders), loadNotifications(authHeaders)]).catch(() => undefined)
    }, 12000)
    return () => window.clearInterval(timer)
  }, [token])

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setBusy(true)
      const response = await distributorApi.post('/auth/distributor/login', {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      })
      const newToken = response.data?.data?.token as string | undefined
      if (!newToken) {
        throw new Error('No token returned.')
      }
      localStorage.setItem(tokenKey, newToken)
      setToken(newToken)
      setMessage('Distributor login successful.')
    } catch (_error) {
      setMessage('Distributor login failed. Verify credentials.')
    } finally {
      setBusy(false)
    }
  }

  const logout = async () => {
    try {
      if (authHeaders) {
        await distributorApi.post('/auth/distributor/logout', {}, { headers: authHeaders })
      }
    } catch (_error) {
      // Ignore logout cleanup errors.
    } finally {
      localStorage.removeItem(tokenKey)
      setToken('')
      setOrders([])
    }
  }

  const updateOrderStatus = async (order: DistributorOrder) => {
    const nextStatus = nextActionMap[order.status]
    if (!nextStatus || !authHeaders) {
      return
    }
    try {
      setActionBusyByOrder((current) => ({ ...current, [order.id]: true }))
      await distributorApi.patch(
        `/distributor/orders/${order.id}/status`,
        { status: nextStatus },
        { headers: authHeaders },
      )
      await loadQueue(authHeaders)
      await loadNotifications(authHeaders)
      setMessage(`Order ${order.id} updated to ${nextStatus}.`)
    } catch (_error) {
      setMessage('Could not update distributor order status.')
    } finally {
      setActionBusyByOrder((current) => ({ ...current, [order.id]: false }))
    }
  }

  if (!token) {
    return (
      <main className="page login-page">
        <section className="login-card">
          <div className="brand">
            <img src={logo} alt="HERFISH logo" className="logo" />
            <div>
              <h1>HERFISH LEGACY</h1>
              <p>Distributor App Login</p>
            </div>
          </div>
          <form className="login-form" onSubmit={login}>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
            <button disabled={busy} type="submit">{busy ? 'Signing in...' : 'Sign In'}</button>
          </form>
          {message && <p className="message">{message}</p>}
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <header className="header">
        <div className="brand">
          <img src={logo} alt="HERFISH logo" className="logo" />
          <div>
            <h1>HERFISH LEGACY</h1>
            <p>Distributor Dispatch Board</p>
          </div>
        </div>
        <button className="logout" onClick={logout}>Sign Out</button>
      </header>

      {message && <p className="message">{message}</p>}

      <section className="metrics">
        <article>
          <h3>Ready for Dispatch</h3>
          <p>{orders.filter((order) => order.status === 'Ready for Dispatch').length}</p>
        </article>
        <article>
          <h3>Packed</h3>
          <p>{orders.filter((order) => order.status === 'Packed').length}</p>
        </article>
        <article>
          <h3>Out for Delivery</h3>
          <p>{orders.filter((order) => order.status === 'Out for Delivery').length}</p>
        </article>
        <article>
          <h3>Delivered</h3>
          <p>{orders.filter((order) => order.status === 'Delivered').length}</p>
        </article>
        <article>
          <h3>Completed</h3>
          <p>{orders.filter((order) => order.status === 'Completed').length}</p>
        </article>
      </section>

      <section className="queue">
        <h2>Notifications</h2>
        {notifications.length === 0 && <p className="empty">No notifications yet.</p>}
        {notifications.slice(0, 5).map((item) => (
          <article key={item.id} className="order-card">
            <div>
              <strong>{item.title}</strong>
              <p>{item.message}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="queue">
        <h2>Distributor Queue</h2>
        {orders.length === 0 && <p className="empty">No orders on distributor queue yet.</p>}
        {orders.map((order) => (
          <article key={order.id} className="order-card">
            <div>
              <strong>{order.id}</strong>
              <p>{order.customerName} ({order.customerEmail})</p>
              <p>Pickup Point: {order.pickupPoint}</p>
              <p>{order.items.length} item(s) | {currencyFormatter.format(order.subtotal)}</p>
              <p>Status: {order.status}</p>
            </div>
            {nextActionMap[order.status] && (
              <button
                disabled={actionBusyByOrder[order.id]}
                onClick={() => updateOrderStatus(order)}
              >
                {actionBusyByOrder[order.id] ? 'Saving...' : nextActionLabelMap[order.status]}
              </button>
            )}
          </article>
        ))}
      </section>

      <footer className="footer">
        <p>MADE BY MOSESTA LIMITED</p>
        <p>{'\u00A9'} All rights reserved</p>
      </footer>
    </main>
  )
}
