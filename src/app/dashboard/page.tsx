'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import { AlertCircle, MapPin, Radio, Users, Activity, Shield, Zap, TrendingUp, Eye } from 'lucide-react'
import { Incident, AuditLog, SEVERITY_COLORS } from '@/types'
import { formatTimeAgo, formatDateTime } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import AnimatedCounter from '@/components/dashboard/AnimatedCounter'
import TimeAgo from '@/components/dashboard/TimeAgo'

const BRAND_COLORS = {
  red: '#C0392B',
  darkRed: '#a93226',
  navy: '#1A1A2E',
  gray: '#9B9B9B'
}

export default function LiveFeedPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState({ totalRegs: 0, totalIncidents: 0, totalNGOs: 0, totalUsers: 0 })
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/analytics')
        const data = await response.json()
        
        setIncidents(data.recentIncidents || [])
        setAuditLogs(data.recentLogs || [])
        setStats({
          totalRegs: data.totalRegs || 0,
          totalIncidents: data.activeAlerts || 0,
          totalNGOs: data.totalNGOs || 0,
          totalUsers: data.totalUsers || 0
        })
        setChartData(data.monthlyData || [])
      } catch (e) {
        console.error('FAILED_TO_FETCH_LIVE_INTELLIGENCE:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 5000) // Reduced to 5s for live command centre feel
    return () => clearInterval(id)
  }, [])

  const critical = incidents.filter(i => i.severity === 'CRITICAL' && i.status === 'ACTIVE').length

  return (
    <div className="flex flex-col flex-1">
      <Header title="Guardian Command Centre" subtitle="Live Intelligence Feed" />
      <main className="flex-1 p-8 space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'GSM Network', value: 'OPERATIONAL', sub: 'Standard Frequency', icon: Radio, color: 'text-emerald-600', dot: 'bg-emerald-500' },
            { label: 'Cloud Status', value: 'ACTIVE', sub: 'High Availability', icon: Activity, color: 'text-emerald-500', dot: 'bg-emerald-500' },
            { label: 'NGO Partners', value: stats.totalNGOs, isNum: true, sub: 'Ready for Dispatch', icon: Users, color: 'text-blue-600', dot: 'bg-blue-500' },
            { label: 'SAPS API Status', value: 'SYNCED', sub: 'Evidence Link Active', icon: Shield, color: 'text-havenly-red', dark: true },
          ].map(({ label, value, isNum, sub, icon: Icon, color, dot, dark }) => (
            <div key={label} className={`rounded-xl border p-4 transition-all hover:shadow-md ${dark ? 'bg-havenly-navy border-havenly-navy' : 'bg-white border-gray-100'}`}>
              <div className="flex items-start justify-between mb-3">
                <span className={`text-[10px] uppercase tracking-widest font-bold ${dark ? 'text-white/40' : 'text-gray-400'}`}>{label}</span>
                <Icon size={16} className={dark ? 'text-havenly-red' : color} />
              </div>
              <div className={`font-display font-bold text-xl ${dark ? 'text-white' : 'text-havenly-navy'}`}>
                {isNum ? <AnimatedCounter value={Number(value)} /> : value}
              </div>
              <div className={`text-[10px] mt-1 flex items-center gap-1.5 ${dark ? 'text-white/30' : 'text-gray-400'}`}>
                {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
                {sub}
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Incident Feed */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-havenly-red animate-pulse" />
                <span className="font-display font-bold text-havenly-navy text-sm">Live Incident Feed</span>
              </div>
              {critical > 0 && <span className="text-[10px] bg-havenly-red text-white px-2 py-0.5 rounded font-bold">CRITICAL: {critical}</span>}
            </div>
            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="p-12 text-center text-gray-400 text-sm">Synchronizing with Guardian Protocol...</div>
              ) : incidents.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-sm">Zero critical incidents in current perimeter.</div>
              ) : incidents.map(incident => (
                <div key={incident.id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${SEVERITY_COLORS[incident.severity]}`}>
                          {incident.severity}
                        </span>
                        <TimeAgo date={incident.createdAt} className="text-gray-400 text-[10px]" />
                      </div>
                      <div className="font-bold text-havenly-navy text-sm">{incident.title}</div>
                      <div className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">{incident.description}</div>
                      <div className="flex items-center gap-1.5 mt-2.5 text-gray-400 text-[10px]">
                        <MapPin size={10} />
                        <span>{incident.location || 'Unknown Coordinates'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Engagement Depth */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="font-display font-bold text-havenly-navy text-xs uppercase tracking-wider">Engagement Depth</span>
                <span className="text-[9px] bg-havenly-red text-white px-2 py-0.5 rounded font-bold">LIVE</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Pre-Registrations</div>
                  <div className="font-display font-bold text-havenly-navy text-2xl tracking-tighter">
                    <AnimatedCounter value={stats.totalRegs} />
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Growth Rate</div>
                  <div className="font-display font-bold text-havenly-green text-2xl tracking-tighter">+14.2%</div>
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 700, fill: BRAND_COLORS.gray }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ fontSize: 11, border: 'none', borderRadius: 8, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    />
                    <Bar dataKey="registrations" fill={BRAND_COLORS.red} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tactical Controls */}
            <div className="bg-havenly-navy rounded-xl border border-havenly-navy p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <img src="/logo.png" alt="Havenly Logo" className="w-16 h-16 object-cover rounded-lg" />
              </div>
              <div className="relative">
                <div className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-4">Tactical Operations</div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Broadcast Perimeter Alert', icon: Zap, primary: true },
                    { label: 'Export Evidence Chain', icon: Shield, primary: false },
                    { label: 'Review NGO Credentials', icon: Eye, primary: false },
                  ].map(({ label, icon: Icon, primary }) => (
                    <button key={label} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold transition-all ${primary ? 'bg-havenly-red text-white hover:bg-havenly-red shadow-lg shadow-havenly-red/20' : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'}`}>
                      <span>{label}</span>
                      <Icon size={14} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log Preview */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="font-display font-bold text-havenly-navy text-sm tracking-tight">System Integrity Audit</h3>
              <p className="text-gray-400 text-[10px] mt-0.5 font-medium uppercase tracking-wide">Cryptographically Signed Administrative Trail</p>
            </div>
            <button className="text-havenly-red text-[10px] font-bold hover:underline uppercase tracking-widest">Full Record Access →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="text-[9px] text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-gray-50/20">
                {['Timestamp', 'Action', 'Module', 'Origin', 'Signature'].map(h => <th key={h} className="px-6 py-4 font-bold">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {auditLogs.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-xs">Awaiting first administrative event...</td></tr>
                ) : auditLogs.slice(0, 5).map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono text-[10px]">{formatDateTime(log.createdAt)}</td>
                    <td className="px-6 py-4"><span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-mono font-bold">{log.action}</span></td>
                    <td className="px-6 py-4 text-havenly-navy font-bold text-[10px] uppercase">{log.module}</td>
                    <td className="px-6 py-4 text-gray-500 text-[10px]">{log.origin}</td>
                    <td className="px-6 py-4 font-mono text-[9px] text-gray-300 max-w-[120px] truncate">{log.hashSig}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
