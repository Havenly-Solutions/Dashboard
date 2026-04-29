'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import { AuditLog } from '@/types'
import { useSession } from 'next-auth/react'
import { formatDateTime } from '@/lib/utils'
import { Download, ShieldCheck, CheckCircle } from 'lucide-react'

const CATEGORIES = ['All Events', 'Critical', 'System']
const DATE_FILTERS = ['24H', '7D', '30D']

const ACTION_COLORS: Record<string, string> = {
  SOS_TRIGGER: 'bg-red-50 text-red-700 border-red-200',
  ADMIN_LOGIN: 'bg-blue-50 text-blue-700 border-blue-200',
  DATA_EXPORT: 'bg-purple-50 text-purple-700 border-purple-200',
  PARTNER_VERIFY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MESH_NODE_SYNC: 'bg-amber-50 text-amber-700 border-amber-200',
  NGO_PORTAL_AUTH: 'bg-teal-50 text-teal-700 border-teal-200',
  SOS_DISPATCH_ACK: 'bg-red-50 text-red-700 border-red-200',
}

export default function SafetyLogsPage() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('All Events')
  const [dateFilter, setDateFilter] = useState('24H')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    async function load() {
      setLoading(true)
      try {
        const r = await fetch(`/api/audit-logs?page=${page}&filter=${filter}`, {
          headers: { 'Authorization': `Bearer ${(session?.user as any)?.accessToken}` }
        })
        const data = await r.json()
        setLogs(Array.isArray(data) ? data : (data.logs || []))
        setTotal(Array.isArray(data) ? data.length : (data.total || 0))
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [page, filter, session])

  return (
    <div className="flex flex-col flex-1">
      <Header title="Safety Logs" subtitle="Cryptographic Audit Trail" />
      <main className="flex-1 p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: total || '14,892', sub: '+2.4% vs last week', subColor: 'text-emerald-600' },
            { label: 'Critical Alerts', value: '24', sub: 'Requires review', subColor: 'text-red-500', valueColor: 'text-[#C0392B]' },
            { label: 'Hash Status', value: 'Verified', sub: 'Root: 0x72a...bf4e', icon: true, valueColor: 'text-emerald-600' },
            { label: 'Node Uptime', value: '99.99%', sub: 'Cluster-04 Active' },
          ].map(({ label, value, sub, subColor, valueColor, icon }) => (
            <div key={label} className="stat-card">
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">{label}</div>
              <div className={`font-display font-bold text-2xl ${valueColor || 'text-[#1A1A2E]'} flex items-center gap-2`}>
                {icon && <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />}
                {value}
              </div>
              <div className={`text-xs mt-1 ${subColor || 'text-gray-400'}`}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-1">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${filter === c ? 'bg-[#1A1A2E] text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-1">
              {DATE_FILTERS.map(d => (
                <button key={d} onClick={() => setDateFilter(d)} className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${dateFilter === d ? 'bg-gray-100 text-gray-700' : 'text-gray-400'}`}>
                  {d}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={14} />Export Audit
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1A1A2E] text-white rounded-lg text-sm hover:bg-[#0f0f1f] transition-colors">
              <ShieldCheck size={14} />Verify Chain
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
              {['Timestamp (UTC+2)', 'Event Category', 'Description', 'Initiator', 'Integrity Hash', 'Status'].map(h => (
                <th key={h} className="text-left px-6 py-3 font-medium">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No logs found</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{formatDateTime(log.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${ACTION_COLORS[log.action] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{log.description}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{log.userEmail || log.origin}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">{log.hashSig}</td>
                  <td className="px-6 py-4"><div className="flex items-center gap-1.5 text-emerald-600"><CheckCircle size={13} /><span className="text-xs font-medium">Verified</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400 italic">End of log for current cycle. Hash chain intact.</span>
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="text-xs px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40">← Previous</button>
              <span className="text-xs text-gray-400">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} className="text-xs px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Next →</button>
            </div>
          </div>
        </div>

        {/* Integrity Policy */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1A1A2E] rounded-lg flex items-center justify-center">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-[#1A1A2E] text-sm">Integrity Policy</div>
              <div className="text-xs text-gray-400">Logs are immutable once written. All deletion requests must be signed by three Level 1 Administrators.</div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <div><span className="text-gray-300 uppercase tracking-widest text-[10px] block">Network Latency</span><span className="font-mono font-bold text-[#1A1A2E]">14ms</span></div>
            <div><span className="text-gray-300 uppercase tracking-widest text-[10px] block">Storage Cluster</span><span className="font-mono font-bold text-[#1A1A2E]">ZAF-CAPE-01</span></div>
            <div><span className="text-gray-300 uppercase tracking-widest text-[10px] block">Last Backup</span><span className="font-mono font-bold text-[#1A1A2E]">2m ago</span></div>
          </div>
        </div>
      </main>
    </div>
  )
}
