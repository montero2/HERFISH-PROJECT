import express from 'express'
import {
  createSessionToken,
  customerAccounts,
  distributorSessionByToken,
  getCustomerByToken,
  operatorSessionByToken,
  sessionByToken,
} from '../store/erpStore'

const router: express.Router = express.Router()

type AuthPayload = {
  name?: string
  email?: string
  password?: string
}

const sanitizeAccount = (account: { id: string; name: string; email: string; createdAt: string }) => ({
  id: account.id,
  name: account.name,
  email: account.email,
  createdAt: account.createdAt,
})

const getBearerToken = (authorizationHeader: string) => {
  return authorizationHeader.startsWith('Bearer ') ? authorizationHeader.slice(7) : ''
}

router.post('/login', (req, res) => {
  const payload = req.body as AuthPayload
  const email = (payload.email ?? '').trim().toLowerCase()
  const password = (payload.password ?? '').trim()

  if (!email || !password) {
    res.status(400).json({ status: 'error', message: 'Email and password are required.' })
    return
  }

  const account = customerAccounts.find((entry) => entry.email.toLowerCase() === email && entry.password === password)

  if (!account) {
    res.status(401).json({ status: 'error', message: 'Invalid email or password.' })
    return
  }

  const token = createSessionToken()
  sessionByToken.set(token, account.id)

  res.json({
    status: 'success',
    message: 'Login successful.',
    data: {
      token,
      customer: sanitizeAccount(account),
    },
  })
})

router.post('/register', (req, res) => {
  const payload = req.body as AuthPayload
  const name = (payload.name ?? '').trim()
  const email = (payload.email ?? '').trim().toLowerCase()
  const password = (payload.password ?? '').trim()

  if (!name || !email || !password) {
    res.status(400).json({ status: 'error', message: 'Name, email, and password are required.' })
    return
  }

  const existing = customerAccounts.find((entry) => entry.email.toLowerCase() === email)
  if (existing) {
    res.status(409).json({ status: 'error', message: 'Email already exists.' })
    return
  }

  const account = {
    id: `CUST-${String(customerAccounts.length + 1).padStart(3, '0')}`,
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  }

  customerAccounts.push(account)
  const token = createSessionToken()
  sessionByToken.set(token, account.id)

  res.status(201).json({
    status: 'success',
    message: 'Customer account created.',
    data: {
      token,
      customer: sanitizeAccount(account),
    },
  })
})

router.get('/me', (req, res) => {
  const authorization = req.header('authorization') ?? ''
  const token = getBearerToken(authorization)
  const customer = getCustomerByToken(token)

  if (!customer) {
    res.status(401).json({ status: 'error', message: 'Invalid or expired token.' })
    return
  }

  res.json({
    status: 'success',
    data: sanitizeAccount(customer),
  })
})

router.post('/logout', (req, res) => {
  const authorization = req.header('authorization') ?? ''
  const token = getBearerToken(authorization)
  if (token) {
    sessionByToken.delete(token)
  }
  res.json({
    status: 'success',
    message: 'Customer session ended.',
  })
})

router.post('/operator/login', (req, res) => {
  const payload = req.body as AuthPayload
  const email = (payload.email ?? '').trim().toLowerCase()
  const password = (payload.password ?? '').trim()

  const operatorEmail = (process.env.OPERATOR_EMAIL ?? 'admin@herfishlegacy.com').trim().toLowerCase()
  const operatorPassword = (process.env.OPERATOR_PASSWORD ?? 'admin123').trim()
  const operatorName = (process.env.OPERATOR_NAME ?? 'HERFISH Operator').trim()

  if (!email || !password) {
    res.status(400).json({ status: 'error', message: 'Email and password are required.' })
    return
  }

  if (email !== operatorEmail || password !== operatorPassword) {
    res.status(401).json({ status: 'error', message: 'Invalid operator credentials.' })
    return
  }

  const token = createSessionToken()
  operatorSessionByToken.set(token, operatorEmail)

  res.json({
    status: 'success',
    message: 'Operator login successful.',
    data: {
      token,
      operator: {
        id: 'OP-001',
        name: operatorName,
        email: operatorEmail,
      },
    },
  })
})

router.get('/operator/me', (req, res) => {
  const authorization = req.header('authorization') ?? ''
  const token = getBearerToken(authorization)

  if (!token || !operatorSessionByToken.has(token)) {
    res.status(401).json({ status: 'error', message: 'Invalid or expired operator token.' })
    return
  }

  const operatorEmail = (process.env.OPERATOR_EMAIL ?? 'admin@herfishlegacy.com').trim().toLowerCase()
  const operatorName = (process.env.OPERATOR_NAME ?? 'HERFISH Operator').trim()

  res.json({
    status: 'success',
    data: {
      id: 'OP-001',
      name: operatorName,
      email: operatorEmail,
    },
  })
})

router.post('/operator/logout', (req, res) => {
  const authorization = req.header('authorization') ?? ''
  const token = getBearerToken(authorization)
  if (token) {
    operatorSessionByToken.delete(token)
  }
  res.json({
    status: 'success',
    message: 'Operator session ended.',
  })
})

router.post('/distributor/login', (req, res) => {
  const payload = req.body as AuthPayload
  const email = (payload.email ?? '').trim().toLowerCase()
  const password = (payload.password ?? '').trim()

  const distributorEmail = (process.env.DISTRIBUTOR_EMAIL ?? 'distributor@herfishlegacy.com').trim().toLowerCase()
  const distributorPassword = (process.env.DISTRIBUTOR_PASSWORD ?? 'distributor123').trim()
  const distributorName = (process.env.DISTRIBUTOR_NAME ?? 'HERFISH Distributor').trim()

  if (!email || !password) {
    res.status(400).json({ status: 'error', message: 'Email and password are required.' })
    return
  }

  if (email !== distributorEmail || password !== distributorPassword) {
    res.status(401).json({ status: 'error', message: 'Invalid distributor credentials.' })
    return
  }

  const token = createSessionToken()
  distributorSessionByToken.set(token, distributorEmail)

  res.json({
    status: 'success',
    message: 'Distributor login successful.',
    data: {
      token,
      distributor: {
        id: 'DIST-001',
        name: distributorName,
        email: distributorEmail,
      },
    },
  })
})

router.get('/distributor/me', (req, res) => {
  const authorization = req.header('authorization') ?? ''
  const token = getBearerToken(authorization)

  if (!token || !distributorSessionByToken.has(token)) {
    res.status(401).json({ status: 'error', message: 'Invalid or expired distributor token.' })
    return
  }

  const distributorEmail = (process.env.DISTRIBUTOR_EMAIL ?? 'distributor@herfishlegacy.com').trim().toLowerCase()
  const distributorName = (process.env.DISTRIBUTOR_NAME ?? 'HERFISH Distributor').trim()

  res.json({
    status: 'success',
    data: {
      id: 'DIST-001',
      name: distributorName,
      email: distributorEmail,
    },
  })
})

router.post('/distributor/logout', (req, res) => {
  const authorization = req.header('authorization') ?? ''
  const token = getBearerToken(authorization)
  if (token) {
    distributorSessionByToken.delete(token)
  }
  res.json({
    status: 'success',
    message: 'Distributor session ended.',
  })
})

export default router

