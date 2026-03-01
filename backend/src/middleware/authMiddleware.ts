import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

type AuthUser = JwtPayload & {
  id: number
  role: string
  email: string
}

export interface AuthRequest extends Request {
  user?: AuthUser
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    res.sendStatus(401)
    return
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    res.status(500).json({ message: 'JWT_SECRET is not configured' })
    return
  }

  jwt.verify(token, secret, (error, decoded) => {
    if (error || !decoded || typeof decoded === 'string') {
      res.sendStatus(403)
      return
    }
    req.user = decoded as AuthUser
    next()
  })
}

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access denied: Insufficient privileges' })
      return
    }
    next()
  }
}
