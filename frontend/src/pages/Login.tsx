import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo_symbol.png'
import apiClient from '../services/api'

const operatorTokenKey = 'herfish_operator_token'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError('Email and password are required.')
      return
    }

    try {
      setBusy(true)
      const response = await apiClient.post('/auth/operator/login', {
        email: trimmedEmail,
        password: trimmedPassword,
      })
      const token = response.data?.data?.token as string | undefined
      if (!token) {
        throw new Error('Missing operator token.')
      }
      if (rememberMe) {
        localStorage.setItem(operatorTokenKey, token)
        sessionStorage.removeItem(operatorTokenKey)
      } else {
        sessionStorage.setItem(operatorTokenKey, token)
        localStorage.removeItem(operatorTokenKey)
      }
      navigate('/')
    } catch (_error) {
      setError('Invalid operator credentials.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white grid place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <img src={logo} alt="HERFISH LEGACY logo" className="h-12 w-12 rounded-md bg-slate-100 p-1" />
          <div>
            <h1 className="text-lg font-bold text-slate-900">HERFISH LEGACY</h1>
            <p className="text-xs text-slate-500">ERP Operator Login</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="erp-email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input id="erp-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="erp-password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <div className="flex items-center gap-2">
              <input id="erp-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="erp-remember" type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
            <label htmlFor="erp-remember" className="text-sm text-slate-700">Remember me on this device</label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-lg bg-gradient-to-r from-[#7a0a21] to-[#032c5a] px-4 py-2.5 font-semibold text-white disabled:opacity-70">
            {busy ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
