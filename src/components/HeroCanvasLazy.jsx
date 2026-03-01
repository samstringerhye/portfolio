import React, { lazy, Suspense, useState, useEffect } from 'react'

const HeroCanvas = lazy(() => import('./HeroCanvas.jsx'))

export default function HeroCanvasLazy() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => setReady(true), { timeout: 3000 })
      return () => cancelIdleCallback(id)
    } else {
      const id = setTimeout(() => setReady(true), 2000)
      return () => clearTimeout(id)
    }
  }, [])

  if (!ready) return null

  return (
    <Suspense fallback={null}>
      <HeroCanvas />
    </Suspense>
  )
}
