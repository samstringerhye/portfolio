import { gsap, ScrollTrigger, prefersReducedMotion, chromaticShadow, SHADOW_CLEAR } from '../utils/animation'

const SHADOW_FROM = chromaticShadow(12, 0.45)

export function initScrollReveals() {
  const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
  if (!elements.length) return

  // Kill existing triggers to avoid duplicates on View Transition nav
  ScrollTrigger.getAll().forEach(st => {
    if ((st.vars as any)?._isReveal) st.kill()
  })

  elements.forEach(el => {
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0, filter: 'none', textShadow: 'none' })
      return
    }

    gsap.set(el, {
      opacity: 0, y: 30, filter: 'blur(6px)', textShadow: SHADOW_FROM,
    })

    gsap.to(el, {
      opacity: 1, y: 0, filter: 'blur(0px)',
      textShadow: SHADOW_CLEAR,
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
