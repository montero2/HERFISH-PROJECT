import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo_symbol.png'
import { BellIcon, BoxIcon, ChartIcon, FileIcon, HomeIcon, MenuIcon, ShieldIcon, UsersIcon } from './Icons'

const navItems = [
  { to: '/', label: 'Dashboard', icon: <HomeIcon className="w-4 h-4" /> },
  { to: '/inventory', label: 'Inventory', icon: <BoxIcon className="w-4 h-4" /> },
  { to: '/procurement', label: 'Procurement', icon: <UsersIcon className="w-4 h-4" /> },
  { to: '/sales', label: 'Sales', icon: <FileIcon className="w-4 h-4" /> },
  { to: '/finance', label: 'Finance', icon: <ChartIcon className="w-4 h-4" /> },
  { to: '/quality', label: 'Quality', icon: <ShieldIcon className="w-4 h-4" /> },
]

const Layout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [compactMode, setCompactMode] = useState<boolean>(() => window.innerWidth < 1024)
  const operatorTokenKey = 'herfish_operator_token'

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const onChange = () => {
      setCompactMode(mediaQuery.matches)
      if (!mediaQuery.matches) {
        setMobileMenuOpen(false)
      }
    }
    onChange()
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onChange)
      return () => mediaQuery.removeEventListener('change', onChange)
    }
    mediaQuery.addListener(onChange)
    return () => mediaQuery.removeListener(onChange)
  }, [])
  const signOutOperator = async () => {
    const token = localStorage.getItem(operatorTokenKey) ?? sessionStorage.getItem(operatorTokenKey)
    try {
      if (token) {
        await fetch(`${window.location.protocol}//${window.location.hostname}:3000/api/v1/auth/operator/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } catch (_error) {
      // Ignore network errors during sign out cleanup.
    } finally {
      localStorage.removeItem(operatorTokenKey)
      sessionStorage.removeItem(operatorTokenKey)
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex items-center gap-3">
                <img src={logo} alt="HERFISH LEGACY logo" className="h-10 w-10 rounded-md bg-slate-100 p-1" />
                <div>
                  <h1 className="text-sm font-bold leading-none text-slate-900">HERFISH LEGACY</h1>
                  <p className="text-[11px] text-slate-500">ERP Suite</p>
                </div>
              </div>
              <div className="flex-wrap gap-2" style={{ display: compactMode ? 'none' : 'flex' }}>
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? 'border-[#032c5a] bg-[#032c5a] text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="relative flex flex-nowrap items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((current) => !current)}
                className="rounded-full bg-slate-100 p-2 text-slate-700"
                style={{ display: compactMode ? 'inline-flex' : 'none' }}
                aria-label="Open ERP menu"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="rounded-full bg-slate-100 p-2 text-slate-700"
                style={{ display: compactMode ? 'none' : 'inline-flex' }}
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={signOutOperator}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                style={{ display: compactMode ? 'none' : 'block' }}
              >
                Sign Out
              </button>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#7a0a21] to-[#032c5a] text-xs font-bold text-white" title="ERP Admin">
                HL
              </div>
              {mobileMenuOpen && compactMode && (
                <div className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  {navItems.map((item) => (
                    <button
                      key={item.to}
                      type="button"
                      onClick={() => {
                        navigate(item.to)
                        setMobileMenuOpen(false)
                      }}
                      className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium ${
                        location.pathname === item.to
                          ? 'bg-[#032c5a] text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOutOperator()
                    }}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4 sm:py-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 items-center justify-between" style={{ display: compactMode ? 'none' : 'flex' }}>
            <div className="w-full max-w-md rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <input className="w-full bg-transparent text-sm outline-none" placeholder="Search modules, orders, invoices..." aria-label="Search ERP data" />
            </div>
          </div>
          <Outlet />
        </div>
        <footer className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-600 shadow-sm">
          <p className="font-semibold tracking-wide text-slate-700">MADE BY MOSESTA LIMITED</p>
          <p className="mt-1">{'\u00A9'} All rights reserved</p>
        </footer>
      </main>
    </div>
  )
}

export default Layout

