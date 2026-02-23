import express from 'express'
import {
  createPaymentForOrder,
  createSalesOrderForCustomer,
  getCustomerByToken,
  inventoryItems,
  salesOrders,
} from '../store/erpStore'

const router: express.Router = express.Router()

type OrderPayload = {
  items?: Array<{
    inventoryId?: string
    qty?: number
  }>
}

type PaymentPayload = {
  method?: string
}

const getBearerToken = (authorizationHeader: string) => {
  return authorizationHeader.startsWith('Bearer ') ? authorizationHeader.slice(7) : ''
}

const requireCustomer = (authorizationHeader: string) => {
  const token = getBearerToken(authorizationHeader)
  return getCustomerByToken(token)
}

router.get('/catalog', (_req, res) => {
  const catalog = inventoryItems.map((item) => ({
    id: item.id,
    product: item.product,
    category: item.category,
    availableQty: item.qty,
    unit: item.unit,
    unitPrice: Number((Number(item.value.replace(/[^\d.]/g, '')) / Math.max(item.qty, 1)).toFixed(2)),
    currency: 'KES',
    valueLabel: item.value,
  }))
  res.json({ status: 'success', data: catalog, message: 'Customer catalog' })
})

router.get('/orders', (req, res) => {
  const customer = requireCustomer(req.header('authorization') ?? '')
  if (!customer) {
    res.status(401).json({ status: 'error', message: 'Unauthorized. Provide a valid bearer token.' })
    return
  }

  const orders = salesOrders.filter((order) => order.customerId === customer.id)
  res.json({ status: 'success', data: orders, message: 'Customer orders' })
})

router.post('/orders', (req, res) => {
  const customer = requireCustomer(req.header('authorization') ?? '')
  if (!customer) {
    res.status(401).json({ status: 'error', message: 'Unauthorized. Provide a valid bearer token.' })
    return
  }

  const payload = req.body as OrderPayload
  const items = Array.isArray(payload.items) ? payload.items : []
  if (!items.length) {
    res.status(400).json({ status: 'error', message: 'At least one order item is required.' })
    return
  }

  try {
    const { order, invoice } = createSalesOrderForCustomer({
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      items: items.map((entry) => ({
        inventoryId: String(entry.inventoryId ?? ''),
        qty: Number(entry.qty),
      })),
    })

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully.',
      data: { order, invoice },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create order.'
    res.status(400).json({ status: 'error', message })
  }
})

router.post('/orders/:orderId/payments', (req, res) => {
  const customer = requireCustomer(req.header('authorization') ?? '')
  if (!customer) {
    res.status(401).json({ status: 'error', message: 'Unauthorized. Provide a valid bearer token.' })
    return
  }

  const payload = req.body as PaymentPayload
  const method = (payload.method ?? '').trim() || 'Card'
  const orderId = req.params.orderId

  try {
    const { payment, invoice, order } = createPaymentForOrder({
      customerId: customer.id,
      orderId,
      method,
    })

    res.status(201).json({
      status: 'success',
      message: 'Payment recorded successfully.',
      data: { payment, invoice, order },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not process payment.'
    res.status(400).json({ status: 'error', message })
  }
})

export default router
