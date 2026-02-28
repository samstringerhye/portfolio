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

    // ── Home page reveals ──
    initHomeReveals()
  })
}

/* ── Image reveal animations for case study pages ── */

function initImageReveals() {
  const body = document.querySelector('.case-study-body')
  if (!body) return

  const imgStart = 'top 70%'
  const imgDuration = 0.9
  const imgEase = 'power3.out'

  const blurUp = { opacity: 0, y: 30 }
  const blurUpTo = { opacity: 1, y: 0, duration: imgDuration, ease: imgEase }

  // ── Standalone images: fade up with blur ──
  body.querySelectorAll<HTMLElement>(':scope > p:has(> img), :scope > .cs-figure').forEach(el => {
    gsap.set(el, blurUp)
    gsap.to(el, {
      ...blurUpTo,
      scrollTrigger: { trigger: el, start: imgStart, toggleActions: 'play none none none' },
      onComplete() { gsap.set(el, { clearProps: 'transform,translate,rotate,scale' }) },
    })
  })

  // ── Image pairs: stagger images up with blur ──
  body.querySelectorAll<HTMLElement>('.image-pair').forEach(pair => {
    const imgs = pair.querySelectorAll<HTMLElement>('.image-pair-cell img')
    if (!imgs.length) return
    gsap.set(imgs, blurUp)
    gsap.to(imgs, {
      ...blurUpTo,
      stagger: 0.15,
      scrollTrigger: { trigger: pair, start: imgStart, toggleActions: 'play none none none' },
      onComplete() { gsap.set(imgs, { clearProps: 'transform,translate,rotate,scale' }) },
    })
  })

  // ── Carousels: slides animate in from right ──
  body.querySelectorAll<HTMLElement>('.carousel').forEach(el => {
    const slides = el.querySelectorAll<HTMLElement>('.carousel-track > img, .carousel-track > .cs-figure')
    if (!slides.length) return
    gsap.set(slides, { opacity: 0, x: 60 })
    gsap.to(slides, {
      opacity: 1, x: 0,
      duration: imgDuration, ease: imgEase,
      stagger: 0.1,
      scrollTrigger: { trigger: el, start: imgStart, toggleActions: 'play none none none' },
    })
  })

  // ── Image grids: fade up with blur ──
  body.querySelectorAll<HTMLElement>('.image-grid').forEach(el => {
    gsap.set(el, blurUp)
    gsap.to(el, {
      ...blurUpTo,
      scrollTrigger: { trigger: el, start: imgStart, toggleActions: 'play none none none' },
      onComplete() { gsap.set(el, { clearProps: 'transform,translate,rotate,scale' }) },
    })
  })

  // ── Zigzag sections: both media and prose fade up with blur ──
  body.querySelectorAll<HTMLElement>('.zigzag-section').forEach(section => {
    const media = section.querySelector<HTMLElement>('.zigzag-media')
    const prose = section.querySelector<HTMLElement>('.zigzag-prose')

    if (media) {
      gsap.set(media, blurUp)
      gsap.to(media, {
        ...blurUpTo,
        scrollTrigger: { trigger: section, start: imgStart, toggleActions: 'play none none none' },
        onComplete() { gsap.set(media, { clearProps: 'transform,translate,rotate,scale' }) },
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

  // ── Text reveals: CMY SplitText on prose-group children ──
  body.querySelectorAll<HTMLElement>('.prose-group').forEach(group => {
    const children = Array.from(group.querySelectorAll<HTMLElement>(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > p, :scope > blockquote'))
    if (!children.length) return

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

  // ── Standalone headings outside prose-group ──
  body.querySelectorAll<HTMLElement>(
    ':scope > h1, :scope > h2, :scope > h3'
  ).forEach(el => {
    createCmyAutoSplitReveal(el, cfg, {
      scrollTrigger: {
        trigger: el,
        start: cfg.scrollStart,
        toggleActions: 'play none none none',
      },
    })
  })
}

/* ── Home page reveal animations ── */

function initHomeReveals() {
  const start = 'top 70%'
  const duration = 0.9
  const ease = 'power3.out'

  // ── Work cards: each card triggers independently ──
  const workCards = document.querySelectorAll<HTMLElement>('[data-work-card]')
  workCards.forEach((card) => {
    gsap.set(card, { opacity: 0, y: 40 })
    gsap.to(card, {
      opacity: 1, y: 0,
      duration, ease,
      scrollTrigger: {
        trigger: card,
        start,
        toggleActions: 'play none none none',
      },
      onComplete() { gsap.set(card, { clearProps: 'transform,translate,rotate,scale' }) },
    })
  })

  // ── Timeline: cards reveal left to right ──
  const timelineCards = document.querySelectorAll<HTMLElement>('.timeline-card')
  if (timelineCards.length) {
    gsap.set(timelineCards, { opacity: 0, y: 20 })
    gsap.to(timelineCards, {
      opacity: 1, y: 0,
      duration: 0.7, ease,
      stagger: 0.1,
      scrollTrigger: {
        trigger: document.querySelector('.experience-timeline'),
        start,
        toggleActions: 'play none none none',
      },
    })
  }

  // ── Timeline year groups ──
  const yearGroups = document.querySelectorAll<HTMLElement>('.timeline-year-group')
  if (yearGroups.length) {
    gsap.set(yearGroups, { opacity: 0 })
    gsap.to(yearGroups, {
      opacity: 1,
      duration: 0.7, ease,
      stagger: 0.1,
      delay: 0.3,
      scrollTrigger: {
        trigger: document.querySelector('.experience-timeline'),
        start,
        toggleActions: 'play none none none',
      },
    })
  }

  // ── Scrolling interests: each row triggers independently ──
  document.querySelectorAll<HTMLElement>('.interests-row').forEach((row) => {
    gsap.set(row, { opacity: 0, y: 30 })
    gsap.to(row, {
      opacity: 1, y: 0,
      duration, ease,
      scrollTrigger: {
        trigger: row,
        start,
        toggleActions: 'play none none none',
      },
    })
  })

  // ── Footer: fade up (use bottom-of-viewport trigger since footer is at page end) ──
  const footer = document.querySelector<HTMLElement>('.footer')
  if (footer) {
    gsap.set(footer, { opacity: 0, y: 20 })
    gsap.to(footer, {
      opacity: 1, y: 0,
      duration: 0.7, ease,
      scrollTrigger: {
        trigger: footer,
        start: 'top 95%',
        toggleActions: 'play none none none',
      },
    })
  }
}
