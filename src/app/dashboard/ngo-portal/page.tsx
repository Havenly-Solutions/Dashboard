'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import { NGOPartner, NGOStatus } from '@/types'
import { formatDate } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { CheckCircle, XCircle, Clock, Building2, Plus, X, Loader2 } from 'lucide-react'

const STATUS_STYLES: Record<NGOStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  SUSPENDED: 'bg-gray-50 text-gray-600 border-gray-200',
}
const STATUS_ICONS: Record<NGOStatus, React.ReactNode> = {
  PENDING: <Clock size={12} />, APPROVED: <CheckCircle size={12} />,
  REJECTED: <XCircle size={12} />, SUSPENDED: <XCircle size={12} />,
}

export default function NGOPortalPage() {
  const { data: session } = useSession()
  const [partners, setPartners] = useState<NGOPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ orgName: '', liaisonName: '', orgType: 'Registered NGO', email: '', regNumber: '', operatingRegion: '', missionStatement: '' })

  useEffect(() => {
    if (!session) return
    fetch('/api/ngo-partners', {
      headers: { 'Authorization': `Bearer ${(session?.user as any)?.accessToken}` }
    })
    .then(r => r.json())
    .then(d => { setPartners(Array.isArray(d) ? d : []); setLoading(false) })
  }, [session])

  async function updateStatus(id: string, status: NGOStatus) {
    const res = await fetch(`/api/ngo-partners/${id}`, { 
      method: 'PATCH', 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session?.user as any)?.accessToken}`
      }, 
      body: JSON.stringify({ status }) 
    })
    if (res.ok) setPartners(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  async function submitApplication(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true)
    const res = await fetch('/api/ngo-partners', { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session?.user as any)?.accessToken}`
      }, 
      body: JSON.stringify(form) 
    })
    const data = await res.json()
    if (res.ok) { setPartners(prev => [data, ...prev]); setSuccess('Application submitted'); setShowForm(false) }
    setSubmitting(false)
  }

  const approved = partners.filter(p => p.status === 'APPROVED').length
  const pending = partners.filter(p => p.status === 'PENDING').length

  return (
    <div className="flex flex-col flex-1">
      <Header title="NGO Portal" subtitle="Institutional Alliance Management" />
      <main className="flex-1 p-8 space-y-6">
        {success && <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm animate-fade-in">{success}</div>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Partners', value: partners.length, color: 'text-[#1A1A2E]' },
            { label: 'Approved', value: approved, color: 'text-emerald-600' },
            { label: 'Pending Review', value: pending, color: 'text-amber-600' },
            { label: 'Active Regions', value: new Set(partners.map(p => p.operatingRegion)).size, color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-card">
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">{label}</div>
              <div className={`font-display font-bold text-3xl ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-[#1A1A2E]">Partner Applications</h2>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#C0392B] text-white rounded-lg text-sm font-medium hover:bg-[#a93226] transition-colors">
            <Plus size={16} />New Application
          </button>
        </div>

        <div className="glass-card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
              {['Organisation', 'Type', 'Liaison', 'Region', 'Applied', 'Status', 'Actions'].map(h =>
                <th key={h} className="text-left px-6 py-3 font-medium">{h}</th>
              )}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
                : partners.length === 0 ? <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No applications yet</td></tr>
                : partners.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 animate-fade-in">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1A1A2E]/10 rounded-lg flex items-center justify-center"><Building2 size={14} className="text-[#1A1A2E]" /></div>
                        <div>
                          <div className="font-medium text-[#1A1A2E]">{p.orgName}</div>
                          <div className="text-xs text-gray-400">{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{p.orgType}</td>
                    <td className="px-6 py-4 text-gray-600">{p.liaisonName}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{p.operatingRegion}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{formatDate(p.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-1 rounded border ${STATUS_STYLES[p.status]}`}>
                        {STATUS_ICONS[p.status]}{p.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        title="Update status"
                        value={p.status} 
                        onChange={e => updateStatus(p.id, e.target.value as NGOStatus)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#C0392B]"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approve</option>
                        <option value="REJECTED">Reject</option>
                        <option value="SUSPENDED">Suspend</option>
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="portal-container rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in overflow-y-auto max-h-[90vh]">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-display font-bold text-[#1A1A2E] text-lg">Partner Application</h3>
                <button title="Close" onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={submitApplication} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Organisation Name', key: 'orgName', placeholder: 'Legal entity name' },
                    { label: 'Liaison Name', key: 'liaisonName', placeholder: 'Full name' },
                    { label: 'Official Email', key: 'email', placeholder: 'liaison@org.co.za' },
                    { label: 'Reg Number', key: 'regNumber', placeholder: 'e.g. 2023/123456/08' },
                    { label: 'Operating Region', key: 'operatingRegion', placeholder: 'e.g. Gauteng, Cape Metro' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key} className="col-span-2 sm:col-span-1">
                      <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
                      <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder} required={key !== 'regNumber'}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0392B]" />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Organisation Type</label>
                    <select title="Select organization type" value={form.orgType} onChange={e => setForm(f => ({ ...f, orgType: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0392B]">
                      {['Registered NGO', 'Community Watch', 'First Responder', 'University Safety', 'Government Department'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Mission Statement</label>
                    <textarea value={form.missionStatement} onChange={e => setForm(f => ({ ...f, missionStatement: e.target.value }))}
                      rows={3} placeholder="Describe your organisation's focus and response capabilities..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0392B] resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-[#C0392B] text-white rounded-lg text-sm font-medium hover:bg-[#a93226] flex items-center justify-center gap-2">
                    {submitting ? <><Loader2 size={14} className="animate-spin" />Submitting...</> : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
