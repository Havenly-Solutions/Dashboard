'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/dashboard/Header'
import { PreRegistration } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { Search, Download, MapPin, Users, CheckCircle2, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { toast } from 'sonner'

import { apiClient } from '@/lib/apiClientClient'

const REGIONS = ['All Regions', 'Johannesburg / Gauteng', 'Cape Town / Western Cape', 'Durban / KZN', 'Pretoria / Gauteng', 'Port Elizabeth / Eastern Cape']
const PIE_COLORS = ['#C0392B', '#1A1A2E', '#0B6E4F', '#D4A017', '#6B7280', '#9B59B6']

export default function PreRegistrationsPage() {
  const { data: session } = useSession()
  const [registrations, setRegistrations] = useState<PreRegistration[]>([])
  const [total, setTotal] = useState(0)
  const [byRegion, setByRegion] = useState<{ region: string; _count: number }[]>([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('All Regions')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (region !== 'All Regions') params.set('region', region)
      const res = await apiClient(`/api/pre-registrations?${params}`, {
        headers: { 'Authorization': `Bearer ${(session?.user as any)?.accessToken}` }
      })
      if (res.success || res.data) {
        setRegistrations(res.data || [])
        setTotal(res.meta?.total || res.total || 0)
        // Note: backend doesn't seem to return byRegion yet, we'll keep it as [] or mock if needed
        setByRegion(res.byRegion || [])
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [page, region, session])

  useEffect(() => { load() }, [load])

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await apiClient(`/api/pre-registrations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      toast.success(`Registration marked as ${status.toLowerCase()}`)
      load() // Refresh data
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  const filtered = registrations.filter(r =>
    search ? r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()) : true
  )

  const exportCSV = () => {
    const csv = ['Name,Email,Region,Source,Date', ...registrations.map(r => `${r.name},${r.email},${r.region},${r.source},${r.createdAt}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'havenly-pre-registrations.csv'; a.click()
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Pre-Registrations" subtitle="July Tour & Website Signups" />
      <main className="flex-1 p-8 space-y-6">
        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-widest">Total Signups</span>
              <Users size={16} className="text-[#C0392B]" />
            </div>
            <div className="font-display font-bold text-3xl text-[#1A1A2E]">{total.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs mt-1"></div>
          </div>
          <div className="stat-card">
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Tour Target</div>
            <div className="font-display font-bold text-3xl text-[#1A1A2E]">5,000</div>
            <div className="mt-2">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#C0392B] rounded-full transition-all" 
                  ref={(el) => {
                    if (el) el.style.width = `${Math.min(100, (total / 5000) * 100)}%`
                  }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">{((total / 5000) * 100).toFixed(1)}% of goal</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Top Region</div>
            <div className="font-display font-bold text-xl text-[#1A1A2E]">{byRegion[0]?.region?.split('/')[0]?.trim() || '—'}</div>
            <div className="text-xs text-gray-400 mt-1">{byRegion[0]?._count || 0} registrations</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card  p-5">
            <h3 className="font-display font-semibold text-[#1A1A2E] text-sm mb-4">Registrations by Region</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byRegion.slice(0, 6).map(r => ({ name: r.region.split('/')[0].trim(), count: r._count }))} barSize={20}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9B9B9B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9B9B9B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, border: 'none', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#C0392B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card  p-5">
            <h3 className="font-display font-semibold text-[#1A1A2E] text-sm mb-4">Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byRegion.slice(0, 6).map(r => ({ name: r.region.split('/')[0].trim(), value: r._count }))} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                  {byRegion.slice(0, 6).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, border: 'none', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card ">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-display font-bold text-[#1A1A2E] text-base">All Registrations</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm w-48 focus:outline-none focus:border-[#C0392B]" placeholder="Search..." />
              </div>
              <select 
                title="Filter by region"
                value={region} 
                onChange={e => { setRegion(e.target.value); setPage(1) }} 
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
              <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-[#1A1A2E] text-white rounded-lg text-sm hover:bg-[#0f0f1f] transition-colors">
                <Download size={14} />Export CSV
              </button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
              {['Name', 'Email', 'Region', 'Source', 'Date', ''].map((h, i) => <th key={i} className="text-left px-6 py-3 font-medium">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.map(reg => (
                <tr key={reg.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-medium text-[#1A1A2E]">{reg.name}</td>
                  <td className="px-6 py-3 text-gray-500">{reg.email}</td>
                  <td className="px-6 py-3"><div className="flex items-center gap-1.5 text-gray-500"><MapPin size={11} />{reg.region}</div></td>
                  <td className="px-6 py-3"><span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${reg.source === 'tour' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{reg.source}</span></td>
                  <td className="px-6 py-3 text-gray-400 text-xs">{formatDateTime(reg.createdAt)}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {reg.status === 'LEAD' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(reg.id, 'APPROVED')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve & Convert"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(reg.id, 'REJECTED')}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {reg.status === 'APPROVED' && (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Approved</span>
                      )}
                      {reg.status === 'REJECTED' && (
                        <span className="text-[10px] font-bold text-red-600 uppercase">Rejected</span>
                      )}
                      {reg.status === 'CONVERTED' && (
                        <span className="text-[10px] font-bold text-[#1A1A2E] uppercase">Converted</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Showing {filtered.length} of {total}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-xs px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => p + 1)} className="text-xs px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Next →</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
