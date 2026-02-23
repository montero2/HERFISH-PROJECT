import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import apiClient from '../services/api'

const operatorTokenKey = 'herfish_operator_token'

const RequireOperatorAuth: React.FC = () => {
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const verifyOperatorSession = async () => {
      const token = localStorage.getItem(operatorTokenKey) ?? sessionStorage.getItem(operatorTokenKey)
      if (!token) {
        setAuthorized(false)
        setChecking(false)
        return
      }

      try {
        await apiClient.get('/auth/operator/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setAuthorized(true)
      } catch (_error) {
        localStorage.removeItem(operatorTokenKey)
        sessionStorage.removeItem(operatorTokenKey)
        setAuthorized(false)
      } finally {
        setChecking(false)
      }
    }

    verifyOperatorSession()
  }, [])

  if (checking) {
    return <div className="min-h-screen grid place-items-center text-slate-600">Validating operator session...</div>
  }

  if (!authorized) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default RequireOperatorAuth
