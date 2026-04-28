'use client'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

/**
 * A high-fidelity animated counter with smooth easing and tabular numbers.
 * Resolves dashboard "lagging" feel by providing fluid state transitions.
 */
export default function AnimatedCounter({ value, duration = 1200, className }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValue = useRef(value)
  const startTime = useRef<number | null>(null)
  const requestRef = useRef<number>()

  useEffect(() => {
    const startVal = previousValue.current
    const endVal = value
    
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)

      // Quartic Out Easing for premium feel: 1 - Math.pow(1 - progress, 4)
      const easedProgress = 1 - Math.pow(1 - progress, 4)
      const current = Math.floor(easedProgress * (endVal - startVal) + startVal)
      
      setDisplayValue(current)

      if (progress < 1) {
        requestRef.current = window.requestAnimationFrame(animate)
      } else {
        previousValue.current = endVal
        startTime.current = null
      }
    }

    requestRef.current = window.requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) window.cancelAnimationFrame(requestRef.current)
      startTime.current = null
    }
  }, [value, duration])

  return (
    <span className={cn("tabular-nums tracking-tight font-display font-black", className)}>
      {displayValue.toLocaleString()}
    </span>
  )
}
