'use client'
import { useState } from 'react'
import Header from '@/components/dashboard/Header'
import { Save, Loader2, Lock, Eye, EyeOff } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export default function SecuritySettingsPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const user = session?.user as any

  const [saving, setSaving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 12) {
      toast.error('Password must be at least 12 characters long')
      return
    }

    setSaving(true)

    try {
      const res = await apiClient('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update password')
      }

      toast.success('Password updated successfully')
      await update({ mustChangePassword: false })
      router.push('/dashboard')
      
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred')
    } finally {
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

        <div className="glass-card  p-6">
          <h3 className="font-display font-bold text-[#1A1A2E] mb-4">Change Password</h3>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Current Password</label>
              <div className="relative">
                <input 
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0392B] pr-10" 
                  placeholder="Enter current password"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">New Password</label>
              <div className="relative">
                <input 
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0392B] pr-10" 
                  placeholder="Enter new password"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input 
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0392B] pr-10" 
                  placeholder="Confirm new password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
