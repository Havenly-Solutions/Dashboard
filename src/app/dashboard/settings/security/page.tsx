'use client'

import { useState } from 'react'
import Header from '@/components/dashboard/Header'
import { Save, Loader2, Lock } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SecuritySettingsPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const user = session?.user as any

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters long')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password')
      }

      // Password changed successfully. We need to sign out to force a fresh login with the new credentials.
      await signOut({ redirect: false })
      router.push('/login')
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 h-full overflow-y-auto">
      <Header title="Security" subtitle="Password & Access" />
      <main className="flex-1 p-8 max-w-2xl space-y-6">
        {user?.mustChangePassword && (
          <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Action Required: Set Production Password</p>
              <p className="text-amber-700/80">You are currently using a temporary password or haven&apos;t set up your final production password. Please change it now to gain full access to the dashboard.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-fade-in">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-display font-bold text-[#1A1A2E] mb-4">Change Password</h3>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Current Password</label>
              <input 
                type="password"
                required
                value={currentPassword} 
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0392B]" 
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">New Password</label>
              <input 
                type="password"
                required
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0392B]" 
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Confirm New Password</label>
              <input 
                type="password"
                required
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0392B]" 
                placeholder="Confirm new password"
              />
              <p className="mt-2 text-[10px] text-gray-400 leading-tight">
                Requirements: Min 12 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character (!@#$%^&*).
              </p>
            </div>
            
            <div className="pt-2">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2.5 bg-[#C0392B] text-white rounded-lg text-sm font-medium hover:bg-[#a93226] transition-colors">
                {saving ? <><Loader2 size={14} className="animate-spin" />Updating...</> : <><Save size={14} />Update Password</>}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
