'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/dashboard/Header'
import { SupportTicket } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { 
  LifeBuoy, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  User, 
  Tag,
  Loader2,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'

export default function SupportTicketsPage() {
  const { data: session }: any = useSession()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [showNewModal, setShowNewModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'SOFTWARE',
    priority: 'MEDIUM'
  })

  useEffect(() => {
    if (!session) return
    loadTickets()
  }, [session, filter])

  async function loadTickets() {
    try {
      const url = filter === 'ALL' ? '/api/support-tickets' : `/api/support-tickets?status=${filter}`
      const res = await apiClient(url)
      const data = await res.json()
      setTickets(Array.isArray(data) ? data : (data.data || []))
    } catch (err) {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await apiClient(`/api/support-tickets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status: status as any } : t))
        toast.success(`Ticket marked as ${status}`)
      } else {
        const error = await res.json()
        throw new Error(error.message || 'Update failed')
      }
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await apiClient('/api/support-tickets', {
        method: 'POST',
        body: JSON.stringify(newTicket)
      })
      if (res.ok) {
        const created = await res.json()
        setTickets(prev => [created, ...prev])
        toast.success('Support ticket opened successfully')
        setShowNewModal(false)
        setNewTicket({ subject: '', message: '', category: 'SOFTWARE', priority: 'MEDIUM' })
      } else {
        const error = await res.json()
        throw new Error(error.message || 'Failed to open ticket')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'CLOSED': return 'bg-gray-50 text-gray-500 border-gray-200'
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 font-black'
      case 'HIGH': return 'text-orange-600 font-bold'
      case 'MEDIUM': return 'text-amber-600 font-bold'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Technical Support" subtitle="Chief Officer Assistance Desk" />
      
      <main className="flex-1 p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 glass-card border border-gray-100 p-1 rounded-lg">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all",
                  filter === f ? "bg-[#1A1A2E] text-white" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-[#C0392B] text-white rounded-lg text-sm font-medium hover:bg-[#a93226] transition-colors flex items-center gap-2 shadow-lg shadow-red-900/10"
          >
            <LifeBuoy size={16} /> Open New Ticket
          </button>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 size={32} className="animate-spin text-[#C0392B] mx-auto mb-4" />
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Accessing Support Database...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-20 glass-card border border-gray-100 rounded-xl text-center">
              <CheckCircle size={32} className="text-emerald-500 mx-auto mb-4 opacity-20" />
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">All systems operational. No active tickets.</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <div key={ticket.id} className="glass-card  group hover:border-[#C0392B]/20 transition-all overflow-hidden">
                <div className="flex items-center">
                  <div className="p-5 border-r border-gray-50 flex flex-col items-center justify-center min-w-[100px] bg-gray-50/30">
                    <div className={cn("text-[9px] font-black uppercase tracking-[0.2em] mb-1", getPriorityStyle(ticket.priority))}>
                      {ticket.priority}
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold border ${getStatusStyle(ticket.status)}`}>
                      {ticket.status}
                    </div>
                  </div>

                  <div className="flex-1 p-5 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">
                      <Tag size={12} />
                      <span>{ticket.category}</span>
                      <span className="opacity-30">•</span>
                      <Clock size={12} />
                      <span>{formatDateTime(ticket.createdAt)}</span>
                      {ticket.user && (
                        <>
                          <span className="opacity-30">•</span>
                          <User size={12} />
                          <span className="text-gray-600">{ticket.user.name}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[#1A1A2E] mb-1 truncate">{ticket.subject}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">{ticket.message}</p>
                  </div>

                  <div className="p-5 flex items-center gap-2">
                    {['FOUNDER', 'CHIEF_OFFICER', 'MANAGER'].includes(session?.user?.role) && (
                      <select 
                        title="Update Status"
                        value={ticket.status}
                        onChange={(e) => updateStatus(ticket.id, e.target.value)}
                        className="text-[10px] font-bold uppercase tracking-widest border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:border-[#C0392B] cursor-pointer"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-display font-bold text-[#1A1A2E] text-lg">Support Request</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Priority Technical Assistance</p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-100">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 ml-1">Subject</label>
                <input 
                  required
                  value={newTicket.subject}
                  onChange={e => setNewTicket(t => ({ ...t, subject: e.target.value }))}
                  placeholder="e.g. Mesh Link Timeout in Sector 4"
                  className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C0392B] bg-gray-50/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 ml-1">Category</label>
                  <select 
                    title="Category"
                    value={newTicket.category}
                    onChange={e => setNewTicket(t => ({ ...t, category: e.target.value }))}
                    className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C0392B] bg-gray-50/50 transition-all"
                  >
                    <option value="HARDWARE">Hardware Ops</option>
                    <option value="SOFTWARE">Dashboard/App</option>
                    <option value="PROTOCOL">SOP / Protocol</option>
                    <option value="SECURITY">Cyber Security</option>
                    <option value="OTHER">General Enquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 ml-1">Priority</label>
                  <select 
                    title="Priority"
                    value={newTicket.priority}
                    onChange={e => setNewTicket(t => ({ ...t, priority: e.target.value }))}
                    className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C0392B] bg-gray-50/50 transition-all"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High (SOP Level 2)</option>
                    <option value="URGENT">Urgent (SOS Support)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 ml-1">Detailed Message</label>
                <textarea 
                  required
                  rows={4}
                  value={newTicket.message}
                  onChange={e => setNewTicket(t => ({ ...t, message: e.target.value }))}
                  placeholder="Provide context, error codes, and location data..."
                  className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C0392B] bg-gray-50/50 transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-100 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-[#C0392B] text-white rounded-xl text-sm font-bold hover:bg-[#a93226] transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 disabled:opacity-50 uppercase tracking-widest"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Dispatch Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
