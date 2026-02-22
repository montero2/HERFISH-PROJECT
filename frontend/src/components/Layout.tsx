import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  BellIcon,
  BoltIcon,
  BoxIcon,
  CartIcon,
  DollarIcon,
  FileIcon,
  HomeIcon,
  MenuIcon,
  ShieldIcon,
} from './Icons'

const Layout: React.FC = () => {
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <HomeIcon className="w-4 h-4" /> },
    { path: '/inventory', label: 'Inventory', icon: <BoxIcon className="w-4 h-4" /> },
    { path: '/procurement', label: 'Procurement', icon: <CartIcon className="w-4 h-4" /> },
    { path: '/sales', label: 'Sales', icon: <FileIcon className="w-4 h-4" /> },
    { path: '/finance', label: 'Finance', icon: <DollarIcon className="w-4 h-4" /> },
    { path: '/quality', label: 'Quality', icon: <ShieldIcon className="w-4 h-4" /> },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow">
        <div className="hidden md:flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <span className="font-black text-2xl text-blue-900">HERFISH</span>
          </div>
          <div className="flex items-center gap-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-lg transition-all duration-200 border-2 ${
                    isActive ? 'bg-blue-600 text-white shadow-lg border-blue-600' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-900'
                  }`}
                  style={{ boxShadow: isActive ? '0 2px 8px rgba(59,130,246,0.15)' : '0 1px 3px rgba(59,130,246,0.08)' }}
                >
                  <span className="text-xs font-bold p-1.5 rounded bg-white/20">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <button type="button" aria-label="Alerts" className="p-2.5 rounded-full bg-white text-blue-700 border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-900 transition-all duration-200">
              <BellIcon className="w-5 h-5" />
            </button>
            <button type="button" aria-label="Quick Actions" className="p-2.5 rounded-full bg-white text-blue-700 border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-900 transition-all duration-200">
              <BoltIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="md:hidden flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Open navigation menu"
              className="text-blue-700 focus:outline-none"
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <span className="font-black text-lg text-blue-900">HERFISH</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Alerts" className="p-2 text-gray-600 hover:text-blue-600">
              <BellIcon className="w-5 h-5" />
            </button>
            <button type="button" aria-label="Quick Actions" className="p-2 text-gray-600 hover:text-blue-600">
              <BoltIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {mobileNavOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow animate-fade-in">
          <div className="flex flex-col divide-y divide-gray-100">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-6 py-4 text-base font-medium transition-all duration-200 ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <span className="text-xs font-bold p-1.5 rounded bg-blue-100 text-blue-700">{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-blue-400" />}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden mt-16 md:mt-20">
        <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
          <div className="p-2 sm:p-4 md:p-8 max-w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

export default Layout
