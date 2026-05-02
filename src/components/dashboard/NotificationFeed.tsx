'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getSocket } from '@/lib/socket'
import { Bell, X, Check, Info, AlertTriangle, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import TimeAgo from './TimeAgo'

interface Notification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ALERT'
  isRead: boolean
  createdAt: string
}

export default function NotificationFeed() {
  const { data: session }: any = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (session?.accessToken) {
      // Fetch initial notifications
      apiClient('/api/notifications')
        .then(res => res.json())
        .then(data => {
          setNotifications(data.data || [])
          setUnreadCount(data.meta?.unreadCount || 0)
        })
        .catch(err => console.error('Failed to fetch notifications', err))

      const socket = getSocket(session.accessToken)
      if (socket) {
        socket.on('NEW_NOTIFICATION', (notification: Notification) => {
          setNotifications(prev => [notification, ...prev].slice(0, 50))
          setUnreadCount(prev => prev + 1)
          toast.info(notification.title, {
            description: notification.message,
            action: {
              label: 'View',
              onClick: () => setIsOpen(true)
            }
          })
        })

        socket.on('SOS_ALERT', (alert: any) => {
          toast.error('CRITICAL SOS ALERT', {
            description: `New SOS Alert from ${alert.location || 'Unknown Location'}`,
            duration: 10000,
          })
        })

        return () => {
          socket.off('NEW_NOTIFICATION')
          socket.off('SOS_ALERT')
        }
      }
    }
  }, [session])

  const markAsRead = async (id: string) => {
    try {
      await apiClient(`/api/notifications/${id}/read`, { method: 'PATCH' })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification as read', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiClient('/api/notifications/read-all', { method: 'PATCH' })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await apiClient(`/api/notifications/${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Failed to delete notification', err)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full transition-colors group"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#ea4335] text-white text-[10px] font-medium flex items-center justify-center rounded-full ring-2 ring-white px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/0"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-[400px] bg-white border border-[#dadce0] rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.2)] z-50 overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-[#f1f3f4] flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-medium text-[#202124]">Notifications</h3>
                  <p className="text-[11px] text-[#5f6368]">Recent system updates</p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[12px] font-medium text-[#1a73e8] hover:bg-[#e8f0fe] px-2 py-1 rounded"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-[480px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-12 h-12 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-3">
                      <Bell size={24} className="text-[#dadce0]" />
                    </div>
                    <p className="text-[14px] text-[#5f6368]">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`px-5 py-4 border-b border-[#f1f3f4] flex gap-4 transition-colors relative group ${n.isRead ? 'bg-white' : 'bg-[#e8f0fe]/30'}`}
                    >
                      <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${
                        n.type === 'ERROR' || n.type === 'ALERT' ? 'bg-[#fce8e6] text-[#ea4335]' :
                        n.type === 'SUCCESS' ? 'bg-[#e6f4ea] text-[#34a853]' :
                        n.type === 'WARNING' ? 'bg-[#fef7e0] text-[#fbbc04]' :
                        'bg-[#e8f0fe] text-[#1a73e8]'
                      }`}>
                        {n.type === 'SUCCESS' ? <Check size={20} /> :
                         n.type === 'WARNING' ? <AlertTriangle size={20} /> :
                         <Info size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-[14px] truncate ${n.isRead ? 'text-[#5f6368]' : 'text-[#202124] font-medium'}`}>{n.title}</p>
                          <div className="flex items-center gap-2">
                            {!n.isRead && <div className="w-2 h-2 bg-[#1a73e8] rounded-full" />}
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-[#80868b] hover:bg-[#f1f3f4] rounded-full transition-all"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-[13px] text-[#5f6368] line-clamp-2 mt-0.5">{n.message}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Clock size={12} className="text-[#80868b]" />
                          <span className="text-[11px] text-[#80868b]">
                             <TimeAgo date={n.createdAt} />
                          </span>
                        </div>
                      </div>
                      {!n.isRead && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="absolute inset-0 z-10"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="px-5 py-3 border-t border-[#f1f3f4] text-center bg-[#f8f9fa]">
                <p className="text-[11px] text-[#80868b] font-medium uppercase">End of notifications</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>

  )
}
