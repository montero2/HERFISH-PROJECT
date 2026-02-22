import React, { useEffect, useMemo, useState } from 'react'
import apiClient from '../services/api'
import { AlertIcon, BoxIcon, CloseIcon, DollarIcon, DownloadIcon, EditIcon, EyeIcon, PlusIcon } from '../components/Icons'

type InventoryStatus = 'Optimal' | 'Low Stock' | 'Critical'

type InventoryItem = {
  id: string
  product: string
  category: string
  qty: number
  unit: string
  reorder: number
  status: InventoryStatus
  value: string
}

type ProductFormState = {
  product: string
  category: string
  qty: string
  unit: string
  reorder: string
  value: string
}

const fallbackInventory: InventoryItem[] = [
  { id: 'INV-001', product: 'Atlantic Salmon', category: 'Fresh Fish', qty: 450, unit: 'kg', reorder: 200, status: 'Optimal', value: 'KSh 1,125,000' },
  { id: 'INV-002', product: 'Tilapia Fillet', category: 'Fresh Fish', qty: 120, unit: 'kg', reorder: 300, status: 'Low Stock', value: 'KSh 48,000' },
  { id: 'INV-003', product: 'Shrimp Premium', category: 'Shellfish', qty: 85, unit: 'kg', reorder: 150, status: 'Low Stock', value: 'KSh 153,000' },
]

const initialFormState: ProductFormState = {
  product: '',
  category: '',
  qty: '',
  unit: 'kg',
  reorder: '',
  value: '',
}

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('All Categories')
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formState, setFormState] = useState<ProductFormState>(initialFormState)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/inventory')
        const items = Array.isArray(response.data?.data) ? (response.data.data as InventoryItem[]) : []
        setInventoryItems(items)
        setError('')
      } catch (_err) {
        setInventoryItems(fallbackInventory)
        setError('Backend is unavailable. Showing demo inventory data.')
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [])

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(inventoryItems.map((item) => item.category)))
    return ['All Categories', ...uniqueCategories]
  }, [inventoryItems])

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = category === 'All Categories' || item.category === category

    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: InventoryStatus) => {
    switch (status) {
      case 'Optimal':
        return 'bg-green-100 text-green-800 border border-green-300'
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
      case 'Critical':
        return 'bg-red-100 text-red-800 border border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300'
    }
  }

  const stats = [
    { label: 'Total SKUs', value: inventoryItems.length, icon: <BoxIcon className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Value', value: 'KSh 1,838,000', icon: <DollarIcon className="w-6 h-6" />, color: 'from-purple-500 to-pink-500' },
    {
      label: 'Low Stock Items',
      value: inventoryItems.filter((i) => i.status === 'Low Stock' || i.status === 'Critical').length,
      icon: <AlertIcon className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
    },
  ]

  const handleFormChange = (field: keyof ProductFormState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setFormState(initialFormState)
    setFormError('')
    setSubmitting(false)
  }

  const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const qty = Number(formState.qty)
    const reorder = Number(formState.reorder)

    if (
      !formState.product.trim() ||
      !formState.category.trim() ||
      !formState.unit.trim() ||
      !formState.value.trim() ||
      Number.isNaN(qty) ||
      Number.isNaN(reorder) ||
      qty < 0 ||
      reorder < 0
    ) {
      setFormError('Please complete all fields with valid values.')
      return
    }

    try {
      setSubmitting(true)
      setFormError('')

      const response = await apiClient.post('/inventory', {
        product: formState.product.trim(),
        category: formState.category.trim(),
        qty,
        unit: formState.unit.trim(),
        reorder,
        value: formState.value.trim(),
      })

      const createdItem = response.data?.data as InventoryItem | undefined

      if (createdItem?.id) {
        setInventoryItems((current) => [createdItem, ...current])
      }

      resetForm()
      setShowAddForm(false)
    } catch (_err) {
      const generatedItem: InventoryItem = {
        id: `INV-${String(inventoryItems.length + 1).padStart(3, '0')}`,
        product: formState.product.trim(),
        category: formState.category.trim(),
        qty,
        unit: formState.unit.trim(),
        reorder,
        value: formState.value.trim(),
        status: qty <= reorder ? 'Low Stock' : 'Optimal',
      }
      setInventoryItems((current) => [generatedItem, ...current])
      setError('Backend is unavailable. Product was added locally for this session.')
      resetForm()
      setShowAddForm(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-2">Track products, stock levels, and optimize inventory.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (showAddForm) {
              resetForm()
            }
            setShowAddForm((current) => !current)
          }}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
        >
          <span>{showAddForm ? <CloseIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}</span> {showAddForm ? 'Close Form' : 'Add Product'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProduct} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Create Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input type="text" placeholder="Product name" value={formState.product} onChange={(e) => handleFormChange('product', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            <input type="text" placeholder="Category" value={formState.category} onChange={(e) => handleFormChange('category', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            <input type="text" placeholder="Unit (kg, units...)" value={formState.unit} onChange={(e) => handleFormChange('unit', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            <input type="number" min="0" placeholder="Current stock" value={formState.qty} onChange={(e) => handleFormChange('qty', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            <input type="number" min="0" placeholder="Reorder point" value={formState.reorder} onChange={(e) => handleFormChange('reorder', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            <input type="text" placeholder="Value (e.g., KSh 100,000)" value={formState.value} onChange={(e) => handleFormChange('value', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white px-5 py-2 rounded-lg font-medium">{submitting ? 'Saving...' : 'Save Product'}</button>
            <button type="button" onClick={() => { resetForm(); setShowAddForm(false) }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium">Cancel</button>
          </div>
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
            <label className="text-sm font-medium text-gray-700 mb-2 block">Search Products</label>
            <input type="text" placeholder="Search by product name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500">
              {categories.map((option) => (<option key={option}>{option}</option>))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition font-medium">
              <span className="inline-flex items-center gap-2"><DownloadIcon className="w-4 h-4" />Export Inventory</span>
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-600">Loading inventory...</div>}
      {error && <div className="bg-amber-50 text-amber-700 rounded-xl border border-amber-200 p-4">{error}</div>}

      {!loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-2 text-left font-semibold min-w-[120px]">Product ID</th>
                  <th className="px-4 py-2 text-left font-semibold min-w-[120px]">Product Name</th>
                  <th className="px-4 py-2 text-left font-semibold w-[1%] whitespace-nowrap">Category</th>
                  <th className="px-4 py-2 text-left font-semibold min-w-[80px]">Current Stock</th>
                  <th className="px-4 py-2 text-left font-semibold min-w-[80px]">Reorder Point</th>
                  <th className="px-4 py-2 text-left font-semibold min-w-[100px]">Value</th>
                  <th className="px-4 py-2 text-left font-semibold min-w-[140px]">Status</th>
                  <th className="px-4 py-2 text-center font-semibold min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 text-gray-700">{item.product}</td>
                    <td className="px-4 py-4 w-[1%] whitespace-nowrap"><span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{item.category}</span></td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">{item.qty} {item.unit}</td>
                    <td className="px-6 py-4 text-gray-600">{item.reorder} {item.unit}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.value}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>{item.status}</span></td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button type="button" aria-label="Edit product" className="p-1.5 hover:bg-blue-100 rounded transition text-blue-600"><EditIcon className="w-4 h-4" /></button>
                        <button type="button" aria-label="View product" className="p-1.5 hover:bg-green-100 rounded transition text-green-600"><EyeIcon className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
