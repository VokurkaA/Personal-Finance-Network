import { useEffect, useState, type ReactNode } from 'react'

interface DeferredProps {
  children: ReactNode
  fallback?: ReactNode
  delay?: number
}

let activeDeferredCount = 0

/**
 * Defers rendering of its children until after a delay (default 300ms).
 * Useful for heavy components (like Nivo charts) that should only render
 * after modal or page transitions are complete.
 * Uses a combination of delay and stagger to avoid blocking the main thread.
 */
export function Deferred({ children, fallback = null, delay = 300 }: DeferredProps) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Increment active count to stagger multiple components
    const staggerIndex = activeDeferredCount++
    const staggerDelay = staggerIndex * 60 // 60ms stagger per component

    const timer = setTimeout(() => {
      // Use requestIdleCallback if available to render when the browser is free
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          setShouldRender(true)
          activeDeferredCount = Math.max(0, activeDeferredCount - 1)
        })
      } else {
        setShouldRender(true)
        activeDeferredCount = Math.max(0, activeDeferredCount - 1)
      }
    }, delay + staggerDelay)

    return () => {
      clearTimeout(timer)
      activeDeferredCount = Math.max(0, activeDeferredCount - 1)
    }
  }, [delay])

  return shouldRender ? <>{children}</> : <>{fallback}</>
}
