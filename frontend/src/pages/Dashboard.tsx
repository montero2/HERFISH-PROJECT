import React, { useState } from 'react'
import { AlertIcon, BoxIcon, DollarIcon, FileIcon } from '../components/Icons'

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month')

  const kpis = [
    {
      title: 'Total Inventory Value',
      value: 'KSh 1,838,000',
      change: '+5%',
      isPositive: true,
      icon: <BoxIcon className="w-6 h-6" />,
      bgColor: 'from-blue-600 to-cyan-500',
      accentColor: 'text-blue-600',
    },
    {
      title: 'Active Orders',
      value: '47',
      change: '+12%',
      isPositive: true,
      icon: <FileIcon className="w-6 h-6" />,
      bgColor: 'from-purple-600 to-pink-500',
      accentColor: 'text-purple-600',
    },
    {
      title: 'Revenue This Month',
      value: 'KSh 1,838,000',
      change: '+12%',
      isPositive: true,
      icon: <DollarIcon className="w-6 h-6" />,
      bgColor: 'from-green-600 to-emerald-500',
      accentColor: 'text-green-600',
    },
    {
      title: 'Quality Issues',
      value: '3',
      change: '-8%',
      isPositive: false,
      icon: <AlertIcon className="w-6 h-6" />,
      bgColor: 'from-orange-600 to-red-500',
      accentColor: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-4 px-2 sm:px-4 md:px-8 w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time supply chain overview and insights</p>
        </div>
        <div className="flex gap-2 flex-wrap bg-white p-1.5 rounded-xl shadow-sm border border-gray-200">
          {['today', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                timeRange === range
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col justify-between min-w-0">
            <div className={`h-1.5 bg-gradient-to-r ${kpi.bgColor} mb-3`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">{kpi.title}</p>
                <div className="text-xl font-black text-gray-900 mt-1">{kpi.value}</div>
                <div className={`text-xs mt-1 ${kpi.isPositive ? 'text-green-600' : 'text-red-600'}`}>{kpi.change}</div>
              </div>
              <div className={`${kpi.accentColor}`}>{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-3 md:p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-2 md:mb-3">
            <h2 className="text-lg font-black">Recent Orders</h2>
            <a href="#" className="text-xs font-bold text-blue-600">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[480px] w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-2 text-left font-semibold min-w-[100px]">Order ID</th>
                  <th className="px-4 py-2 text-left font-semibold min-w-[120px]">Customer</th>
                  <th className="px-4 py-2 text-left font-semibold min-w-[100px]">Amount</th>
                  <th className="px-4 py-2 text-left font-semibold min-w-[100px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'SO-001', customer: 'Fresh Mart', amount: 'KSh 48,000', status: 'Delivered' },
                  { id: 'SO-002', customer: 'Ocean Foods', amount: 'KSh 120,000', status: 'Shipped' },
                  { id: 'SO-003', customer: 'Coastal Grill', amount: 'KSh 270,000', status: 'Processing' },
                ].map((order, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-bold text-gray-900 min-w-[100px]">{order.id}</td>
                    <td className="px-4 py-2 text-gray-700 min-w-[120px]">{order.customer}</td>
                    <td className="px-4 py-2 font-semibold min-w-[100px]">{order.amount}</td>
                    <td className="px-4 py-2 min-w-[100px]">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 md:p-4">
            <h2 className="text-base font-black">System Alerts</h2>
            <div className="mt-3 space-y-2">
              <div className="p-2 bg-red-50 rounded text-xs">Low stock: Atlantic Salmon</div>
              <div className="p-2 bg-yellow-50 rounded text-xs">2 orders overdue for shipment</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
