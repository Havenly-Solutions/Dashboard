'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import { AlertCircle, MapPin, Radio, Users, Activity, Shield, Zap, TrendingUp, Eye } from 'lucide-react'
import { Incident, AuditLog, SEVERITY_COLORS } from '@/types'
import { formatTimeAgo, formatDateTime } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import AnimatedCounter from '@/components/dashboard/AnimatedCounter'
import TimeAgo from '@/components/dashboard/TimeAgo'
import Image from 'next/image'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSocket } from '@/hooks/useSocket'

const BRAND_COLORS = {
  blue: '#1a73e8',
  green: '#34a853',
  yellow: '#fbbc04',
  red: '#ea4335',
  text: '#202124',
  secondary: '#5f6368',
  border: '#dadce0',
  grey: '#f1f3f4'
}

export default function LiveFeedPage() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    
    function onAlertFired() {
      queryClient.invalidateQueries({ queryKey: ['live-feed'] });
    }

    socket.on('alert_fired', onAlertFired);
    return () => {
      socket.off('alert_fired', onAlertFired);
    };
  }, [socket, queryClient]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['live-feed'],
    queryFn: async () => {
      const response = await fetch('/api/analytics')
      if (!response.ok) throw new Error('Failed to fetch analytics')
      return response.json()
    }
  });

  const incidents: Incident[] = data?.recentIncidents || [];
  const auditLogs: AuditLog[] = data?.recentLogs || [];
  const stats = {
    totalRegs: data?.totalRegs || 0,
    totalIncidents: data?.activeAlerts || 0,
    totalNGOs: data?.totalNGOs || 0,
    totalUsers: data?.totalUsers || 0
  };
  const chartData = data?.monthlyData || [];

  const critical = incidents.filter(i => i.severity === 'CRITICAL' && i.status === 'ACTIVE').length

  return (
    <div className="flex flex-col flex-1">
      <Header title="Performance Overview" subtitle="System Intelligence Feed" />
      <main className="flex-1 p-6 space-y-4">
        {/* Top Stats - GSC Style Property Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'GSM Network', value: 'OPERATIONAL', sub: 'Standard Frequency', icon: Radio, color: 'text-[#34a853]', dot: 'bg-[#34a853]' },
            { label: 'Cloud Status', value: 'ACTIVE', sub: 'High Availability', icon: Activity, color: 'text-[#34a853]', dot: 'bg-[#34a853]' },
            { label: 'NGO Partners', value: stats.totalNGOs, isNum: true, sub: 'Verified Dispatch', icon: Users, color: 'text-[#1a73e8]', dot: 'bg-[#1a73e8]' },
            { label: 'Evidence API', value: 'SYNCED', sub: 'Real-time Link', icon: Shield, color: 'text-[#1a73e8]', dot: 'bg-[#1a73e8]' },
          ].map(({ label, value, isNum, sub, icon: Icon, color, dot }) => (
            <div key={label} className="card p-6 bg-white border border-[#dadce0] rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <span className="text-[12px] text-[#5f6368] font-medium">{label}</span>
                <Icon size={18} className={color} />
              </div>
              <div className="text-[20px] font-medium text-[#202124]">
                {isNum ? <AnimatedCounter value={Number(value)} /> : value}
              </div>
              <div className="text-[12px] mt-1 flex items-center gap-1.5 text-[#5f6368]">
                {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
                {sub}
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Incident Feed */}
          <div className="xl:col-span-2 card p-0 overflow-hidden bg-white border border-[#dadce0] rounded-lg">
            <div className="px-6 py-4 border-b border-[#f1f3f4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[16px] font-medium text-[#202124]">Activity Logs</span>
              </div>
              {critical > 0 && <span className="text-[12px] bg-[#fce8e6] text-[#ea4335] px-2 py-0.5 rounded-full border border-[#fad2cf] font-medium">Critical: {critical}</span>}
            </div>
            <div className="divide-y divide-[#f1f3f4] max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="p-12 text-center text-[#5f6368] text-sm">Loading intelligence data...</div>
              ) : incidents.length === 0 ? (
                <div className="p-12 text-center text-[#5f6368] text-sm">No active alerts detected.</div>
              ) : incidents.map(incident => (
                <div key={incident.id} className="px-6 py-5 hover:bg-[#f8f9fa] transition-colors cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[11px] font-medium uppercase px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[incident.severity]}`}>
                          {incident.severity}
                        </span>
                        <TimeAgo date={incident.createdAt} className="text-[#5f6368] text-[12px]" />
                      </div>
                      <div className="text-[14px] font-medium text-[#202124]">{incident.title}</div>
                      <div className="text-[#5f6368] text-[13px] mt-1 line-clamp-2">{incident.description}</div>
                      <div className="flex items-center gap-1.5 mt-2 text-[#80868b] text-[12px]">
                        <MapPin size={12} />
                        <span>{incident.location || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Engagement Depth - GSC Graph Style */}
            <div className="card p-6 bg-white border border-[#dadce0] rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[14px] font-medium text-[#202124]">Engagement Performance</span>
                <span className="text-[11px] text-[#34a853] font-medium flex items-center gap-1">
                  <TrendingUp size={12} />
                  LIVE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-[12px] text-[#5f6368] mb-1">Total Conversions</div>
                  <div className="text-[22px] font-normal text-[#202124]">
                    <AnimatedCounter value={stats.totalRegs} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] text-[#5f6368] mb-1">Growth</div>
                  <div className="text-[22px] font-normal text-[#34a853]">
                    {data?.weeklyGrowth !== undefined 
                      ? (data.weeklyGrowth > 0 ? `+${data.weeklyGrowth}%` : `${data.weeklyGrowth}%`) 
                      : '—'}
                  </div>
                </div>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#5f6368' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ fontSize: 12, border: '1px solid #dadce0', borderRadius: 4, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: '#f8f9fa' }}
                    />
                    <Bar dataKey="registrations" fill="#1a73e8" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tactical Controls - GSC Action List Style */}
            <div className="card p-6 bg-white border border-[#dadce0] rounded-lg">
              <div className="text-[14px] font-medium text-[#202124] mb-4">Quick Actions</div>
              <div className="space-y-2">
                {[
                  { label: 'Broadcast Perimeter Alert', icon: Zap, primary: true },
                  { label: 'Export Evidence Chain', icon: Shield, primary: false },
                  { label: 'Review NGO Credentials', icon: Eye, primary: false },
                ].map(({ label, icon: Icon, primary }) => (
                  <button key={label} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-[4px] text-[13px] font-medium transition-all ${primary ? 'bg-[#1a73e8] text-white hover:bg-[#1557b0]' : 'bg-transparent text-[#1a73e8] border border-[#dadce0] hover:bg-[#1a73e8]/05'}`}>
                    <span>{label}</span>
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log Preview - GSC Table Style */}
        <div className="card p-0 overflow-hidden bg-white border border-[#dadce0] rounded-lg">
          <div className="px-6 py-5 border-b border-[#f1f3f4] flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-medium text-[#202124]">Security Audit</h3>
              <p className="text-[#5f6368] text-[12px] mt-0.5">Verified administrative performance log</p>
            </div>
            <button className="text-[#1a73e8] text-[13px] font-medium hover:bg-[#e8f0fe] px-3 py-1.5 rounded-[4px]">Full Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-[#f8f9fa] border-b border-[#dadce0]">
                {['Timestamp', 'Action', 'Module', 'Origin', 'Signature'].map(h => <th key={h} className="px-6 py-3 text-[12px] font-medium text-[#5f6368]">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-[#f1f3f4]">
                {auditLogs.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-[#5f6368] text-sm">No recent security events.</td></tr>
                ) : auditLogs.slice(0, 5).map(log => (
                  <tr key={log.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-6 py-4 text-[#5f6368] font-mono text-[11px]">{formatDateTime(log.createdAt)}</td>
                    <td className="px-6 py-4"><span className="text-[11px] bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded-full border border-[#d2e3fc] font-medium">{log.action}</span></td>
                    <td className="px-6 py-4 text-[#202124] font-medium text-[13px]">{log.module}</td>
                    <td className="px-6 py-4 text-[#5f6368] text-[13px]">{log.origin}</td>
                    <td className="px-6 py-4 font-mono text-[11px] text-[#80868b] max-w-[120px] truncate">{log.hashSig}</td>
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
