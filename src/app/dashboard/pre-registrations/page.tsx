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

const PROVINCES = ['All Provinces', 'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West']
const PIE_COLORS = ['#C0392B', '#1A1A2E', '#0B6E4F', '#D4A017', '#6B7280', '#9B59B6', '#E67E22', '#1ABC9C', '#2980B9']
const TARGET_REGISTRATIONS = 5000;

export default function PreRegistrationsPage() {
  const { data: session } = useSession()
  const [registrations, setRegistrations] = useState<PreRegistration[]>([])
  const [total, setTotal] = useState(0)
  const [byProvince, setByProvince] = useState<{ province: string; _count: number }[]>([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [province, setProvince] = useState('All Provinces')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (province !== 'All Provinces') params.set('province', province)
      const res = await apiClient(`/api/pre-registrations?${params}`, {
        headers: { 'Authorization': `Bearer ${(session?.user as any)?.accessToken}` }
      })

      const data = res.data || []
      setRegistrations(data)
      setTotal(res.meta?.total || data.length || 0)

      // Compute client-side aggregation safely as per requirements
      const agg = data.reduce((acc: any, curr: PreRegistration) => {
        acc[curr.province] = (acc[curr.province] || 0) + 1
        return acc
      }, {})
      setByProvince(Object.entries(agg).map(([k, v]) => ({ province: k, _count: v as number })).sort((a, b) => b._count - a._count))

    } catch (e) { console.error(e) }
    setLoading(false)
  }, [page, province, session])

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
    search ?
      r.firstName.toLowerCase().includes(search.toLowerCase()) ||
      r.surname.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) : true
  )

  const exportCSV = () => {
    const csv = ['First Name,Surname,Email,Province,Source,Date', ...registrations.map(r => `${r.firstName},${r.surname},${r.email},${r.province},${r.source},${r.createdAt}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'havenly-pre-registrations.csv'; a.click()
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Pre-Registrations" subtitle="Lead Pipeline & Launch Readiness" />
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
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Target Goal</div>
            <div className="font-display font-bold text-3xl text-[#1A1A2E]">{TARGET_REGISTRATIONS.toLocaleString()}</div>
            <div className="mt-2">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#C0392B] rounded-full transition-all" 
                  style={{ width: `${Math.min(100, (total / TARGET_REGISTRATIONS) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">{((total / TARGET_REGISTRATIONS) * 100).toFixed(1)}% of goal</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Top Province</div>
            <div className="font-display font-bold text-xl text-[#1A1A2E]">{byProvince[0]?.province || '—'}</div>
            <div className="text-xs text-gray-400 mt-1">{byProvince[0]?._count || 0} registrations</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card  p-5">
            <h3 className="font-display font-semibold text-[#1A1A2E] text-sm mb-4">By Province</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byProvince.slice(0, 6).map(r => ({ name: r.province, count: r._count }))} barSize={20}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9B9B9B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9B9B9B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, border: 'none', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#C0392B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card  p-5">
            <h3 className="font-display font-semibold text-[#1A1A2E] text-sm mb-4">Regional Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byProvince.slice(0, 9).map(r => ({ name: r.province, value: r._count }))} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                  {byProvince.slice(0, 9).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
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
                title="Filter by province"
                value={province}
                onChange={e => { setProvince(e.target.value); setPage(1) }}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-[#1A1A2E] text-white rounded-lg text-sm hover:bg-[#0f0f1f] transition-colors">
                <Download size={14} />Export CSV
              </button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
              {['Name', 'Email', 'Province', 'Source', 'Date', ''].map((h, i) => <th key={i} className="text-left px-6 py-3 font-medium">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.map(reg => (
                <tr key={reg.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-medium text-[#1A1A2E]">{reg.firstName} {reg.surname}</td>
                  <td className="px-6 py-3 text-gray-500">{reg.email}</td>
                  <td className="px-6 py-3"><div className="flex items-center gap-1.5 text-gray-500"><MapPin size={11} />{reg.province}</div></td>
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
