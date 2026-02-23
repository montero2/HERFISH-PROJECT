import React, { useState } from 'react'
import { ChartIcon, EditIcon, EyeIcon, PlusIcon, TrendingDownIcon, TrendingUpIcon, UsersIcon, CloseIcon } from '../components/Icons'

type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue'

type Invoice = {
  id: string
  customer: string
  amount: string
  date: string
  dueDate: string
  status: InvoiceStatus
  method: string
}

const Finance: React.FC = () => {
  const selectedPeriod = 'month'
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-2024-001', customer: 'Fresh Mart', amount: 'KSh 48,000', date: '2024-02-20', dueDate: '2024-03-20', status: 'Paid', method: 'Bank Transfer' },
    { id: 'INV-2024-002', customer: 'Coastal Grill', amount: 'KSh 120,000', date: '2024-02-19', dueDate: '2024-03-19', status: 'Pending', method: 'Credit Card' },
    { id: 'INV-2024-003', customer: 'Seafood Express', amount: 'KSh 270,000', date: '2024-02-18', dueDate: '2024-03-18', status: 'Overdue', method: 'Check' },
  ])
  const [form, setForm] = useState({ customer: '', amount: '', dueDate: '', status: 'Pending' as InvoiceStatus, method: 'Bank Transfer' })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 border border-green-300'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
      case 'Overdue':
        return 'bg-red-100 text-red-800 border border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300'
    }
  }

  const financialMetrics = [
    { label: 'Total Revenue', value: 'KSh 1,838,000', change: '+12%', icon: <TrendingUpIcon className="w-6 h-6" />, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Expenses', value: 'KSh 1,000,000', change: '+5%', icon: <TrendingDownIcon className="w-6 h-6" />, color: 'from-red-500 to-pink-500' },
    { label: 'Net Profit', value: 'KSh 838,000', change: '+22%', icon: <ChartIcon className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Accounts Receivable', value: 'KSh 200,000', change: '-8%', icon: <UsersIcon className="w-6 h-6" />, color: 'from-purple-500 to-indigo-500' },
  ]

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.customer.trim() || !form.amount.trim() || !form.dueDate) {
      return
    }
    const invoice: Invoice = {
      id: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      customer: form.customer.trim(),
      amount: form.amount.trim(),
      date: new Date().toISOString().slice(0, 10),
      dueDate: form.dueDate,
      status: form.status,
      method: form.method,
    }
    setInvoices((current) => [invoice, ...current])
    setShowCreateForm(false)
    setForm({ customer: '', amount: '', dueDate: '', status: 'Pending', method: 'Bank Transfer' })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Finance & Accounting</h1>
          <p className="text-gray-500 mt-2">Monitor financial performance, invoices, and payments.</p>
        </div>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className="w-full sm:w-auto sm:self-auto self-start bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
        >
          {showCreateForm ? <CloseIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />} {showCreateForm ? 'Close Form' : 'New Invoice'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Customer" value={form.customer} onChange={(e) => setForm((c) => ({ ...c, customer: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300" />
          <input placeholder="Amount e.g. KSh 48,000" value={form.amount} onChange={(e) => setForm((c) => ({ ...c, amount: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300" />
          <input type="date" value={form.dueDate} onChange={(e) => setForm((c) => ({ ...c, dueDate: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300" />
          <select value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value as InvoiceStatus }))} className="px-4 py-2 rounded-lg border border-gray-300">
            <option value="Pending">Pending</option><option value="Paid">Paid</option><option value="Overdue">Overdue</option>
          </select>
          <input placeholder="Payment method" value={form.method} onChange={(e) => setForm((c) => ({ ...c, method: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300 md:col-span-2" />
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg px-4 py-2 md:col-span-3">Save Invoice</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialMetrics.map((metric, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition">
            <div className={`h-1 bg-gradient-to-r ${metric.color}`} />
            <div className="p-6"><div className="flex items-center justify-between mb-4"><p className="text-sm font-medium text-gray-600">{metric.label}</p><span>{metric.icon}</span></div><div><div className="text-3xl font-bold text-gray-900">{metric.value}</div><div className={`text-sm font-medium mt-2 ${metric.change.includes('+') ? 'text-green-600' : 'text-red-600'}`}>{metric.change} this {selectedPeriod}</div></div></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-900">Recent Invoices</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Invoice #</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Invoice Date</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Due Date</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Method</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th><th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th></tr></thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">{invoice.id}</td><td className="px-6 py-4 text-gray-700">{invoice.customer}</td><td className="px-6 py-4 font-semibold text-gray-900">{invoice.amount}</td><td className="px-6 py-4 text-gray-600">{invoice.date}</td><td className="px-6 py-4 text-gray-600">{invoice.dueDate}</td><td className="px-6 py-4 text-gray-600">{invoice.method}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(invoice.status)}`}>{invoice.status}</span></td>
                  <td className="px-6 py-4 text-center"><div className="flex items-center justify-center gap-2"><button type="button" aria-label="View invoice" className="p-1.5 hover:bg-blue-100 rounded transition text-blue-600"><EyeIcon className="w-4 h-4" /></button><button type="button" aria-label="Edit invoice" className="p-1.5 hover:bg-gray-200 rounded transition text-gray-600"><EditIcon className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Finance
