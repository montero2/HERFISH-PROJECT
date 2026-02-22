import React, { useState } from 'react'
import { ClockIcon, DownloadIcon, EditIcon, EyeIcon, PlusIcon, UsersIcon, DollarIcon, CloseIcon } from '../components/Icons'

type OrderStatus = 'Delivered' | 'In Transit' | 'Processing' | 'Pending'

type PurchaseOrder = {
  id: string
  supplier: string
  product: string
  qty: number
  unit: string
  cost: string
  date: string
  status: OrderStatus
  dueDate: string
}

const Procurement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [orders, setOrders] = useState<PurchaseOrder[]>([
    { id: 'PO-001', supplier: 'Atlantic Fish Farms', product: 'Fresh Salmon', qty: 500, unit: 'kg', cost: 'KSh 1,250,000', date: '2024-02-18', status: 'Delivered', dueDate: '2024-02-20' },
    { id: 'PO-002', supplier: 'Coastal Aquaculture', product: 'Tilapia', qty: 300, unit: 'kg', cost: 'KSh 120,000', date: '2024-02-19', status: 'In Transit', dueDate: '2024-02-22' },
    { id: 'PO-003', supplier: 'Premium Shrimp Co', product: 'Shrimp', qty: 150, unit: 'kg', cost: 'KSh 270,000', date: '2024-02-20', status: 'Processing', dueDate: '2024-02-25' },
    { id: 'PO-004', supplier: 'Crab Haven Ltd', product: 'Crab Meat', qty: 200, unit: 'kg', cost: 'KSh 240,000', date: '2024-02-21', status: 'Pending', dueDate: '2024-02-28' },
  ])
  const [form, setForm] = useState({ supplier: '', product: '', qty: '', unit: 'kg', cost: '', dueDate: '', status: 'Pending' as OrderStatus })

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border border-green-300'
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 border border-blue-300'
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
      case 'Pending':
        return 'bg-orange-100 text-orange-800 border border-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300'
    }
  }

  const stats = [
    { label: 'Total Suppliers', value: new Set(orders.map((o) => o.supplier)).size, icon: <UsersIcon className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Pending Orders', value: orders.filter((o) => o.status === 'Pending').length, icon: <ClockIcon className="w-6 h-6" />, color: 'from-orange-500 to-red-500' },
    { label: 'Total Spend', value: 'KSh 1,880,000', icon: <DollarIcon className="w-6 h-6" />, color: 'from-purple-500 to-pink-500' },
  ]

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.supplier.trim() || !form.product.trim() || !form.qty || !form.cost.trim() || !form.dueDate) {
      return
    }

    const newOrder: PurchaseOrder = {
      id: `PO-${String(orders.length + 1).padStart(3, '0')}`,
      supplier: form.supplier.trim(),
      product: form.product.trim(),
      qty: Number(form.qty),
      unit: form.unit.trim() || 'kg',
      cost: form.cost.trim(),
      date: new Date().toISOString().slice(0, 10),
      status: form.status,
      dueDate: form.dueDate,
    }

    setOrders((current) => [newOrder, ...current])
    setShowCreateForm(false)
    setForm({ supplier: '', product: '', qty: '', unit: 'kg', cost: '', dueDate: '', status: 'Pending' })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procurement Management</h1>
          <p className="text-gray-500 mt-2">Manage suppliers, purchase orders, and procurement processes.</p>
        </div>
        <button onClick={() => setShowCreateForm((v) => !v)} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2">
          {showCreateForm ? <CloseIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />} {showCreateForm ? 'Close Form' : 'New Purchase Order'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Supplier" value={form.supplier} onChange={(e) => setForm((c) => ({ ...c, supplier: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300" />
          <input placeholder="Product" value={form.product} onChange={(e) => setForm((c) => ({ ...c, product: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300" />
          <input type="number" min="1" placeholder="Quantity" value={form.qty} onChange={(e) => setForm((c) => ({ ...c, qty: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300" />
          <input placeholder="Unit" value={form.unit} onChange={(e) => setForm((c) => ({ ...c, unit: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300" />
          <input placeholder="Cost e.g. KSh 120,000" value={form.cost} onChange={(e) => setForm((c) => ({ ...c, cost: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300" />
          <input type="date" value={form.dueDate} onChange={(e) => setForm((c) => ({ ...c, dueDate: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300" />
          <select value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value as OrderStatus }))} className="px-4 py-2 rounded-lg border border-gray-300 md:col-span-2">
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
          </select>
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg px-4 py-2">Save Purchase Order</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${stat.color} text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <span className="opacity-80">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Search Orders</label>
            <input type="text" placeholder="Search PO ID or supplier..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="all">All Status</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="in transit">In Transit</option><option value="delivered">Delivered</option>
            </select>
          </div>
          <div className="flex items-end"><button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition font-medium inline-flex items-center justify-center gap-2"><DownloadIcon className="w-4 h-4" /> Generate Report</button></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-xs md:text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="px-4 py-2 text-left font-semibold">Invoice</th><th className="px-4 py-2 text-left font-semibold">Supplier</th><th className="px-4 py-2 text-left font-semibold">Product</th><th className="px-4 py-2 text-left font-semibold">Qty</th><th className="px-4 py-2 text-left font-semibold">Amount</th><th className="px-4 py-2 text-left font-semibold">Date</th><th className="px-4 py-2 text-left font-semibold">Due Date</th><th className="px-4 py-2 text-left font-semibold">Status</th><th className="px-4 py-2 text-center font-semibold">Actions</th></tr></thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">{order.id}</td><td className="px-6 py-4 text-gray-700">{order.supplier}</td><td className="px-6 py-4 text-gray-700">{order.product}</td><td className="px-6 py-4 text-gray-900 font-medium">{order.qty} {order.unit}</td><td className="px-6 py-4 font-semibold text-gray-900">{order.cost}</td><td className="px-6 py-4 text-gray-600">{order.date}</td><td className="px-6 py-4 text-gray-600">{order.dueDate}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>{order.status}</span></td>
                  <td className="px-6 py-4 text-center"><div className="flex items-center justify-center gap-2"><button aria-label="View purchase order" className="p-1.5 hover:bg-blue-100 rounded transition text-blue-600"><EyeIcon className="w-4 h-4" /></button><button aria-label="Edit purchase order" className="p-1.5 hover:bg-gray-200 rounded transition text-gray-600"><EditIcon className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Procurement
