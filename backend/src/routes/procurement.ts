import express from 'express'

const router: express.Router = express.Router()

router.get('/orders', (req, res) => {
  res.json({ status: 'success', data: [], message: 'Purchase orders' })
})

router.post('/orders', (req, res) => {
  res.status(201).json({ status: 'success', id: 'new-id', ...req.body })
})

export default router

