'use client'
import { useState, useEffect } from 'react'

export function useCountdown(targetDate: string | number) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
    isExpired: false
  })

  useEffect(() => {
    const target = typeof targetDate === 'string' ? new Date(targetDate).getTime() : targetDate

    const calculate = () => {
      const now = Date.now()
      const diff = target - now

      if (diff <= 0) {
        return { days: 0, hours: 0, mins: 0, secs: 0, isExpired: true }
      }

      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
        isExpired: false
      }
    }

    // Initial calculation
    setTimeLeft(calculate())

    // Update every second
    const timer = setInterval(() => {
      const result = calculate()
      setTimeLeft(result)
      if (result.isExpired) clearInterval(timer)
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return timeLeft
}
