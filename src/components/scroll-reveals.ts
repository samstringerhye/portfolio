import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const D1 = 12, D2 = D1 * 1.5, D3 = D1 * 2, OP = 0.45
const SHADOW_FROM = `0 ${D1}px rgba(0,255,255,${OP}), 0 ${D2}px rgba(255,0,255,${OP}), 0 ${D3}px rgba(255,255,0,${OP})`
const SHADOW_TO = '0 0px transparent, 0 0px transparent, 0 0px transparent'

export function initScrollReveals() {
  const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
  if (!elements.length) return

  // Kill existing triggers to avoid duplicates on View Transition nav
  ScrollTrigger.getAll().forEach(st => {
    if ((st.vars as any)?._isReveal) st.kill()
  })

  elements.forEach(el => {
    if (prefersReduced()) {
      gsap.set(el, { opacity: 1, y: 0, filter: 'none', textShadow: 'none' })
      return
    }

    gsap.set(el, {
      opacity: 0, y: 30, filter: 'blur(6px)', textShadow: SHADOW_FROM,
    })

    gsap.to(el, {
      opacity: 1, y: 0, filter: 'blur(0px)',
      textShadow: SHADOW_TO,
      duration: 0.9, ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 65%',
        toggleActions: 'play none none none',
        _isReveal: true,
      } as any,
    })
  })
}

// Auto-init
initScrollReveals()
