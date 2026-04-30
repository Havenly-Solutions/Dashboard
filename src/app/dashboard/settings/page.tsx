'use client'
import { useState } from 'react'
import Header from '@/components/dashboard/Header'
import { useSession } from 'next-auth/react'
import { ROLE_LABELS, ROLE_BADGE_COLORS, Role } from '@/types'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const user = session?.user as any
  const role = user?.role as Role
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')

  async function save(e: React.FormEvent) {
    e.preventDefault(); 
    setSaving(true)
    try {
      const res = await apiClient('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, phone })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update profile')
      
      await update({
        ...session,
        user: { ...session?.user, name, phone }
      })
      
      toast.success('Profile updated successfully')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Settings" subtitle="Account & Preferences" />
      <main className="flex-1 p-8 max-w-2xl space-y-6">

        <div className="glass-card">
          <h3 className="font-display font-bold text-[#1A1A2E] mb-4">Profile</h3>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label htmlFor="display-name" className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Display Name</label>
              <input 
                id="display-name"
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0392B]" 
              />
            </div>
            <div>
              <label htmlFor="phone-field" className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Phone Number</label>
              <input 
                id="phone-field"
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. +27 12 345 6789"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0392B]" 
              />
            </div>
            <div>
              <label htmlFor="email-field" className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Email</label>
              <input 
                id="email-field"
                value={user?.email || ''} 
                readOnly 
                placeholder="Email address"
                className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Role</label>
              {role && <div className={`inline-flex text-xs px-3 py-1.5 rounded-lg border font-bold uppercase ${ROLE_BADGE_COLORS[role]}`}>{ROLE_LABELS[role]}</div>}
              <p className="text-xs text-gray-400 mt-1.5">Role assignments are managed by the Founder. Contact the founder to request a role change.</p>
            </div>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2.5 bg-[#C0392B] text-white rounded-lg text-sm font-medium hover:bg-[#a93226] transition-colors">
              {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Changes</>}
            </button>
          </form>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-[#1A1A2E] mb-1">Security & Access</h3>
              <p className="text-xs text-gray-400">Manage your password and security preferences</p>
            </div>
            <a href="/dashboard/settings/security" className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              Security Settings
            </a>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="font-display font-bold text-[#1A1A2E] mb-1">System</h3>
          <p className="text-xs text-gray-400 mb-4">Command Centre build info</p>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Version', value: 'v1.0.0' },
              { label: 'Company', value: 'The Black Sheep Tech Corp LTD (PTY)' },
              { label: 'Product', value: 'Havenly Solutions Command Centre' },
              { label: 'Launch Date', value: '24 November 2026' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-400 text-xs uppercase tracking-widest">{label}</span>
                <span className="font-medium text-[#1A1A2E] text-xs">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
