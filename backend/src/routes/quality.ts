import express from 'express'

const router: express.Router = express.Router()

router.get('/checks', (req, res) => {
  res.json({ status: 'success', data: [], message: 'Quality checks' })
})

router.post('/checks', (req, res) => {
  res.status(201).json({ status: 'success', id: 'new-id', ...req.body })
})

export default router

