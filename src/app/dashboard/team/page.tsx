'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import { useSession } from 'next-auth/react'
import { DashboardUser, Role, ROLE_LABELS, ROLE_BADGE_COLORS } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { Plus, Trash2, Edit2, X, Loader2, ShieldAlert, UserCheck, Eye, EyeOff } from 'lucide-react'

const ROLES: Role[] = [Role.PA, Role.MANAGER, Role.DEVELOPER, Role.INVESTOR, Role.NGO_PARTNER]

export default function TeamPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role as Role
  const [users, setUsers] = useState<DashboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: Role.PA, department: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (role !== 'FOUNDER') return
    fetch('/api/users').then(r => r.json()).then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false) })
  }, [role])

  if (role !== 'FOUNDER') return (
    <div className="flex flex-col flex-1">
      <Header title="Team Management" />
      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert size={48} className="text-gray-300 mx-auto mb-3" />
          <h2 className="font-display font-bold text-[#1A1A2E] text-xl mb-1">Access Restricted</h2>
          <p className="text-gray-400 text-sm">Only the Founder can manage team access.</p>
        </div>
      </main>
    </div>
  )

  async function inviteUser(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); setSubmitting(false); return }
      setUsers(prev => [data, ...prev])
      setSuccess(`${data.name} added successfully`)
      setForm({ name: '', email: '', role: Role.PA, department: '', password: '' })
      setShowInvite(false)
    } catch { setError('Network error') }
    setSubmitting(false)
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) setUsers(prev => prev.map(u => u.id === id ? { ...u, status: status as any } : u))
  }

  async function deleteUser(id: string) {
    if (!confirm('Remove this team member?')) return
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== id))
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Team Management" subtitle="Founder Control Panel" />
      <main className="flex-1 p-8 space-y-6">

        {success && <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2 animate-fade-in"><UserCheck size={16} />{success}</div>}
        {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-fade-in">{error}</div>}

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ROLES.map(r => {
            const count = users.filter(u => u.role === r).length
            return (
              <div key={r} className="stat-card">
                <div className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase mb-2 inline-block ${ROLE_BADGE_COLORS[r]}`}>{ROLE_LABELS[r]}</div>
                <div className="font-display font-bold text-2xl text-[#1A1A2E]">{count}</div>
              </div>
            )
          })}
        </div>

        {/* Header bar */}
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-[#1A1A2E]">All Team Members ({users.length})</h2>
          <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2 bg-[#C0392B] text-white rounded-lg text-sm font-medium hover:bg-[#a93226] transition-colors">
            <Plus size={16} />Add Team Member
          </button>
        </div>

        {/* Role portal descriptions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-display font-semibold text-[#1A1A2E] text-sm mb-4">Portal Access by Role</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {([
              { role: 'PA', access: 'Pre-Registrations, Analytics, Settings', desc: 'Manages tour signups, handles scheduling and communications' },
              { role: 'MANAGER', access: 'Live Feed, SOS Alerts, Safety Logs, Pre-Regs, Analytics, NGO Portal', desc: 'Full operational oversight of tour and community events' },
              { role: 'DEVELOPER', access: 'Live Feed, SOS Alerts, Mesh Topology, Safety Logs, Resource Centre', desc: 'Technical infrastructure monitoring and system health' },
              { role: 'INVESTOR', access: 'Analytics, Pre-Registrations, Resource Centre', desc: 'Read-only access to growth metrics and investor materials' },
              { role: 'NGO_PARTNER', access: 'NGO Portal, Resource Centre', desc: 'Partner onboarding tools and collaborative safety resources' },
              { role: 'FOUNDER', access: 'Everything + Team Management', desc: 'Full system access, user creation, role assignment and revocation' },
            ] as { role: Role; access: string; desc: string }[]).map(({ role: r, access, desc }) => (
              <div key={r} className="border border-gray-100 rounded-lg p-3">
                <div className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase mb-2 inline-block ${ROLE_BADGE_COLORS[r]}`}>{ROLE_LABELS[r]}</div>
                <p className="text-xs text-gray-500 mb-1.5">{desc}</p>
                <p className="text-[10px] text-gray-400"><span className="font-semibold text-gray-500">Portals: </span>{access}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
              {['Member', 'Role', 'Department', 'Last Login', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-6 py-3 font-medium">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading team...</td></tr>
                : users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 animate-fade-in">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1A1A2E] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-[#1A1A2E]">{user.name}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${ROLE_BADGE_COLORS[user.role]}`}>{ROLE_LABELS[user.role]}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{user.department || '—'}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}</td>
                    <td className="px-6 py-4">
                      <select 
                        title="Change user status"
                        value={user.status} 
                        onChange={e => updateStatus(user.id, e.target.value)}
                        className={`text-[10px] px-2 py-1 rounded border font-bold uppercase cursor-pointer focus:outline-none ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : user.status === 'SUSPENDED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="PENDING">Pending</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          title="Delete team member"
                          onClick={() => deleteUser(user.id)} 
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Invite Modal */}
        {showInvite && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-display font-bold text-[#1A1A2E] text-lg">Add Team Member</h3>
                <button 
                  title="Close modal"
                  onClick={() => setShowInvite(false)} 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={inviteUser} className="p-6 space-y-4">
                {error && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Jane Smith' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'jane@havenly.co.za' },
                  { label: 'Department', key: 'department', type: 'text', placeholder: 'e.g. Operations, Tech, Marketing' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
                    <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required
                      placeholder={placeholder}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0392B] transition-colors" />
                  </div>
                ))}
                
                <div className="relative">
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Temporary Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={form.password} 
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                      required
                      placeholder="Min 8 characters"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0392B] transition-colors pr-10" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="role-select" className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Role & Portal Access</label>
                  <select 
                    id="role-select"
                    title="Select team member role"
                    value={form.role} 
                    onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0392B]"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setShowInvite(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-[#C0392B] text-white rounded-lg text-sm font-medium hover:bg-[#a93226] transition-colors flex items-center justify-center gap-2">
                    {submitting ? <><Loader2 size={14} className="animate-spin" />Adding...</> : 'Add Member'}
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
