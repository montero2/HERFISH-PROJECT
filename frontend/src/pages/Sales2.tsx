import React, { useState } from 'react'
import { ChartIcon, ClockIcon, EyeIcon, FileIcon, PlusIcon } from '../components/Icons'

const Sales2: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const salesOrders = [
    { id: 'SO-2024-101', customer: 'Fresh Mart Restaurant', product: 'Atlantic Salmon', qty: '100 kg', amount: '$900', date: '2024-02-20', status: 'Shipped' },
    { id: 'SO-2024-102', customer: 'Coastal Grill House', product: 'Tilapia Fillet', qty: '50 kg', amount: '$350', date: '2024-02-21', status: 'Processing' },
    { id: 'SO-2024-103', customer: 'Seafood Express', product: 'Shrimp Premium', qty: '25 kg', amount: '$625', date: '2024-02-21', status: 'Pending' },
    { id: 'SO-2024-104', customer: 'Ocean Foods Ltd', product: 'Crab Meat', qty: '75 kg', amount: '$1200', date: '2024-02-19', status: 'Delivered' },
    { id: 'SO-2024-105', customer: 'Fresh Catch Co', product: 'Sardine Whole', qty: '200 kg', amount: '$800', date: '2024-02-18', status: 'Delivered' },
  ]

  const filteredOrders = salesOrders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      case 'Shipped':
        return 'bg-blue-100 text-blue-800'
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'Pending':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = [
    { label: 'Total Orders', value: salesOrders.length, icon: <FileIcon className="w-6 h-6" /> },
    { label: 'Pending Orders', value: salesOrders.filter((o) => o.status === 'Pending').length, icon: <ClockIcon className="w-6 h-6" /> },
    { label: 'Total Revenue', value: `$${salesOrders.reduce((sum, o) => sum + parseInt(o.amount.replace('$', ''), 10), 0)}`, icon: <ChartIcon className="w-6 h-6" /> },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Order Management</h1>
          <p className="text-gray-500 mt-2">Manage and track all sales orders efficiently.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-medium inline-flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> New Sales Order
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <span className="text-gray-500">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Search Orders</label>
            <input
              type="text"
              placeholder="Search by Order ID or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium">Reset Filters</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Qty</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold">{order.id}</td>
                <td className="px-6 py-4 text-sm">{order.customer}</td>
                <td className="px-6 py-4 text-sm">{order.product}</td>
                <td className="px-6 py-4 text-sm">{order.qty}</td>
                <td className="px-6 py-4 text-sm font-semibold">{order.amount}</td>
                <td className="px-6 py-4 text-sm">{order.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button type="button" aria-label="View order" className="p-1.5 hover:bg-blue-100 rounded transition text-blue-600"><EyeIcon className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Sales2
