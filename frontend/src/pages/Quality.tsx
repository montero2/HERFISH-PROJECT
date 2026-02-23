import React, { useState } from 'react'
import {
  BadgeIcon,
  CheckCircleIcon,
  DownloadIcon,
  EyeIcon,
  PlusIcon,
  SparklesIcon,
  ThermometerIcon,
  XCircleIcon,
  FileIcon,
  CloseIcon,
} from '../components/Icons'

type QualityResult = 'Pass' | 'Fail'

type QualityCheck = {
  id: string
  product: string
  batchNo: string
  checkDate: string
  result: QualityResult
  temperature: string
  texture: string
  odor: string
  comments: string
}

const Quality: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([
    { id: 'QC-001', product: 'Atlantic Salmon', batchNo: 'BATCH-2024-001', checkDate: '2024-02-20', result: 'Pass', temperature: '2C', texture: 'Firm', odor: 'Fresh', comments: 'All standards met' },
    { id: 'QC-002', product: 'Tilapia Fillet', batchNo: 'BATCH-2024-002', checkDate: '2024-02-21', result: 'Pass', temperature: '2C', texture: 'Firm', odor: 'Fresh', comments: 'Excellent quality' },
    { id: 'QC-003', product: 'Shrimp Premium', batchNo: 'BATCH-2024-003', checkDate: '2024-02-21', result: 'Fail', temperature: '4C', texture: 'Soft', odor: 'Unusual', comments: 'Temperature deviation' },
  ])
  const [form, setForm] = useState({ product: '', batchNo: '', result: 'Pass' as QualityResult, temperature: '', texture: '', odor: '', comments: '' })

  const filteredChecks = qualityChecks.filter((check) =>
    check.id.toLowerCase().includes(searchTerm.toLowerCase()) || check.product.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = [
    { label: 'Total Checks', value: qualityChecks.length, icon: <FileIcon className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Pass Rate', value: `${Math.round((qualityChecks.filter((c) => c.result === 'Pass').length / Math.max(qualityChecks.length, 1)) * 100)}%`, icon: <CheckCircleIcon className="w-6 h-6" />, color: 'from-green-500 to-emerald-500' },
    { label: 'Failed Batches', value: qualityChecks.filter((c) => c.result === 'Fail').length, icon: <XCircleIcon className="w-6 h-6" />, color: 'from-red-500 to-pink-500' },
  ]

  const getResultColor = (result: string) =>
    result === 'Pass'
      ? 'bg-green-100 text-green-800 border border-green-300'
      : 'bg-red-100 text-red-800 border border-red-300'

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.product.trim() || !form.batchNo.trim()) {
      return
    }
    const item: QualityCheck = {
      id: `QC-${String(qualityChecks.length + 1).padStart(3, '0')}`,
      product: form.product.trim(),
      batchNo: form.batchNo.trim(),
      checkDate: new Date().toISOString().slice(0, 10),
      result: form.result,
      temperature: form.temperature.trim() || '2C',
      texture: form.texture.trim() || 'Firm',
      odor: form.odor.trim() || 'Fresh',
      comments: form.comments.trim() || 'Recorded manually',
    }
    setQualityChecks((current) => [item, ...current])
    setShowCreateForm(false)
    setForm({ product: '', batchNo: '', result: 'Pass', temperature: '', texture: '', odor: '', comments: '' })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quality Control and Traceability</h1>
          <p className="text-gray-500 mt-2">Monitor product quality, certifications, and maintain traceability records.</p>
        </div>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className="w-full sm:w-auto sm:self-auto self-start bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
        >
          {showCreateForm ? <CloseIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />} {showCreateForm ? 'Close Form' : 'New Quality Check'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Product" value={form.product} onChange={(e) => setForm((c) => ({ ...c, product: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300" />
          <input placeholder="Batch Number" value={form.batchNo} onChange={(e) => setForm((c) => ({ ...c, batchNo: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300" />
          <select value={form.result} onChange={(e) => setForm((c) => ({ ...c, result: e.target.value as QualityResult }))} className="px-4 py-2 rounded-lg border border-gray-300">
            <option value="Pass">Pass</option><option value="Fail">Fail</option>
          </select>
          <input placeholder="Temperature" value={form.temperature} onChange={(e) => setForm((c) => ({ ...c, temperature: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300" />
          <input placeholder="Texture" value={form.texture} onChange={(e) => setForm((c) => ({ ...c, texture: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300" />
          <input placeholder="Odor" value={form.odor} onChange={(e) => setForm((c) => ({ ...c, odor: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300" />
          <input placeholder="Comments" value={form.comments} onChange={(e) => setForm((c) => ({ ...c, comments: e.target.value }))} className="px-4 py-2 rounded-lg border border-gray-300 md:col-span-2" />
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg px-4 py-2">Save Check</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${stat.color} text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition`}>
            <div className="flex items-center justify-between"><div><p className="text-white/80 text-sm font-medium">{stat.label}</p><p className="text-3xl font-bold mt-2">{stat.value}</p></div><span className="opacity-80">{stat.icon}</span></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"><div className="flex items-center gap-3 mb-3"><ThermometerIcon className="w-5 h-5 text-cyan-600" /><h3 className="font-semibold text-gray-900">Temperature</h3></div><p className="text-sm text-gray-600">Keep at 0-4C for optimal freshness</p></div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"><div className="flex items-center gap-3 mb-3"><SparklesIcon className="w-5 h-5 text-cyan-600" /><h3 className="font-semibold text-gray-900">Odor Check</h3></div><p className="text-sm text-gray-600">Must have fresh, oceanic aroma</p></div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"><div className="flex items-center gap-3 mb-3"><EyeIcon className="w-5 h-5 text-cyan-600" /><h3 className="font-semibold text-gray-900">Appearance</h3></div><p className="text-sm text-gray-600">Bright color, no discoloration</p></div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"><div className="flex items-center gap-3 mb-3"><BadgeIcon className="w-5 h-5 text-cyan-600" /><h3 className="font-semibold text-gray-900">Texture</h3></div><p className="text-sm text-gray-600">Firm flesh, springs back quickly</p></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-gray-700 mb-2 block">Search Quality Checks</label><input type="text" placeholder="Search by QC ID or product..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" /></div>
          <div className="flex items-end"><button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition font-medium inline-flex items-center justify-center gap-2"><DownloadIcon className="w-4 h-4" /> Export Report</button></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-xs md:text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="px-4 py-2 text-left font-semibold">QC #</th><th className="px-4 py-2 text-left font-semibold">Product</th><th className="px-4 py-2 text-left font-semibold">Batch</th><th className="px-4 py-2 text-left font-semibold">Date</th><th className="px-4 py-2 text-left font-semibold">Temperature</th><th className="px-4 py-2 text-left font-semibold">Texture</th><th className="px-4 py-2 text-left font-semibold">Odor</th><th className="px-4 py-2 text-left font-semibold">Result</th><th className="px-4 py-2 text-left font-semibold">Comments</th><th className="px-4 py-2 text-center font-semibold">Actions</th></tr></thead>
            <tbody>
              {filteredChecks.map((check) => (
                <tr key={check.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">{check.id}</td><td className="px-6 py-4 text-gray-700">{check.product}</td><td className="px-6 py-4 text-gray-600">{check.batchNo}</td><td className="px-6 py-4 text-gray-600">{check.checkDate}</td><td className="px-6 py-4 font-medium text-gray-900">{check.temperature}</td><td className="px-6 py-4 text-gray-700">{check.texture}</td><td className="px-6 py-4 text-gray-700">{check.odor}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getResultColor(check.result)}`}>{check.result}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{check.comments}</td>
                  <td className="px-6 py-4 text-center"><div className="flex items-center justify-center gap-2"><button aria-label="View quality check" className="p-1.5 hover:bg-blue-100 rounded transition text-blue-600"><EyeIcon className="w-4 h-4" /></button><button aria-label="Export certificate" className="p-1.5 hover:bg-gray-200 rounded transition text-gray-600"><FileIcon className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Industry Certifications</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['ISO 22000', 'HACCP', 'MSC Certified', 'FSSC 22000'].map((cert) => (
            <div key={cert} className="p-4 border border-gray-200 rounded-lg text-center hover:shadow-md transition"><div className="flex items-center justify-center mb-2"><BadgeIcon className="w-7 h-7 text-amber-500" /></div><p className="font-medium text-gray-900 text-sm">{cert}</p><p className="text-xs text-green-600 mt-1 inline-flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Valid</p></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Quality
