'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function NavigationProgress() {
  const pathname = usePathname()
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  // Navigation completed — finish bar and fade out
  useEffect(() => {
    if (phase === 'idle') return
    setPhase('done')
    const t = setTimeout(() => setPhase('idle'), 400)
    timers.current.push(t)
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Intercept link clicks to detect navigation start
  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest('a[href]')
      if (!anchor) return
      const href = anchor.getAttribute('href') ?? ''
      // Skip external links, hash-only, download, and current page
      if (
        href.startsWith('http') ||
        href.startsWith('#') ||
        anchor.hasAttribute('download') ||
        href === pathname
      ) return
      clearTimers()
      setPhase('loading')
    }
    document.addEventListener('click', onLinkClick)
    return () => document.removeEventListener('click', onLinkClick)
  }, [pathname])

  if (phase === 'idle') return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-primary/20">
      <div
        className={cn(
          'h-full bg-primary transition-all',
          phase === 'loading' && 'animate-nav-progress',
          phase === 'done' && 'w-full duration-200 ease-out opacity-0',
        )}
      />
    </div>
  )
}
