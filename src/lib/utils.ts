import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Role, ROLE_PERMISSIONS } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasAccess(role: Role, path: string): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (permissions.includes('*')) return true
  return permissions.some(p => path === p || path.startsWith(p + '/'))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-ZA', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-ZA', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function generateHash(): string {
  const chars = '0123456789ABCDEF'
  let hash = '0x'
  for (let i = 0; i < 4; i++) hash += chars[Math.floor(Math.random() * 16)]
  hash += '...'
  for (let i = 0; i < 4; i++) hash += chars[Math.floor(Math.random() * 16)]
  return hash
}

export function truncateHash(hash: string): string {
  if (hash.length <= 12) return hash
  return hash.slice(0, 6) + '...' + hash.slice(-4)
}
