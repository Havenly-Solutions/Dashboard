'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import { TrendingUp, Users, Shield, Building2, Target, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import AnimatedCounter from '@/components/dashboard/AnimatedCounter'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalRegs: 0,
    totalLeads: 0,
    totalApproved: 0,
    totalIncidents: 0,
    totalNGOs: 0,
    totalUsers: 0,
    incidentsBySeverity: [] as any[],
    monthlyData: [] as any[]
  })
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState<string | null>(null)

  const handleExport = async (type: 'audit' | 'alerts' | 'registrations', format: string) => {
    setIsExporting(type)
    try {
      // Use local dashboard proxy for exports as well
      const endpoint = type === 'audit' ? '/api/export/audit-logs' :
        type === 'alerts' ? '/api/export/alerts' : '/api/export/registrations'

      const response = await fetch(`${endpoint}?format=${format}`)

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `havenly-${type}-${new Date().toISOString()}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(null)
    }
  }

  useEffect(() => {
    let stopped = false

    async function load() {
      try {
        const r = await fetch(`/api/analytics`)
        
        // Stop polling on auth errors — don't hammer the backend on 401/429
        if (r.status === 401 || r.status === 403) {
          console.warn('[Analytics] Auth error — stopping poll. Please refresh the page.')
          stopped = true
          return
        }
        
        if (!r.ok) return

        const d = await r.json()
        setStats(prev => ({
          ...prev,
          totalRegs: d.totalRegs ?? 0,
          totalLeads: d.totalLeads ?? 0,
          totalApproved: d.totalApproved ?? 0,
          totalIncidents: d.activeAlerts ?? d.totalIncidents ?? 0,
          totalNGOs: d.totalNGOs ?? 0,
          totalUsers: d.totalUsers ?? 0,
          incidentsBySeverity: d.incidentsBySeverity || [],
          monthlyData: d.monthlyData || []
        }))
      } catch (e) {
        console.error('Failed to load analytics:', e)
      } finally {
        setLoading(false)
      }
    }

    load()
    // Poll every 30s only if not stopped due to auth error
    const id = setInterval(() => { if (!stopped) load() }, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-8 pt-8">
        <Header title="Analytics" subtitle="Growth & Engagement Intelligence" />
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={() => handleExport('audit', 'pdf')}
            disabled={isExporting !== null}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A2E] text-white rounded-xl text-sm font-semibold hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-black/5"
          >
            {isExporting === 'audit' ? <Loader2 className="animate-spin" size={16} /> : <Shield size={16} />}
            Audit PDF
          </button>
          <button
            onClick={() => handleExport('alerts', 'xlsx')}
            disabled={isExporting !== null}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-[#1A1A2E] rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
          >
            {isExporting === 'alerts' ? <Loader2 className="animate-spin" size={16} /> : <TrendingUp size={16} />}
            Alerts XLSX
          </button>
          <button
            onClick={() => handleExport('registrations', 'csv')}
            disabled={isExporting !== null}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-[#1A1A2E] rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
          >
            {isExporting === 'registrations' ? <Loader2 className="animate-spin" size={16} /> : <Users size={16} />}
            Registry CSV
          </button>
        </div>
      </div>
      <main className="flex-1 p-8 space-y-6">

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Pre-Registrations', value: stats.totalRegs, icon: Users, change: '+14%', positive: true },
            { label: 'Active Incidents', value: stats.totalIncidents, icon: Shield, change: 'Live tracking', positive: null },
            { label: 'NGO Partners', value: stats.totalNGOs, icon: Building2, change: '+3 this month', positive: true },
            { label: 'Team Members', value: stats.totalUsers, icon: Target, change: 'All active', positive: true },
          ].map(({ label, value, icon: Icon, change, positive }) => (
            <div key={label} className="glass-card p-6  hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#1A1A2E] group-hover:bg-red-50 group-hover:text-[#C0392B] transition-colors">
                  <Icon size={20} />
                </div>
                <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${positive === true ? 'bg-emerald-50 text-emerald-600' :
                  positive === false ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                  {change}
                </div>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-bold">{label}</div>
              <div className="text-3xl font-display font-black text-[#1A1A2E]">
                <AnimatedCounter value={Number(value)} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-8 ">
            <h3 className="font-display font-bold text-[#1A1A2E] text-xl mb-6 tracking-tight">Growth Velocity</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyData.length > 0 ? stats.monthlyData : []}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="registrations" stroke="#C0392B" strokeWidth={4} dot={{ r: 4, fill: '#C0392B', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-8 ">
            <h3 className="font-display font-bold text-[#1A1A2E] text-xl mb-6 tracking-tight">Regional Distribution</h3>
            <div className="h-[300px] flex items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <div className="text-center text-gray-400 text-sm">
                <Building2 size={32} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold text-black uppercase tracking-widest text-[10px]">Coming to v2.4</p>
                <p className="mt-1">Live Geo-Fencing & Heatmaps</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
