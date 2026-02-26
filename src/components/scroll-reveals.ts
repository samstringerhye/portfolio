import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { animations } from '../data/tokens'
import {
  createCmyAutoSplitReveal,
  createCmyAutoSplitRevealGrouped,
} from './cmy-animate'

gsap.registerPlugin(ScrollTrigger, SplitText)

const cfg = animations.textReveal
const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let revealCtx: gsap.Context | null = null

export async function initScrollReveals() {
  // Revert all tweens, timelines, ScrollTriggers, and SplitText splits
  // that were created in the previous call's context.
  revealCtx?.revert()
  revealCtx = null

  if (prefersReduced()) {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
      gsap.set(el, { opacity: 1, y: 0, filter: 'none', textShadow: 'none' })
    })
    return
  }

  await document.fonts.ready

  revealCtx = gsap.context(() => {
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
        },
      })

      children.forEach((el, idx) => {
        createCmyAutoSplitRevealGrouped(el, cfg, parentTl, idx * cfg.blockStagger)
      })
    })

    // ── Standalone reveals: [data-reveal] not inside a group ──
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
      if (grouped.has(el)) return

      createCmyAutoSplitReveal(el, cfg, {
        scrollTrigger: {
          trigger: el,
          start: cfg.scrollStart,
          toggleActions: 'play none none none',
        },
      })
    })

    // ── Image reveals: case study visual elements ──
    initImageReveals()
  })
}

/* ── Image reveal animations for case study pages ── */

function initImageReveals() {
  const body = document.querySelector('.case-study-body')
  if (!body) return

  const imgStart = 'top 85%'
  const imgDuration = 0.6
  const imgEase = 'power4.out'

  // ── Standalone images (p > img, not inside image-pair/carousel/zigzag) ──
  body.querySelectorAll<HTMLElement>(':scope > p:has(> img), :scope > .cs-figure').forEach(el => {
    gsap.set(el, { opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)' })
    gsap.to(el, {
      opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)',
      duration: imgDuration, ease: imgEase,
      scrollTrigger: { trigger: el, start: imgStart, toggleActions: 'play none none none' },
    })
  })

  // ── Image pairs: stagger left then right ──
  body.querySelectorAll<HTMLElement>('.image-pair').forEach(pair => {
    const children = pair.querySelectorAll<HTMLElement>(':scope > p')
    if (children.length < 2) return
    gsap.set(children, { opacity: 0, y: 30 })
    gsap.to(children, {
      opacity: 1, y: 0,
      duration: imgDuration, ease: imgEase,
      stagger: 0.15,
      scrollTrigger: { trigger: pair, start: imgStart, toggleActions: 'play none none none' },
    })
  })

  // ── Carousels: fade-up as a unit ──
  body.querySelectorAll<HTMLElement>('.carousel').forEach(el => {
    gsap.set(el, { opacity: 0, y: 30 })
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: imgDuration, ease: imgEase,
      scrollTrigger: { trigger: el, start: imgStart, toggleActions: 'play none none none' },
    })
  })

  // ── Image grids: fade-up as a unit ──
  body.querySelectorAll<HTMLElement>('.image-grid').forEach(el => {
    gsap.set(el, { opacity: 0, y: 30 })
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: imgDuration, ease: imgEase,
      scrollTrigger: { trigger: el, start: imgStart, toggleActions: 'play none none none' },
    })
  })

  // ── Zigzag sections: media reveals with clip-path, prose fades in ──
  body.querySelectorAll<HTMLElement>('.zigzag-section').forEach(section => {
    const media = section.querySelector<HTMLElement>('.zigzag-media')
    const prose = section.querySelector<HTMLElement>('.zigzag-prose')

    if (media) {
      gsap.set(media, { clipPath: 'inset(0 0 100% 0)' })
      gsap.to(media, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 0.8, ease: imgEase,
        scrollTrigger: { trigger: section, start: imgStart, toggleActions: 'play none none none' },
      })
    }

    if (prose) {
      gsap.set(prose, { opacity: 0, y: 20 })
      gsap.to(prose, {
        opacity: 1, y: 0,
        duration: imgDuration, ease: imgEase, delay: 0.2,
        scrollTrigger: { trigger: section, start: imgStart, toggleActions: 'play none none none' },
      })
    }
  })

  // ── Border draw-in: text blocks reveal with clip-path (no conflict with image reveals) ──
  body.querySelectorAll<HTMLElement>(
    ':scope > h1, :scope > h2, :scope > h3, :scope > .prose-group, :scope > blockquote'
  ).forEach(el => {
    gsap.set(el, { clipPath: 'inset(0 100% 0 0)' })
    gsap.to(el, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 0.4, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
    })
  })
}
