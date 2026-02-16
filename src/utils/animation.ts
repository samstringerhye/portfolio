import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins once, in a single place
gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

/** Chromatic aberration shadow for CMY fringing effect */
export function chromaticShadow(distance: number, opacity: number): string {
  const d1 = distance
  const d2 = d1 * 1.5
  const d3 = d1 * 2
  return `0 ${d1}px rgba(0,255,255,${opacity}), 0 ${d2}px rgba(255,0,255,${opacity}), 0 ${d3}px rgba(255,255,0,${opacity})`
}

export const SHADOW_CLEAR = '0 0px transparent, 0 0px transparent, 0 0px transparent'

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
