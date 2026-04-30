'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import { Incident, SEVERITY_COLORS } from '@/types'
import { useSession } from 'next-auth/react'
import { formatDateTime, formatTimeAgo } from '@/lib/utils'
import { MapPin, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import AnimatedCounter from '@/components/dashboard/AnimatedCounter'
import TimeAgo from '@/components/dashboard/TimeAgo'

export default function SOSAlertsPage() {
  const { data: session } = useSession()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!session) return
    async function load() {
      try {
        const params = new URLSearchParams({ page: String(page) })
        if (filter !== 'ALL') params.set('filter', filter)
        
        const r = await fetch(`/api/incidents?${params}`, {
          headers: { 'Authorization': `Bearer ${(session?.user as any)?.accessToken}` }
        })
        const res = await r.json()
        setIncidents(res.data || [])
        setTotal(res.total || (res.data?.length || 0))
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
    const id = setInterval(load, 10000) // Reduced to 10s for more responsive feed
    return () => clearInterval(id)
  }, [session, page, filter])

  const filtered = filter === 'ALL' ? incidents : incidents.filter(i => filter === 'ACTIVE' ? i.status === 'ACTIVE' : i.severity === filter)
  const critical = incidents.filter(i => i.severity === 'CRITICAL').length
  const active = incidents.filter(i => i.status === 'ACTIVE').length
  const resolved = incidents.filter(i => i.status === 'RESOLVED').length

  return (
    <div className="flex flex-col flex-1">
      <Header title="SOS Alerts" subtitle="Real-Time Emergency Feed" />
      <main className="flex-1 p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Incidents', value: incidents.length, color: 'text-[#1A1A2E]' },
            { label: 'Active', value: active, color: 'text-[#C0392B]' },
            { label: 'Critical', value: critical, color: 'text-red-600' },
            { label: 'Resolved', value: resolved, color: 'text-emerald-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-card">
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">{label}</div>
              <div className={`font-display font-bold text-3xl ${color}`}>
                <AnimatedCounter value={value} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {['ALL', 'ACTIVE', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${filter === f ? 'bg-[#1A1A2E] text-white' : 'glass-card border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {loading ? <div className="text-center py-8 text-gray-400">Loading alerts...</div>
            : filtered.length === 0 ? <div className="text-center py-8 text-gray-400">No incidents found</div>
            : filtered.map(incident => (
              <div key={incident.id} className={`glass-card rounded-xl border shadow-sm p-5 animate-fade-in ${incident.severity === 'CRITICAL' ? 'border-red-200' : 'border-gray-100'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${incident.severity === 'CRITICAL' ? 'bg-red-50' : incident.severity === 'HIGH' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                    <AlertCircle size={20} className={incident.severity === 'CRITICAL' ? 'text-red-500' : incident.severity === 'HIGH' ? 'text-amber-500' : 'text-blue-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${SEVERITY_COLORS[incident.severity]}`}>{incident.severity}</span>
                      <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded border ${incident.status === 'ACTIVE' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>{incident.status}</span>
                      <TimeAgo date={incident.createdAt} className="text-gray-400 text-xs ml-auto" />
                    </div>
                    <h3 className="font-semibold text-[#1A1A2E]">{incident.title}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{incident.description}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-gray-400 text-xs">
                      <MapPin size={11} /><span>{incident.location}</span>
                      {incident.lat && <span className="font-mono ml-2">{incident.lat.toFixed(4)}° S, {incident.lng?.toFixed(4)}° E</span>}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{formatDateTime(incident.createdAt)}</div>
                </div>
                
                {['FOUNDER', 'CHIEF_OFFICER', 'MANAGER', 'SECURITY', 'POLICE'].includes((session?.user as any)?.role) && incident.status === 'ACTIVE' && (
                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end gap-2">
                    <button 
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/incidents/${incident.id}/status`, {
                            method: 'PATCH',
                            headers: { 
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${(session?.user as any)?.accessToken}` 
                            },
                            body: JSON.stringify({ status: 'RESOLVED' })
                          });
                          if (res.ok) {
                            setIncidents(prev => prev.map(i => i.id === incident.id ? { ...i, status: 'RESOLVED' } : i));
                            toast.success('Incident marked as RESOLVED');
                          }
                        } catch (e) { toast.error('Failed to update status'); }
                      }}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                    >
                      Mark Resolved
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/incidents/${incident.id}/status`, {
                            method: 'PATCH',
                            headers: { 
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${(session?.user as any)?.accessToken}` 
                            },
                            body: JSON.stringify({ status: 'DISMISSED' })
                          });
                          if (res.ok) {
                            setIncidents(prev => prev.map(i => i.id === incident.id ? { ...i, status: 'DISMISSED' } : i));
                            toast.success('Incident DISMISSED');
                          }
                        } catch (e) { toast.error('Failed to update status'); }
                      }}
                      className="px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>

        <div className="flex items-center justify-between px-2 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            Showing {filtered.length} of {total} results
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 glass-card border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all uppercase tracking-wider"
            >
              ← Previous
            </button>
            <span className="text-[10px] font-bold text-[#1A1A2E] px-2">{page}</span>
            <button 
              disabled={filtered.length < 10}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 glass-card border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all uppercase tracking-wider"
            >
              Next →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
