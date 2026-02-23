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
  password: string
  createdAt: string
}

export type SalesOrderStatus = 'Pending Payment' | 'Paid' | 'Processing' | 'Delivered'

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
  date: string
  status: SalesOrderStatus
  items: SalesOrderItem[]
  currency: string
  subtotal: number
  paymentStatus: 'Pending' | 'Paid'
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
    password: 'buyer123',
    createdAt: nowIso(),
  },
]

export const sessionByToken = new Map<string, string>()

export const salesOrders: SalesOrder[] = []
export const invoices: Invoice[] = []
export const payments: Payment[] = []

const nextId = (prefix: string, count: number) => `${prefix}-${String(count + 1).padStart(3, '0')}`

export const createSessionToken = () => `token-${Math.random().toString(36).slice(2, 10)}`

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
  order.status = 'Processing'

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
    Paid: ['Processing'],
    Processing: ['Delivered'],
    Delivered: [],
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

  return order
}
