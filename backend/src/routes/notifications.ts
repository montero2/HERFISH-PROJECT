import express from 'express'
import {
  distributorSessionByToken,
  getBearerToken,
  getCustomerByToken,
  getNotificationsForAudience,
  markNotificationRead,
  operatorSessionByToken,
} from '../store/erpStore'

const router: express.Router = express.Router()

type MarkReadPayload = {
  notificationId?: string
}

const requireCustomerId = (authorizationHeader: string) => {
  const token = getBearerToken(authorizationHeader)
  const customer = getCustomerByToken(token)
  return customer?.id ?? null
}

const requireOperatorId = (authorizationHeader: string) => {
  const token = getBearerToken(authorizationHeader)
  if (!token || !operatorSessionByToken.has(token)) {
    return null
  }
  return 'OP-001'
}

const requireDistributorId = (authorizationHeader: string) => {
  const token = getBearerToken(authorizationHeader)
  if (!token || !distributorSessionByToken.has(token)) {
    return null
  }
  return 'DIST-001'
}

router.get('/customer', (req, res) => {
  const customerId = requireCustomerId(req.header('authorization') ?? '')
  if (!customerId) {
    res.status(401).json({ status: 'error', message: 'Unauthorized customer session.' })
    return
  }
  res.json({ status: 'success', data: getNotificationsForAudience('customer', customerId) })
})

router.get('/operator', (req, res) => {
  const operatorId = requireOperatorId(req.header('authorization') ?? '')
  if (!operatorId) {
    res.status(401).json({ status: 'error', message: 'Unauthorized operator session.' })
    return
  }
  res.json({ status: 'success', data: getNotificationsForAudience('operator', operatorId) })
})

router.get('/distributor', (req, res) => {
  const distributorId = requireDistributorId(req.header('authorization') ?? '')
  if (!distributorId) {
    res.status(401).json({ status: 'error', message: 'Unauthorized distributor session.' })
    return
  }
  res.json({ status: 'success', data: getNotificationsForAudience('distributor', distributorId) })
})

router.patch('/customer/read', (req, res) => {
  const customerId = requireCustomerId(req.header('authorization') ?? '')
  if (!customerId) {
    res.status(401).json({ status: 'error', message: 'Unauthorized customer session.' })
    return
  }
  const payload = req.body as MarkReadPayload
  const item = markNotificationRead(String(payload.notificationId ?? ''), 'customer', customerId)
  if (!item) {
    res.status(404).json({ status: 'error', message: 'Notification not found.' })
    return
  }
  res.json({ status: 'success', data: item })
})

router.patch('/operator/read', (req, res) => {
  const operatorId = requireOperatorId(req.header('authorization') ?? '')
  if (!operatorId) {
    res.status(401).json({ status: 'error', message: 'Unauthorized operator session.' })
    return
  }
  const payload = req.body as MarkReadPayload
  const item = markNotificationRead(String(payload.notificationId ?? ''), 'operator', operatorId)
  if (!item) {
    res.status(404).json({ status: 'error', message: 'Notification not found.' })
    return
  }
  res.json({ status: 'success', data: item })
})

router.patch('/distributor/read', (req, res) => {
  const distributorId = requireDistributorId(req.header('authorization') ?? '')
  if (!distributorId) {
    res.status(401).json({ status: 'error', message: 'Unauthorized distributor session.' })
    return
  }
  const payload = req.body as MarkReadPayload
  const item = markNotificationRead(String(payload.notificationId ?? ''), 'distributor', distributorId)
  if (!item) {
    res.status(404).json({ status: 'error', message: 'Notification not found.' })
    return
  }
  res.json({ status: 'success', data: item })
})

export default router
