import https from 'https'

export type InventoryStatus = 'Optimal' | 'Low Stock' | 'Critical'

export type InventoryItem = {
  id: string
  product: string
  category: string
  qty: number
  unit: string
  reorder: number
  status: InventoryStatus
  value: string
}

export type CustomerAccount = {
  id: string
  name: string
  email: string
  phone?: string
  password: string
  createdAt: string
}

export type SalesOrderStatus =
  | 'Pending Payment'
  | 'Paid'
  | 'Ready for Dispatch'
  | 'Packed'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Completed'

export type SalesOrderItem = {
  inventoryId: string
  product: string
  qty: number
  unitPrice: number
  lineTotal: number
}

export type SalesOrder = {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  pickupPoint: string
  date: string
  status: SalesOrderStatus
  items: SalesOrderItem[]
  currency: string
  subtotal: number
  paymentStatus: 'Pending' | 'Paid'
}

export type NotificationAudience = 'customer' | 'operator' | 'distributor'
export type NotificationChannel = 'in_app' | 'email' | 'sms'

export type NotificationItem = {
  id: string
  audience: NotificationAudience
  audienceId: string
  title: string
  message: string
  channels: NotificationChannel[]
  createdAt: string
  read: boolean
}

export type InvoiceStatus = 'Pending' | 'Paid'

export type Invoice = {
  id: string
  orderId: string
  customerId: string
  customerName: string
  customerEmail: string
  amount: number
  currency: string
  status: InvoiceStatus
  dueDate: string
  issuedDate: string
}

export type PaymentStatus = 'Completed' | 'Failed'

export type Payment = {
  id: string
  orderId: string
  invoiceId: string
  customerId: string
  amount: number
  currency: string
  method: string
  status: PaymentStatus
  paidAt: string
}

const nowIso = () => new Date().toISOString()
const futureDateIso = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const unitPriceFromValue = (value: string, qty: number) => {
  const numeric = Number((value || '').replace(/[^\d.]/g, ''))
  if (!Number.isFinite(numeric) || numeric <= 0 || qty <= 0) {
    return 0
  }
  return numeric / qty
}

export const computeInventoryStatus = (qty: number, reorder: number): InventoryStatus => {
  if (qty <= Math.floor(reorder * 0.5)) {
    return 'Critical'
  }
  if (qty <= reorder) {
    return 'Low Stock'
  }
  return 'Optimal'
}

export const inventoryItems: InventoryItem[] = [
  { id: 'INV-001', product: 'Atlantic Salmon', category: 'Fresh Fish', qty: 450, unit: 'kg', reorder: 200, status: 'Optimal', value: 'KSh 1,125,000' },
  { id: 'INV-002', product: 'Tilapia Fillet', category: 'Fresh Fish', qty: 120, unit: 'kg', reorder: 300, status: 'Low Stock', value: 'KSh 48,000' },
  { id: 'INV-003', product: 'Shrimp Premium', category: 'Shellfish', qty: 85, unit: 'kg', reorder: 150, status: 'Low Stock', value: 'KSh 153,000' },
  { id: 'INV-004', product: 'Crab Meat', category: 'Shellfish', qty: 320, unit: 'kg', reorder: 100, status: 'Optimal', value: 'KSh 384,000' },
  { id: 'INV-005', product: 'Sardine Whole', category: 'Fresh Fish', qty: 650, unit: 'kg', reorder: 400, status: 'Optimal', value: 'KSh 227,500' },
]

export const customerAccounts: CustomerAccount[] = [
  {
    id: 'CUST-001',
    name: 'Fresh Mart',
    email: 'buyer@freshmart.com',
    phone: '+254700000001',
    password: 'buyer123',
    createdAt: nowIso(),
  },
]

export const sessionByToken = new Map<string, string>()
export const operatorSessionByToken = new Map<string, string>()
export const distributorSessionByToken = new Map<string, string>()
export const notifications: NotificationItem[] = []

export const salesOrders: SalesOrder[] = []
export const invoices: Invoice[] = []
export const payments: Payment[] = []

const nextId = (prefix: string, count: number) => `${prefix}-${String(count + 1).padStart(3, '0')}`

export const createSessionToken = () => `token-${Math.random().toString(36).slice(2, 10)}`

export const getBearerToken = (authorizationHeader: string) => {
  return authorizationHeader.startsWith('Bearer ') ? authorizationHeader.slice(7) : ''
}

const postJson = (params: { hostname: string; path: string; headers?: Record<string, string>; body: unknown }) =>
  new Promise<void>((resolve, reject) => {
    const payload = JSON.stringify(params.body)
    const request = https.request(
      {
        method: 'POST',
        hostname: params.hostname,
        path: params.path,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload).toString(),
          ...(params.headers ?? {}),
        },
      },
      (response) => {
        const chunks: Buffer[] = []
        response.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
        response.on('end', () => {
          const status = response.statusCode ?? 500
          if (status >= 200 && status < 300) {
            resolve()
            return
          }
          reject(new Error(`HTTP ${status}: ${Buffer.concat(chunks).toString('utf-8')}`))
        })
      },
    )
    request.on('error', reject)
    request.write(payload)
    request.end()
  })

const postForm = (params: { hostname: string; path: string; headers?: Record<string, string>; form: URLSearchParams }) =>
  new Promise<void>((resolve, reject) => {
    const payload = params.form.toString()
    const request = https.request(
      {
        method: 'POST',
        hostname: params.hostname,
        path: params.path,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(payload).toString(),
          ...(params.headers ?? {}),
        },
      },
      (response) => {
        const chunks: Buffer[] = []
        response.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
        response.on('end', () => {
          const status = response.statusCode ?? 500
          if (status >= 200 && status < 300) {
            resolve()
            return
          }
          reject(new Error(`HTTP ${status}: ${Buffer.concat(chunks).toString('utf-8')}`))
        })
      },
    )
    request.on('error', reject)
    request.write(payload)
    request.end()
  })

const resolveRecipient = (audience: NotificationAudience, audienceId: string) => {
  if (audience === 'customer') {
    const customer = customerAccounts.find((entry) => entry.id === audienceId)
    return {
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
    }
  }

  if (audience === 'operator') {
    return {
      email: (process.env.OPERATOR_EMAIL ?? '').trim(),
      phone: (process.env.OPERATOR_PHONE ?? '').trim(),
    }
  }

  return {
    email: (process.env.DISTRIBUTOR_EMAIL ?? '').trim(),
    phone: (process.env.DISTRIBUTOR_PHONE ?? '').trim(),
  }
}

const dispatchExternalNotification = (params: {
  channel: 'email' | 'sms'
  audience: NotificationAudience
  audienceId: string
  title: string
  message: string
}) => {
  const recipient = resolveRecipient(params.audience, params.audienceId)
  const providerStatus = params.channel === 'email'
    ? process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true'
    : process.env.SMS_NOTIFICATIONS_ENABLED === 'true'

  if (!providerStatus) {
    console.log(`[${params.channel.toUpperCase()}] Provider not configured. Queued fallback for ${params.audience}:${params.audienceId} | ${params.title}`)
    return
  }

  if (params.channel === 'email') {
    const sendGridApiKey = (process.env.SENDGRID_API_KEY ?? '').trim()
    const emailFrom = (process.env.EMAIL_FROM ?? '').trim()
    if (!sendGridApiKey || !emailFrom || !recipient.email) {
      console.log(`[EMAIL] Missing SENDGRID_API_KEY, EMAIL_FROM, or recipient email for ${params.audience}:${params.audienceId}.`)
      return
    }

    postJson({
      hostname: 'api.sendgrid.com',
      path: '/v3/mail/send',
      headers: {
        Authorization: `Bearer ${sendGridApiKey}`,
      },
      body: {
        personalizations: [{ to: [{ email: recipient.email }] }],
        from: { email: emailFrom },
        subject: params.title,
        content: [{ type: 'text/plain', value: params.message }],
      },
    })
      .then(() => {
        console.log(`[EMAIL] Sent via SendGrid to ${recipient.email} | ${params.title}`)
      })
      .catch((error) => {
        console.log(`[EMAIL] SendGrid send failed for ${recipient.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      })
    return
  }

  const twilioAccountSid = (process.env.TWILIO_ACCOUNT_SID ?? '').trim()
  const twilioAuthToken = (process.env.TWILIO_AUTH_TOKEN ?? '').trim()
  const twilioFrom = (process.env.TWILIO_FROM_NUMBER ?? '').trim()
  if (!twilioAccountSid || !twilioAuthToken || !twilioFrom || !recipient.phone) {
    console.log(`[SMS] Missing Twilio configuration or recipient phone for ${params.audience}:${params.audienceId}.`)
    return
  }

  postForm({
    hostname: 'api.twilio.com',
    path: `/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
    headers: {
      Authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
    },
    form: new URLSearchParams({
      To: recipient.phone,
      From: twilioFrom,
      Body: `${params.title}: ${params.message}`,
    }),
  })
    .then(() => {
      console.log(`[SMS] Sent via Twilio to ${recipient.phone} | ${params.title}`)
    })
    .catch((error) => {
      console.log(`[SMS] Twilio send failed for ${recipient.phone}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    })
}

export const createNotification = (params: {
  audience: NotificationAudience
  audienceId: string
  title: string
  message: string
  channels?: NotificationChannel[]
}) => {
  const channels = params.channels ?? ['in_app', 'email', 'sms']
  const notification: NotificationItem = {
    id: nextId('NTF', notifications.length),
    audience: params.audience,
    audienceId: params.audienceId,
    title: params.title,
    message: params.message,
    channels,
    createdAt: nowIso(),
    read: false,
  }
  notifications.unshift(notification)

  if (channels.includes('email')) {
    dispatchExternalNotification({
      channel: 'email',
      audience: params.audience,
      audienceId: params.audienceId,
      title: params.title,
      message: params.message,
    })
  }

  if (channels.includes('sms')) {
    dispatchExternalNotification({
      channel: 'sms',
      audience: params.audience,
      audienceId: params.audienceId,
      title: params.title,
      message: params.message,
    })
  }

  return notification
}

export const getNotificationsForAudience = (audience: NotificationAudience, audienceId: string) =>
  notifications.filter((item) => item.audience === audience && item.audienceId === audienceId)

export const markNotificationRead = (notificationId: string, audience: NotificationAudience, audienceId: string) => {
  const item = notifications.find(
    (entry) => entry.id === notificationId && entry.audience === audience && entry.audienceId === audienceId,
  )
  if (!item) {
    return null
  }
  item.read = true
  return item
}

export const getCustomerByToken = (token: string | undefined) => {
  if (!token) {
    return null
  }
  const customerId = sessionByToken.get(token)
  if (!customerId) {
    return null
  }
  return customerAccounts.find((account) => account.id === customerId) ?? null
}

export const createSalesOrderForCustomer = (params: {
  customerId: string
  customerName: string
  customerEmail: string
  pickupPoint: string
  items: Array<{ inventoryId: string; qty: number }>
}) => {
  const selectedItems = params.items.map((requested) => {
    const stock = inventoryItems.find((item) => item.id === requested.inventoryId)
    if (!stock) {
      throw new Error(`Inventory item not found: ${requested.inventoryId}`)
    }
    if (requested.qty <= 0) {
      throw new Error(`Quantity must be greater than zero for ${requested.inventoryId}`)
    }
    if (requested.qty > stock.qty) {
      throw new Error(`Not enough stock for ${stock.product}. Available: ${stock.qty}`)
    }
    const unitPrice = unitPriceFromValue(stock.value, stock.qty)
    const lineTotal = Number((unitPrice * requested.qty).toFixed(2))

    stock.qty -= requested.qty
    stock.status = computeInventoryStatus(stock.qty, stock.reorder)

    return {
      inventoryId: stock.id,
      product: stock.product,
      qty: requested.qty,
      unitPrice,
      lineTotal,
    }
  })

  const subtotal = Number(selectedItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2))
  const orderId = nextId('SO', salesOrders.length)
  const invoiceId = nextId('INV', invoices.length)
  const issuedDate = nowIso().slice(0, 10)

  const order: SalesOrder = {
    id: orderId,
    customerId: params.customerId,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    pickupPoint: params.pickupPoint,
    date: issuedDate,
    status: 'Pending Payment',
    items: selectedItems,
    currency: 'KES',
    subtotal,
    paymentStatus: 'Pending',
  }

  const invoice: Invoice = {
    id: invoiceId,
    orderId,
    customerId: params.customerId,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    amount: subtotal,
    currency: 'KES',
    status: 'Pending',
    dueDate: futureDateIso(7),
    issuedDate,
  }

  salesOrders.unshift(order)
  invoices.unshift(invoice)

  createNotification({
    audience: 'customer',
    audienceId: params.customerId,
    title: `Order ${orderId} placed`,
    message: `Your order has been received and is awaiting payment verification.`,
  })
  createNotification({
    audience: 'operator',
    audienceId: 'OP-001',
    title: `New customer order ${orderId}`,
    message: `${params.customerName} placed a new order for ${subtotal.toFixed(2)} KES.`,
  })

  return { order, invoice }
}

export const createPaymentForOrder = (params: {
  orderId: string
  customerId: string
  method: string
}) => {
  const order = salesOrders.find((entry) => entry.id === params.orderId)
  if (!order) {
    throw new Error(`Order not found: ${params.orderId}`)
  }
  if (order.customerId !== params.customerId) {
    throw new Error('Customer is not authorized to pay for this order')
  }

  const invoice = invoices.find((entry) => entry.orderId === order.id)
  if (!invoice) {
    throw new Error(`Invoice not found for order: ${order.id}`)
  }
  if (invoice.status === 'Paid') {
    throw new Error('Invoice is already paid')
  }

  const payment: Payment = {
    id: nextId('PAY', payments.length),
    orderId: order.id,
    invoiceId: invoice.id,
    customerId: params.customerId,
    amount: invoice.amount,
    currency: invoice.currency,
    method: params.method,
    status: 'Completed',
    paidAt: nowIso(),
  }

  payments.unshift(payment)
  invoice.status = 'Paid'
  order.paymentStatus = 'Paid'
  order.status = 'Paid'

  createNotification({
    audience: 'customer',
    audienceId: params.customerId,
    title: `Payment received for ${order.id}`,
    message: `Payment confirmed. Awaiting operator release to distributor queue.`,
  })
  createNotification({
    audience: 'operator',
    audienceId: 'OP-001',
    title: `Payment recorded for ${order.id}`,
    message: `Order is ready for operator confirmation and distributor release.`,
  })

  return { payment, invoice, order }
}

export const updateSalesOrderStatus = (params: {
  orderId: string
  nextStatus: SalesOrderStatus
}) => {
  const order = salesOrders.find((entry) => entry.id === params.orderId)
  if (!order) {
    throw new Error(`Order not found: ${params.orderId}`)
  }

  const transitionMap: Record<SalesOrderStatus, SalesOrderStatus[]> = {
    'Pending Payment': ['Paid'],
    Paid: ['Ready for Dispatch'],
    'Ready for Dispatch': ['Packed'],
    Packed: ['Out for Delivery'],
    'Out for Delivery': ['Delivered'],
    Delivered: ['Completed'],
    Completed: [],
  }

  const allowedNextStatuses = transitionMap[order.status]
  if (!allowedNextStatuses.includes(params.nextStatus)) {
    throw new Error(`Invalid status transition from ${order.status} to ${params.nextStatus}`)
  }

  order.status = params.nextStatus

  if (params.nextStatus === 'Paid') {
    order.paymentStatus = 'Paid'
    const invoice = invoices.find((entry) => entry.orderId === order.id)
    if (invoice) {
      invoice.status = 'Paid'
    }
  }

  if (params.nextStatus === 'Ready for Dispatch') {
    createNotification({
      audience: 'distributor',
      audienceId: 'DIST-001',
      title: `Dispatch assigned: ${order.id}`,
      message: `Package order for pickup point ${order.pickupPoint}.`,
    })
    createNotification({
      audience: 'customer',
      audienceId: order.customerId,
      title: `Order ${order.id} confirmed`,
      message: `Operator confirmed your order. Distributor will now prepare dispatch.`,
    })
  }

  if (params.nextStatus === 'Packed') {
    createNotification({
      audience: 'customer',
      audienceId: order.customerId,
      title: `Order ${order.id} packed`,
      message: `Your order is packed and waiting for shipment.`,
    })
  }

  if (params.nextStatus === 'Out for Delivery') {
    createNotification({
      audience: 'customer',
      audienceId: order.customerId,
      title: `Order ${order.id} is on the way`,
      message: `Distributor is delivering to ${order.pickupPoint}.`,
    })
  }

  if (params.nextStatus === 'Delivered') {
    createNotification({
      audience: 'customer',
      audienceId: order.customerId,
      title: `Order ${order.id} delivered to pickup point`,
      message: `Please confirm collection from your customer app once picked up.`,
    })
  }

  if (params.nextStatus === 'Completed') {
    createNotification({
      audience: 'operator',
      audienceId: 'OP-001',
      title: `Order ${order.id} completed`,
      message: `Customer confirmed delivery collection.`,
    })
    createNotification({
      audience: 'distributor',
      audienceId: 'DIST-001',
      title: `Order ${order.id} completed`,
      message: `Customer confirmed pickup collection.`,
    })
  }

  return order
}
