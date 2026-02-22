import express from 'express'

const router: express.Router = express.Router()

router.post('/login', (req, res) => {
  res.json({ status: 'success', message: 'Auth endpoint' })
})

router.post('/register', (req, res) => {
  res.json({ status: 'success', message: 'Register endpoint' })
})

export default router

