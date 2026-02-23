import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Procurement from './pages/Procurement'
import Sales from './pages/Sales'
import Finance from './pages/Finance'
import Quality from './pages/Quality'
import Login from './pages/Login'
import Layout from './components/Layout'
import RequireOperatorAuth from './components/RequireOperatorAuth'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireOperatorAuth />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/procurement" element={<Procurement />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/quality" element={<Quality />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
