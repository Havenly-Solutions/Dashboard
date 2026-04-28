'use client'
import { useState, useEffect } from 'react'
import { formatTimeAgo } from '@/lib/utils'

interface TimeAgoProps {
  date: string | Date
  className?: string
}

export default function TimeAgo({ date, className }: TimeAgoProps) {
  const [display, setDisplay] = useState(formatTimeAgo(date))

  useEffect(() => {
    // Update every minute to keep it fresh without "lagging"
    const timer = setInterval(() => {
      setDisplay(formatTimeAgo(date))
    }, 60000)

    // Also update immediately in case the initial render was stale
    setDisplay(formatTimeAgo(date))

    return () => clearInterval(timer)
  }, [date])

  return <span className={className}>{display}</span>
}
