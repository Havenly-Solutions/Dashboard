'use client'
import Header from '@/components/dashboard/Header'
import { FileText, Cpu, Users, BookOpen, Radio, Shield, Globe, ExternalLink } from 'lucide-react'

const CATEGORIES = [
  { title: 'Hardware Ops', icon: Cpu, count: '19 Documents', desc: 'Deep-dive schematics and maintenance actions for Guardian Node clusters' },
  { title: 'Chief Training', icon: Users, count: '8 Modules', desc: 'Expert-led video modules covering tactical decision making under pressure' },
  { title: 'SOP Frameworks', icon: FileText, count: '35 Policies', desc: 'Legal guidelines and Standard Operating Procedures for force and civilian evacuation' },
  { title: 'Comms Linkage', icon: Radio, count: '12 Schematics', desc: 'Technical data on encrypted satellite-uplink and radio frequency management protocols' },
  { title: 'Cyber Defense', icon: Shield, count: '24 Guides', desc: 'Best practices for terminal security, biometric access control, and digital counter-measures' },
  { title: 'Civic Liaison', icon: Globe, count: '16 Templates', desc: 'Templates for community outreach, emergency town hall coordination, and civilian liaison training' },
]

const UPDATES = [
  { date: '26 JUN', title: 'V6.2 Satellite Uplink Calibration Patch' },
  { date: '14 JUN', title: 'Encryption standard moved to AES-256-GCM' },
  { date: '01 JUN', title: 'New SOP Framework for GBV Response published' },
]

export default function ResourceCentrePage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Resource Centre" subtitle="Knowledge Base V6.2" />
      <main className="flex-1 p-8 space-y-6">
        {/* Featured */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative bg-[#1A1A2E] rounded-xl overflow-hidden p-6 flex flex-col justify-end min-h-[180px]">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <span className="relative text-[#C0392B] text-[10px] font-bold uppercase tracking-widest mb-2">Priority Protocol</span>
            <h3 className="relative font-display font-bold text-white text-xl mb-1">Emergency Mesh Failure Framework</h3>
            <p className="relative text-white/40 text-sm">Complete guide for maintaining connectivity during full network isolation. Required reading for all Chief Officers.</p>
            <button className="relative mt-4 flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors w-fit">
              Read Protocol <ExternalLink size={14} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h4 className="font-semibold text-[#1A1A2E] text-sm mb-3">Platform Updates</h4>
              <div className="space-y-2">
                {UPDATES.map(u => (
                  <div key={u.title} className="flex items-start gap-3">
                    <span className="text-[#C0392B] text-[10px] font-bold uppercase tracking-widest flex-shrink-0 mt-0.5">{u.date}</span>
                    <span className="text-gray-600 text-xs">{u.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#1A1A2E] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={14} className="text-[#C0392B]" />
                <span className="text-white font-semibold text-sm">Training Status</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-[#C0392B] rounded-full" style={{ width: '68%' }} />
              </div>
              <p className="text-white/30 text-xs">You have 3 mandatory modules pending completion</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-display font-bold text-[#1A1A2E] mb-4">Technical Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map(({ title, icon: Icon, count, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-[#C0392B]/30 hover:shadow-md transition-all cursor-pointer group">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#C0392B]/10 transition-colors">
                  <Icon size={18} className="text-gray-400 group-hover:text-[#C0392B] transition-colors" />
                </div>
                <h4 className="font-display font-semibold text-[#1A1A2E] text-sm mb-1">{title}</h4>
                <p className="text-gray-400 text-xs mb-3 leading-relaxed">{desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-[10px] uppercase tracking-widest">{count}</span>
                  <span className="text-[#C0392B] text-xs font-medium group-hover:underline">View →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <h3 className="font-display font-semibold text-[#1A1A2E] mb-1">Can&apos;t find what you&apos;re looking for?</h3>
          <p className="text-gray-400 text-sm mb-4">Our specialised technical support team is available 24/7 for Chief Officers requiring specific hardware guidance or protocol clarification.</p>
          <button className="px-6 py-2.5 bg-[#1A1A2E] text-white rounded-lg text-sm font-medium hover:bg-[#0f0f1f] transition-colors">
            Open Support Ticket
          </button>
        </div>
      </main>
    </div>
  )
}
