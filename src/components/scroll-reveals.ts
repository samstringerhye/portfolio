import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { animations } from '../data/tokens'
import {
  createCmyAutoSplitReveal,
  createCmyAutoSplitRevealGrouped,
  type CmyAutoSplitHandle,
} from './cmy-animate'

gsap.registerPlugin(ScrollTrigger, SplitText)

const cfg = animations.textReveal
const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let revealHandles: CmyAutoSplitHandle[] = []

export async function initScrollReveals() {
  // Kill existing reveal triggers and revert splits
  ScrollTrigger.getAll().forEach(st => {
    if ((st.vars as any)?._isReveal) st.kill()
  })
  revealHandles.forEach(h => h.kill())
  revealHandles = []

  if (prefersReduced()) {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
      gsap.set(el, { opacity: 1, y: 0, filter: 'none', textShadow: 'none' })
    })
    return
  }

  await document.fonts.ready

  // Track grouped elements so we don't double-animate them
  const grouped = new Set<HTMLElement>()

  // ── Grouped reveals: [data-reveal-group] containers ──
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach(group => {
    const children = Array.from(group.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!children.length) return

    children.forEach(el => grouped.add(el))

    const parentTl = gsap.timeline({
      scrollTrigger: {
        trigger: group,
        start: cfg.scrollStart,
        toggleActions: 'play none none none',
        _isReveal: true,
      } as any,
    })

    children.forEach((el, idx) => {
      revealHandles.push(
        createCmyAutoSplitRevealGrouped(el, cfg, parentTl, idx * cfg.blockStagger),
      )
    })
  })

  // ── Standalone reveals: [data-reveal] not inside a group ──
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
    if (grouped.has(el)) return

    revealHandles.push(
      createCmyAutoSplitReveal(el, cfg, {
        scrollTrigger: {
          trigger: el,
          start: cfg.scrollStart,
          toggleActions: 'play none none none',
          _isReveal: true,
        } as any,
      }),
    )
  })
}
