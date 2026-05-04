'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import { MeshNode } from '@/types'
import { formatTimeAgo } from '@/lib/utils'
import { Activity, Wifi, Battery, Cpu } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'

const NODE_STATUS_COLORS: Record<string, string> = {
  STABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SOLAR_ACTIVE: 'bg-amber-50 text-amber-700 border-amber-200',
  SATELLITE_BK: 'bg-blue-50 text-blue-700 border-blue-200',
  OFFLINE: 'bg-red-50 text-red-700 border-red-200',
}

export default function MeshTopologyPage() {
  const [nodes, setNodes] = useState<MeshNode[]>([])
  const [selected, setSelected] = useState<MeshNode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient('/api/mesh-nodes').then(d => { setNodes(Array.isArray(d) ? d : []); setLoading(false) })
    const id = setInterval(() => apiClient('/api/mesh-nodes').then(d => setNodes(Array.isArray(d) ? d : [])), 30000)
    return () => clearInterval(id)
  }, [])

  const stable = nodes.filter(n => n.status === 'STABLE').length
  const avgLatency = nodes.length > 0 ? Math.round(nodes.reduce((s, n) => s + n.latencyLocal, 0) / nodes.length) : 0

  return (
    <div className="flex flex-col flex-1">
      <Header title="Mesh Topology" subtitle="Guardian Network Infrastructure" />
      <main className="flex-1 p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'GSM Health', value: '--', icon: Wifi, sub: 'Connecting...', color: 'text-gray-400' },
            { label: 'Active Nodes', value: String(nodes.length), icon: Activity, sub: `${stable} stable`, color: 'text-[#1A1A2E]' },
            { label: 'Avg Latency', value: `${avgLatency}ms`, icon: Cpu, sub: 'Local response', color: 'text-blue-600' },
            { label: 'Uptime', value: '0%', icon: Battery, sub: '0 days', color: 'text-[#1A1A2E]' },
          ].map(({ label, value, icon: Icon, sub, color }) => (

            <div key={label} className="stat-card">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-widest">{label}</span>
                <Icon size={16} className={color} />
              </div>
              <div className={`font-display font-bold text-2xl ${color}`}>{value}</div>
              <div className="text-xs text-gray-400 mt-1">{sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card  overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-[#1A1A2E]">Topological Logs</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-400">System Status: Initializing</span>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                {['Node ID', 'Updated', 'Event', 'Status', 'Hops', 'Throughput'].map(h => <th key={h} className="text-left px-6 py-3 font-medium">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading nodes...</td></tr>
                  : nodes.map(node => (
                    <tr key={node.id} className="hover:bg-gray-50/50 cursor-pointer transition-colors" onClick={() => setSelected(node)}>
                      <td className="px-6 py-3 font-mono font-bold text-[#1A1A2E] text-xs">{node.nodeId}</td>
                      <td className="px-6 py-3 font-mono text-xs text-gray-500">{formatTimeAgo(node.updatedAt)}</td>
                      <td className="px-6 py-3 text-gray-600 text-xs">{node.eventType || 'Heartbeat'}</td>
                      <td className="px-6 py-3"><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${NODE_STATUS_COLORS[node.status]}`}>{node.status.replace('_', ' ')}</span></td>
                      <td className="px-6 py-3 font-mono text-xs text-gray-500">{String(node.hopCount).padStart(2, '0')}</td>
                      <td className="px-6 py-3 text-xs text-gray-500">{node.throughput}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            {selected ? (
              <div className="glass-card  p-5">
                <h3 className="font-display font-bold text-[#1A1A2E] mb-4">Selected Node: {selected.name}</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Node ID', value: selected.nodeId },
                    { label: 'Region', value: selected.region },
                    { label: 'Power Status', value: selected.powerStatus },
                    { label: 'Connections', value: `${selected.connections} Peer Links` },
                    { label: 'Latency (Local)', value: `${selected.latencyLocal}ms` },
                    { label: 'Latency (Sat)', value: `${selected.latencySat}ms` },
                    { label: 'Throughput', value: selected.throughput },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-gray-400 text-xs uppercase tracking-widest">{label}</span>
                      <span className="font-medium text-[#1A1A2E] text-xs">{value}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-[#1A1A2E] text-white text-sm rounded-lg hover:bg-[#0f0f1f] transition-colors">
                  Remote Diagnostic Scan
                </button>
              </div>
            ) : (
              <div className="glass-card  p-5 text-center text-gray-400 text-sm">
                <Activity size={32} className="mx-auto mb-2 text-gray-200" />
                Click a node to view details
              </div>
            )}
            <div className="bg-[#1A1A2E] rounded-xl p-5">
              <div className="text-white/40 text-xs uppercase tracking-widest mb-3">Optimisation Suite</div>
              <div className="grid grid-cols-2 gap-2">
                {['Auto-Heal', 'Balancing', 'Sync Keys', 'Power Save'].map(a => (
                  <button key={a} className="px-3 py-2.5 glass-card/5 text-white/70 text-xs rounded-lg hover:glass-card/10 transition-colors font-medium">{a}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
