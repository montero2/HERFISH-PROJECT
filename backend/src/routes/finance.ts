import express from 'express'
import { invoices, payments } from '../store/erpStore'

const router: express.Router = express.Router()

router.get('/invoices', (req, res) => {
  res.json({ status: 'success', data: invoices, message: 'Invoices' })
})

router.get('/payments', (req, res) => {
  res.json({ status: 'success', data: payments, message: 'Payments' })
})

router.post('/invoices', (req, res) => {
  res.status(400).json({
    status: 'error',
    message: 'Invoices are generated from customer orders. Use /api/v1/customer/orders.',
  })
})

export default router

