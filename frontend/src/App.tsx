import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Procurement from './pages/Procurement'
import Sales from './pages/Sales'
import Finance from './pages/Finance'
import Quality from './pages/Quality'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/procurement" element={<Procurement />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/quality" element={<Quality />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
