import express from 'express'
import {
  SalesOrderStatus,
  distributorSessionByToken,
  salesOrders,
  updateSalesOrderStatus,
} from '../store/erpStore'

const router: express.Router = express.Router()

type UpdateStatusPayload = {
  status?: SalesOrderStatus
}

const getBearerToken = (authorizationHeader: string) => {
  return authorizationHeader.startsWith('Bearer ') ? authorizationHeader.slice(7) : ''
}

const requireDistributor = (authorizationHeader: string) => {
  const token = getBearerToken(authorizationHeader)
  if (!token) {
    return false
  }
  return distributorSessionByToken.has(token)
}

router.get('/orders', (req, res) => {
  if (!requireDistributor(req.header('authorization') ?? '')) {
    res.status(401).json({ status: 'error', message: 'Unauthorized. Distributor token is required.' })
    return
  }

  const queue = salesOrders.filter((order) =>
    ['Ready for Dispatch', 'Packed', 'Out for Delivery', 'Delivered', 'Completed'].includes(order.status),
  )
  res.json({ status: 'success', data: queue, message: 'Distributor fulfillment queue' })
})

router.patch('/orders/:orderId/status', (req, res) => {
  if (!requireDistributor(req.header('authorization') ?? '')) {
    res.status(401).json({ status: 'error', message: 'Unauthorized. Distributor token is required.' })
    return
  }

  const payload = req.body as UpdateStatusPayload
  const nextStatus = payload.status
  const allowedStatuses: SalesOrderStatus[] = ['Packed', 'Out for Delivery', 'Delivered']

  if (!nextStatus || !allowedStatuses.includes(nextStatus)) {
    res.status(400).json({
      status: 'error',
      message: 'Distributor status must be one of: Packed, Out for Delivery, Delivered.',
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
      message: 'Distributor status updated.',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update distributor status.'
    res.status(400).json({ status: 'error', message })
  }
})

export default router
