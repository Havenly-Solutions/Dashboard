'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/dashboard/Header'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  ArrowRight,
  ShieldAlert,
  Search,
  Filter,
  Check,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Role } from '@/types'

interface ProfileRequest {
  id: string
  userId: string
  fieldName: 'name' | 'email' | 'phone'
  oldValue: string
  newValue: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedAt: string
  user: {
    name: string
    email: string
  }
}

export default function ApprovalsHub() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<ProfileRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')

  useEffect(() => {
    fetchRequests()
  }, [filter])

  async function fetchRequests() {
    try {
      const url = filter === 'ALL' 
        ? '/api/admin/profile-requests' 
        : `/api/admin/profile-requests?status=${filter}`
      const res = await fetch(url)
      const data = await res.json()
      setRequests(data)
    } catch (e) {
      console.error('Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(id: string, status: 'APPROVED' | 'REJECTED', note?: string) {
    setProcessing(id)
    try {
      const res = await fetch(`/api/admin/profile-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNote: note || `Actioned by ${session?.user?.name}` })
      })
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== id))
      }
    } catch (e) {
      console.error('Action failed')
    } finally {
      setProcessing(null)
    }
  }

  const getFieldIcon = (field: string) => {
    switch (field) {
      case 'email': return <Mail size={14} />
      case 'phone': return <Phone size={14} />
      default: return <User size={14} />
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <Header 
        title="Founder Approvals Hub" 
        subtitle="Critical Identity & Access Governance" 
      />
      
      <main className="flex-1 p-8 space-y-6">
        {/* Info Banner */}
        <div className="bg-[#1A1A2E] rounded-xl p-6 border border-[#1A1A2E] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <ShieldAlert size={120} className="text-white" />
          </div>
          <div className="relative max-w-2xl">
            <h2 className="text-white font-display font-bold text-lg mb-2">Personnel Identity Control</h2>
            <p className="text-white/60 text-xs leading-relaxed mb-4">
              Operational security requires strict oversight of profile modifications. As a Founder or Executive PA, your approval is required to update core personnel identifiers. These actions are cryptographically signed and logged.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C0392B] animate-pulse" />
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">
                  {requests.length} Pending Actions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-white border border-gray-100 rounded-lg p-1 shadow-sm">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all",
                  filter === f 
                    ? "bg-[#1A1A2E] text-white shadow-md" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  className="bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-600 placeholder-gray-400 focus:outline-none focus:border-[#C0392B] w-64 shadow-sm"
                  placeholder="Seach Personnel..." 
                />
             </div>
          </div>
        </div>

        {/* Request Feed */}
        <div className="grid gap-4">
          {loading ? (
             <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
                <div className="flex justify-center mb-4">
                  <div className="w-6 h-6 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Synchronizing Identity Vault...</p>
             </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
              <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-4 opacity-20" />
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Identity Status: Stable. No pending requests.</p>
            </div>
          ) : requests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:border-[#C0392B]/20 transition-all">
              <div className="flex items-center">
                {/* Profile Meta */}
                <div className="px-6 py-5 border-r border-gray-50 min-w-[240px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#1A1A2E] font-bold text-xs border border-gray-100">
                      {request.user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1A1A2E] leading-none mb-1">{request.user.name}</h4>
                      <p className="text-[10px] text-gray-400 font-medium truncate max-w-[140px]">{request.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    <Clock size={12} />
                    <span>{new Date(request.requestedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Change Details */}
                <div className="flex-1 px-8 py-5 flex items-center justify-center gap-12">
                   <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current {request.fieldName}</span>
                      <div className="text-sm font-medium text-gray-400 italic bg-gray-50 px-4 py-2 rounded-lg border border-dashed border-gray-200">
                        {request.oldValue || 'Not Set'}
                      </div>
                   </div>
                   
                   <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                        <ArrowRight size={14} />
                      </div>
                      <div className="absolute -top-1 -right-1">
                         <div className="w-3 h-3 bg-[#C0392B] rounded-full flex items-center justify-center text-[7px] text-white font-black animate-pulse">!</div>
                      </div>
                   </div>

                   <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold text-[#C0392B] uppercase tracking-widest mb-1">Proposed Update</span>
                      <div className="text-sm font-bold text-[#1A1A2E] bg-red-50/30 px-4 py-2 rounded-lg border border-[#C0392B]/10">
                        {request.newValue}
                      </div>
                   </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-5 border-l border-gray-50 flex items-center gap-2 bg-gray-50/30">
                  {request.status === 'PENDING' ? (
                    <>
                      <button 
                        onClick={() => handleAction(request.id, 'APPROVED')}
                        disabled={!!processing}
                        className="p-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        title="Approve Change"
                      >
                        {processing === request.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                      </button>
                      <button 
                        onClick={() => handleAction(request.id, 'REJECTED')}
                        disabled={!!processing}
                        className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all disabled:opacity-50"
                        title="Reject Change"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <div className={cn(
                      "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                      request.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                    )}>
                      {request.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <style jsx global>{`
        .animate-in {
          animation: slideUp 0.4s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
