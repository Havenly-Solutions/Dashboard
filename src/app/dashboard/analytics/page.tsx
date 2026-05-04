'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/dashboard/Header'
import { 
  TrendingUp, Users, Shield, Loader2, 
  ArrowUpRight, ArrowDownRight, Minus, CheckCircle2, 
  Clock, XCircle, AlertTriangle 
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, CartesianGrid 
} from 'recharts'
import AnimatedCounter from '@/components/dashboard/AnimatedCounter'
import { useQuery } from '@tanstack/react-query'
import { useSocket } from '@/hooks/useSocket'
import { apiClient } from '@/lib/apiClient'
import { cn } from '@/lib/utils'

const BRAND_PALETTE = ['#C0392B', '#1A1A2E', '#0B6E4F', '#D4A017', '#6366f1', '#ec4899']
const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#C0392B',
  HIGH: '#E67E22',
  MEDIUM: '#F39C12',
  LOW: '#0B6E4F'
}

const SEVERITY_BG_MAP: Record<string, string> = {
  CRITICAL: 'bg-[#C0392B]',
  HIGH: 'bg-[#E67E22]',
  MEDIUM: 'bg-[#F39C12]',
  LOW: 'bg-[#0B6E4F]'
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 rounded-xl shadow-xl">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-[#1A1A2E]">{payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const { data: session } = useSession()
  
  // Real-time invalidation via socket
  useSocket();

  const { data, isLoading: loading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiClient(`/api/analytics`),
    retry: false
  });

  const handleExport = async (type: 'audit' | 'alerts' | 'registrations', format: string) => {
    setIsExporting(type)
    try {
      const endpoint = type === 'audit' ? '/api/export/audit-logs' :
        type === 'alerts' ? '/api/export/alerts' : '/api/export/registrations'

      const response = await apiClient(`${endpoint}?format=${format}`, {
        responseType: 'blob',
        headers: { 'Authorization': `Bearer ${(session?.user as any)?.accessToken}` }
      })

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

  const weeklyGrowth = data?.weeklyGrowth ?? 0;
  const GrowthBadge = () => {
    if (weeklyGrowth > 0) return (
      <div className="flex items-center gap-0.5 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
        <ArrowUpRight size={10} /> {weeklyGrowth}%
      </div>
    )
    if (weeklyGrowth < 0) return (
      <div className="flex items-center gap-0.5 bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
        <ArrowDownRight size={10} /> {weeklyGrowth}%
      </div>
    )
    return (
      <div className="flex items-center gap-0.5 bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
        <Minus size={10} /> 0%
      </div>
    )
  }

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="animate-spin text-gray-400" size={32} />
    </div>
  )

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: 'Total Regs', value: data?.totalRegs, subtitle: 'Lifetime signups' },
            { label: 'Active Alerts', value: data?.activeAlerts, subtitle: 'Current incidents' },
            { label: 'NGO Partners', value: data?.totalNGOs, subtitle: 'Verified partners' },
            { label: 'Team Members', value: data?.totalUsers, subtitle: 'Platform users' },
            { label: 'Open Tickets', value: data?.openTickets, subtitle: 'Support queue' },
            { label: 'Approved', value: data?.totalApproved, subtitle: 'Vetted intakes' },
          ].map(({ label, value, subtitle }) => (
            <div key={label} className="glass-card p-5 border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{label}</span>
                <GrowthBadge />
              </div>
              <div className="text-2xl font-display font-black text-[#1A1A2E]">
                <AnimatedCounter value={Number(value ?? 0)} />
              </div>
              <div className="text-[9px] text-gray-400 font-medium mt-1 uppercase tracking-wider">{subtitle}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registration Growth */}
          <div className="glass-card p-6 border border-gray-100">
            <h3 className="font-display font-bold text-[#1A1A2E] text-sm mb-6 uppercase tracking-widest">Registration Growth</h3>
            <div className="h-[280px]">
              {data?.monthlyData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthlyData}>
                    <defs>
                      <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C0392B" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#C0392B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="registrations" stroke="#C0392B" strokeWidth={3} fillOpacity={1} fill="url(#colorRegs)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No registration data available</div>
              )}
            </div>
          </div>

          {/* Intake Funnel */}
          <div className="glass-card p-6 border border-gray-100">
            <h3 className="font-display font-bold text-[#1A1A2E] text-sm mb-6 uppercase tracking-widest">Intake Funnel</h3>
            <div className="h-[280px]">
              {data?.funnelData?.some((d: any) => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.funnelData} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1A1A2E', fontWeight: 700 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {data.funnelData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={BRAND_PALETTE[index % BRAND_PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No funnel data available</div>
              )}
            </div>
          </div>

          {/* Regional Distribution */}
          <div className="glass-card p-6 border border-gray-100">
            <h3 className="font-display font-bold text-[#1A1A2E] text-sm mb-6 uppercase tracking-widest">Regional Distribution</h3>
            <div className="h-[280px]">
              {data?.regionData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.regionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="region" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fill: '#1A1A2E', fontWeight: 600 }} 
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#1A1A2E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No regional data available</div>
              )}
            </div>
          </div>

          {/* Alert Severity */}
          <div className="glass-card p-6 border border-gray-100">
            <h3 className="font-display font-bold text-[#1A1A2E] text-sm mb-6 uppercase tracking-widest">Alert Severity Breakdown</h3>
            <div className="h-[280px] flex items-center">
              {data?.incidentsBySeverity?.some((d: any) => d.value > 0) ? (
                <>
                  <ResponsiveContainer width="60%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.incidentsBySeverity}
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.incidentsBySeverity.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || BRAND_PALETTE[index % BRAND_PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-[40%] space-y-3">
                    {data.incidentsBySeverity.map((entry: any) => (
                      <div key={entry.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", SEVERITY_BG_MAP[entry.name] || 'bg-gray-400')} />
                          <span className="text-[10px] font-bold text-gray-500 uppercase">{entry.name}</span>
                        </div>
                        <span className="text-xs font-black text-[#1A1A2E]">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">No incident data available</div>
              )}
            </div>
          </div>

          {/* NGO Partner Pipeline */}
          <div className="glass-card p-6 border border-gray-100">
            <h3 className="font-display font-bold text-[#1A1A2E] text-sm mb-6 uppercase tracking-widest">NGO Partner Pipeline</h3>
            <div className="space-y-4">
              {data?.ngoStatusData?.length > 0 ? (
                data.ngoStatusData.map((item: any) => {
                  const Icon = item.status === 'APPROVED' ? CheckCircle2 :
                               item.status === 'PENDING' ? Clock :
                               item.status === 'REJECTED' ? XCircle : AlertTriangle;
                  const color = item.status === 'APPROVED' ? 'text-emerald-600' :
                                item.status === 'PENDING' ? 'text-blue-600' :
                                item.status === 'REJECTED' ? 'text-red-600' : 'text-amber-600';
                  return (
                    <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={color} />
                        <span className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wide">{item.status}</span>
                      </div>
                      <span className="text-sm font-black text-[#1A1A2E]">{item.count}</span>
                    </div>
                  )
                })
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">No NGO data available</div>
              )}
            </div>
          </div>

          {/* Daily Signups */}
          <div className="glass-card p-6 border border-gray-100">
            <h3 className="font-display font-bold text-[#1A1A2E] text-sm mb-6 uppercase tracking-widest">This Week — Daily Signups</h3>
            <div className="h-[280px]">
              {data?.dailyData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="registrations" fill="#0B6E4F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No signup data for this week</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
