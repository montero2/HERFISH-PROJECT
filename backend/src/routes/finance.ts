import express from 'express'

const router: express.Router = express.Router()

router.get('/invoices', (req, res) => {
  res.json({ status: 'success', data: [], message: 'Invoices' })
})

router.post('/invoices', (req, res) => {
  res.status(201).json({ status: 'success', id: 'new-id', ...req.body })
})

export default router

