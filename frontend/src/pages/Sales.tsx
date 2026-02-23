import React, { useEffect, useMemo, useState } from 'react'
import apiClient from '../services/api'
import { ChartIcon, CheckCircleIcon, ClockIcon, EyeIcon, FileIcon } from '../components/Icons'

type SalesOrderItem = {
  inventoryId: string
  product: string
  qty: number
  unitPrice: number
  lineTotal: number
}

type SalesOrder = {
  id: string
  customerName: string
  customerEmail: string
  date: string
  status: 'Pending Payment' | 'Paid' | 'Processing' | 'Delivered'
  paymentStatus: 'Pending' | 'Paid'
  subtotal: number
  currency: string
  items: SalesOrderItem[]
}

type SalesOrderStatus = SalesOrder['status']

const currencyFormatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 2,
})

const Sales: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoadingByOrder, setActionLoadingByOrder] = useState<Record<string, boolean>>({})

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/sales/orders')
      const payload = Array.isArray(response.data?.data) ? (response.data.data as SalesOrder[]) : []
      setOrders(payload)
      setError('')
    } catch (_error) {
      setOrders([])
      setError('Could not load sales orders from backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const queueMetrics = useMemo(() => {
    return {
      pendingPayment: orders.filter((order) => order.status === 'Pending Payment').length,
      readyToFulfill: orders.filter((order) => order.status === 'Paid').length,
      inFulfillment: orders.filter((order) => order.status === 'Processing').length,
      delivered: orders.filter((order) => order.status === 'Delivered').length,
    }
  }, [orders])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const term = searchTerm.toLowerCase()
      const matchesSearch =
        order.id.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerEmail.toLowerCase().includes(term)
      const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [filterStatus, orders, searchTerm])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800'
      case 'Processing':
        return 'bg-blue-100 text-blue-800'
      case 'Pending Payment':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: <FileIcon className="w-6 h-6" /> },
    { label: 'Pending Payment', value: orders.filter((order) => order.paymentStatus === 'Pending').length, icon: <ClockIcon className="w-6 h-6" /> },
    {
      label: 'Revenue',
      value: currencyFormatter.format(orders.reduce((sum, order) => sum + order.subtotal, 0)),
      icon: <ChartIcon className="w-6 h-6" />,
    },
  ]

  const statusActionMap: Partial<Record<SalesOrderStatus, { label: string; nextStatus: SalesOrderStatus }>> = {
    'Pending Payment': { label: 'Verify Payment', nextStatus: 'Paid' },
    Paid: { label: 'Start Fulfillment', nextStatus: 'Processing' },
    Processing: { label: 'Mark Delivered', nextStatus: 'Delivered' },
  }

  const handleStatusUpdate = async (orderId: string, nextStatus: SalesOrderStatus) => {
    try {
      setActionLoadingByOrder((current) => ({ ...current, [orderId]: true }))
      await apiClient.patch(`/sales/orders/${orderId}/status`, { status: nextStatus })
      await fetchOrders()
      setError('')
    } catch (_error) {
      setError('Could not update order status. Please try again.')
    } finally {
      setActionLoadingByOrder((current) => ({ ...current, [orderId]: false }))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Fulfillment Queue</h1>
          <p className="text-gray-500 mt-2">Process customer orders from payment verification through delivery.</p>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xs uppercase font-semibold text-orange-700">Awaiting Payment</p>
          <p className="text-2xl font-bold text-orange-800 mt-2">{queueMetrics.pendingPayment}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs uppercase font-semibold text-emerald-700">Paid, Not Started</p>
          <p className="text-2xl font-bold text-emerald-800 mt-2">{queueMetrics.readyToFulfill}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs uppercase font-semibold text-blue-700">In Fulfillment</p>
          <p className="text-2xl font-bold text-blue-800 mt-2">{queueMetrics.inFulfillment}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs uppercase font-semibold text-green-700">Delivered</p>
          <p className="text-2xl font-bold text-green-800 mt-2">{queueMetrics.delivered}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Search Orders</label>
            <input
              type="text"
              placeholder="Order ID or customer..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending payment">Pending Payment</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-600">Loading sales orders...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>}

      {!loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Items</th>
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
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-gray-500">{order.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{order.items.length} item(s)</td>
                  <td className="px-6 py-4 text-sm font-semibold">{currencyFormatter.format(order.subtotal)}</td>
                  <td className="px-6 py-4 text-sm">{order.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" aria-label="View order" className="p-1.5 hover:bg-blue-100 rounded transition text-blue-600">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {statusActionMap[order.status] && (
                        <button
                          type="button"
                          disabled={actionLoadingByOrder[order.id]}
                          onClick={() => handleStatusUpdate(order.id, statusActionMap[order.status]!.nextStatus)}
                          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          {actionLoadingByOrder[order.id] ? 'Saving...' : statusActionMap[order.status]!.label}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Sales
