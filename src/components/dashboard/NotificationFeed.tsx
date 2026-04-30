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
        className="relative p-2 text-gray-400 hover:text-[#C0392B] hover:bg-red-50 rounded-lg transition-colors group"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#C0392B] text-white text-[9px] font-black flex items-center justify-center rounded-full ring-2 ring-white px-1">
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
              className="fixed inset-0 z-40 bg-black/5"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A2E]">Activity Feed</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Real-time Intelligence</p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-[#C0392B] hover:underline uppercase tracking-wider"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Bell size={20} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">All quiet at the moment.</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">System standby</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`px-5 py-4 border-b border-gray-50 flex gap-4 transition-colors relative group ${n.isRead ? 'opacity-60' : 'bg-blue-50/10'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                        n.type === 'ERROR' || n.type === 'ALERT' ? 'bg-red-50 text-red-600' :
                        n.type === 'SUCCESS' ? 'bg-green-50 text-green-600' :
                        n.type === 'WARNING' ? 'bg-orange-50 text-orange-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {n.type === 'SUCCESS' ? <Check size={16} /> :
                         n.type === 'WARNING' ? <AlertTriangle size={16} /> :
                         <Info size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-xs font-bold truncate ${n.isRead ? 'text-gray-600' : 'text-[#1A1A2E]'}`}>{n.title}</p>
                          <div className="flex items-center gap-2">
                            {!n.isRead && <div className="w-1.5 h-1.5 bg-[#C0392B] rounded-full" />}
                            <button 
                              onClick={() => deleteNotification(n.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">{n.message}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Clock size={10} className="text-gray-300" />
                          <span className="text-[10px] font-medium text-gray-400">
                             <TimeAgo date={n.createdAt} />
                          </span>
                        </div>
                      </div>
                      {!n.isRead && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="absolute inset-0 z-10"
                          title="Mark as read"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="px-5 py-3 border-t border-gray-50 text-center bg-gray-50/30">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">End of feed</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
