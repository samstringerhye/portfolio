import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import animConfig from '../content/animations.json'

gsap.registerPlugin(ScrollTrigger)

const cfg = animConfig.scrollReveal
const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const D1 = cfg.aberration, D2 = D1 * 1.5, D3 = D1 * 2
const SHADOW_FROM = `0 ${D1}px rgba(0,255,255,${cfg.aberrationOpacity}), 0 ${D2}px rgba(255,0,255,${cfg.aberrationOpacity}), 0 ${D3}px rgba(255,255,0,${cfg.aberrationOpacity})`
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
      opacity: 0, y: cfg.y, filter: `blur(${cfg.blur}px)`, textShadow: SHADOW_FROM,
    })

    gsap.to(el, {
      opacity: 1, y: 0, filter: 'blur(0px)',
      textShadow: SHADOW_TO,
      duration: cfg.duration, ease: cfg.ease,
      scrollTrigger: {
        trigger: el,
        start: cfg.triggerStart,
        toggleActions: 'play none none none',
        _isReveal: true,
      } as any,
    })
  })
}
