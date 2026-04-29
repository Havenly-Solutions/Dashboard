'use client'

import { useState } from 'react'
import { Save, Loader2, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ForcePasswordChangeModal() {
  const { data: session, update } = useSession()
  const user = session?.user as any
  const router = useRouter()

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
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password')
      }

      // Update session to remove the force-change flag
      await update({ mustChangePassword: false })
      
      // Success - the modal will disappear because mustChangePassword is now false
      router.refresh()
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-[#C0392B] p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-display">Security Required</h2>
          <p className="text-white/80 text-sm mt-1">Set your final production password</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-[11px] leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p>You are using a temporary or founder password. You must set a unique 12+ character password before you can continue.</p>
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Current Password</label>
            <div className="relative">
              <input 
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword} 
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0392B] pr-10" 
                placeholder="••••••••••••"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">New Password</label>
            <div className="relative">
              <input 
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0392B] pr-10" 
                placeholder="New secure password"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Confirm New Password</label>
            <div className="relative">
              <input 
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0392B] pr-10" 
                placeholder="Confirm new password"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving} 
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#1A1A2E] text-white rounded-lg text-sm font-bold hover:bg-[#2a2a4a] transition-all disabled:opacity-50"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" />Securing Account...</> : <><Save size={16} />Update & Continue</>}
          </button>
        </form>
      </div>
    </div>
  )
}
