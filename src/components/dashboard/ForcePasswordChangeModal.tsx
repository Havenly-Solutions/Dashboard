'use client'

import { useState } from 'react'
import { Save, Loader2, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { apiClient } from '@/lib/apiClientClient'

export default function ForcePasswordChangeModal() {
  const { data: session } = useSession()
  const user = session?.user as any

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (!user?.mustChangePassword) return null

  async function handleSubmit(e: React.FormEvent) {
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
      await apiClient('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })

      // Sign out and redirect to login
      await signOut({ callbackUrl: '/', redirect: true })
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#202124]/30 p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 pb-4 text-center">
          <div className="w-12 h-12 bg-[#e8f0fe] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-[#1a73e8]" />
          </div>
          <h2 className="text-[20px] font-normal text-[#202124]">Account Security</h2>
          <p className="text-[#5f6368] text-[14px] mt-1">Please set your permanent password</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
          <div className="p-4 bg-[#fef7e0] border border-[#feefc3] rounded-[4px] text-[#202124] text-[13px] leading-relaxed flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#fbbc04] shrink-0" />
            <p>To secure your account, you must update your temporary password to a unique 12+ character phrase.</p>
          </div>

          {error && (
            <div className="px-3 py-2 bg-[#fce8e6] border border-[#fad2cf] rounded-[4px] text-[#ea4335] text-[13px] font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[12px] text-[#5f6368] font-medium mb-1.5">Current Password</label>
            <div className="relative">
              <input 
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword} 
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full border border-[#dadce0] rounded-[4px] px-3 py-2 text-[14px] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]/20 pr-10" 
                placeholder="Current password"
              />
              <button 
                type="button" 
                onClick={() => setShowCurrent(!showCurrent)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f6368]"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[12px] text-[#5f6368] font-medium mb-1.5">New Password</label>
            <div className="relative">
              <input 
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                className="w-full border border-[#dadce0] rounded-[4px] px-3 py-2 text-[14px] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]/20 pr-10" 
                placeholder="New password"
              />
              <button 
                type="button" 
                onClick={() => setShowNew(!showNew)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f6368]"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[12px] text-[#5f6368] font-medium mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input 
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full border border-[#dadce0] rounded-[4px] px-3 py-2 text-[14px] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]/20 pr-10" 
                placeholder="Confirm password"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirm(!showConfirm)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f6368]"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={saving} 
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a73e8] text-white rounded-[4px] text-[14px] font-medium hover:bg-[#1557b0] transition-all disabled:opacity-50"
            >
              {saving ? <><Loader2 size={18} className="animate-spin" />Processing...</> : <><Save size={18} />Update Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>

  )
}
