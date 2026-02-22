import React, { useState } from 'react'
import { ChartIcon, ClockIcon, EyeIcon, FileIcon, PlusIcon, CloseIcon } from '../components/Icons'

type SalesOrder = {
  id: string
  customer: string
  product: string
  qty: string
  amount: string
  date: string
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered'
}

const Sales: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [orders, setOrders] = useState<SalesOrder[]>([
    { id: 'SO-2024-101', customer: 'Fresh Mart Restaurant', product: 'Atlantic Salmon', qty: '100 kg', amount: 'KSh 250,000', date: '2024-02-20', status: 'Shipped' },
    { id: 'SO-2024-102', customer: 'Coastal Grill House', product: 'Tilapia Fillet', qty: '50 kg', amount: 'KSh 20,000', date: '2024-02-21', status: 'Processing' },
    { id: 'SO-2024-103', customer: 'Seafood Express', product: 'Shrimp Premium', qty: '25 kg', amount: 'KSh 45,000', date: '2024-02-21', status: 'Pending' },
    { id: 'SO-2024-104', customer: 'Ocean Foods Ltd', product: 'Crab Meat', qty: '75 kg', amount: 'KSh 90,000', date: '2024-02-19', status: 'Delivered' },
  ])
  const [form, setForm] = useState({ customer: '', product: '', qty: '', amount: '', status: 'Pending' as SalesOrder['status'] })

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      Delivered: 'bg-green-100 text-green-800',
      Shipped: 'bg-blue-100 text-blue-800',
      Processing: 'bg-yellow-100 text-yellow-800',
      Pending: 'bg-orange-100 text-orange-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount.replace(/[^0-9]/g, '')), 0)

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: <FileIcon className="w-6 h-6" /> },
    { label: 'Pending Orders', value: orders.filter((o) => o.status === 'Pending').length, icon: <ClockIcon className="w-6 h-6" /> },
    { label: 'Total Revenue', value: `KSh ${totalRevenue.toLocaleString()}`, icon: <ChartIcon className="w-6 h-6" /> },
  ]

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.customer.trim() || !form.product.trim() || !form.qty.trim() || !form.amount.trim()) {
      return
    }

    const newOrder: SalesOrder = {
      id: `SO-2024-${String(orders.length + 101)}`,
      customer: form.customer.trim(),
      product: form.product.trim(),
      qty: form.qty.trim(),
      amount: form.amount.trim(),
      date: new Date().toISOString().slice(0, 10),
      status: form.status,
    }

    setOrders((current) => [newOrder, ...current])
    setShowCreateForm(false)
    setForm({ customer: '', product: '', qty: '', amount: '', status: 'Pending' })
  }

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sales Order Management</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">Manage and track all sales orders efficiently.</p>
        </div>
        <button onClick={() => setShowCreateForm((v) => !v)} className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-medium inline-flex items-center justify-center gap-2">
          {showCreateForm ? <CloseIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />} {showCreateForm ? 'Close Form' : 'New Order'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <input placeholder="Customer" value={form.customer} onChange={(e) => setForm((c) => ({ ...c, customer: e.target.value }))} className="px-4 py-2 border border-gray-300 rounded-lg" />
          <input placeholder="Product" value={form.product} onChange={(e) => setForm((c) => ({ ...c, product: e.target.value }))} className="px-4 py-2 border border-gray-300 rounded-lg" />
          <input placeholder="Quantity e.g. 25 kg" value={form.qty} onChange={(e) => setForm((c) => ({ ...c, qty: e.target.value }))} className="px-4 py-2 border border-gray-300 rounded-lg" />
          <input placeholder="Amount e.g. KSh 45,000" value={form.amount} onChange={(e) => setForm((c) => ({ ...c, amount: e.target.value }))} className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2" />
          <select value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value as SalesOrder['status'] }))} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white rounded-lg px-4 py-2 md:col-span-3">Save Order</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">{stat.label}</p><p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{stat.value}</p></div><span className="text-gray-500">{stat.icon}</span></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">All</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option>
          </select>
          <button onClick={() => { setSearchTerm(''); setFilterStatus('all') }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg">Reset</button>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-sm text-gray-900 break-words">{order.customer}</p>
              <span className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap ${getStatusColor(order.status)}`}>{order.status}</span>
            </div>
            <p className="text-sm text-gray-700">{order.product}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <p><span className="font-semibold text-gray-700">ID:</span> {order.id}</p>
              <p><span className="font-semibold text-gray-700">Qty:</span> {order.qty}</p>
              <p><span className="font-semibold text-gray-700">Amount:</span> {order.amount}</p>
              <p><span className="font-semibold text-gray-700">Date:</span> {order.date}</p>
            </div>
            <button aria-label="View sales order" className="w-full mt-1 p-2 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition inline-flex items-center justify-center gap-2">
              <EyeIcon className="w-4 h-4" />
              <span className="text-sm font-medium">View Order</span>
            </button>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-[700px] w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr><th className="px-4 py-2 text-left font-semibold">ID</th><th className="px-4 py-2 text-left font-semibold">Customer</th><th className="px-4 py-2 text-left font-semibold">Product</th><th className="px-4 py-2 text-left font-semibold">Qty</th><th className="px-4 py-2 text-left font-semibold">Amount</th><th className="px-4 py-2 text-left font-semibold">Date</th><th className="px-4 py-2 text-left font-semibold">Status</th><th className="px-4 py-2 text-left font-semibold">Action</th></tr></thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-semibold">{order.id}</td><td className="px-4 py-2">{order.customer}</td><td className="px-4 py-2">{order.product}</td><td className="px-4 py-2">{order.qty}</td><td className="px-4 py-2 font-semibold">{order.amount}</td><td className="px-4 py-2">{order.date}</td>
                <td className="px-4 py-2"><span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status}</span></td>
                <td className="px-4 py-2 text-center"><button aria-label="View sales order" className="p-1.5 hover:bg-blue-100 rounded transition text-blue-600"><EyeIcon className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Sales
