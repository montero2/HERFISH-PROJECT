import express from 'express'
import { SalesOrderStatus, salesOrders, updateSalesOrderStatus } from '../store/erpStore'

const router: express.Router = express.Router()

type UpdateStatusPayload = {
  status?: SalesOrderStatus
}

router.get('/orders', (req, res) => {
  res.json({ status: 'success', data: salesOrders, message: 'Sales orders' })
})

router.post('/orders', (req, res) => {
  res.status(400).json({
    status: 'error',
    message: 'Use /api/v1/customer/orders to create customer-originated sales orders.',
  })
})

router.patch('/orders/:orderId/status', (req, res) => {
  const payload = req.body as UpdateStatusPayload
  const nextStatus = payload.status

  if (!nextStatus) {
    res.status(400).json({
      status: 'error',
      message: 'Status is required.',
    })
    return
  }

  try {
    const order = updateSalesOrderStatus({
      orderId: req.params.orderId,
      nextStatus,
    })

    res.json({
      status: 'success',
      data: order,
      message: 'Order status updated.',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update order status.'
    res.status(400).json({ status: 'error', message })
  }
})

export default router

