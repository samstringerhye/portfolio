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

    // ── Helpers: determine reveal type from data-reveal attribute ──
    const isFade = (el: HTMLElement) => el.dataset.reveal === 'fade'
    const splitMode = (el: HTMLElement): 'auto' | 'lines' =>
      el.dataset.reveal === 'line' ? 'lines' : 'auto'

    function createFadeReveal(el: HTMLElement, vars: gsap.TweenVars = {}) {
      gsap.set(el, { opacity: 0, y: cfg.yOffset, filter: `blur(${cfg.blurStrength}px)` })
      gsap.to(el, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: cfg.duration, ease: cfg.ease,
        ...vars,
      })
    }

    function createFadeRevealGrouped(el: HTMLElement, parentTl: gsap.core.Timeline, offset: number) {
      gsap.set(el, { opacity: 0, y: cfg.yOffset, filter: `blur(${cfg.blurStrength}px)` })
      parentTl.to(el, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: cfg.duration, ease: cfg.ease,
      }, offset)
    }

    // ── Grouped reveals: [data-reveal-group] containers ──
    document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach(group => {
      if (group.closest('[data-no-reveal]')) return
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
        if (isFade(el)) {
          createFadeRevealGrouped(el, parentTl, idx * cfg.blockStagger)
        } else {
          createCmyAutoSplitRevealGrouped(el, cfg, parentTl, idx * cfg.blockStagger, splitMode(el))
        }
      })
    })

    // ── Standalone reveals: [data-reveal] not inside a group or no-reveal zone ──
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
      if (grouped.has(el)) return
      if (el.closest('[data-no-reveal]')) return

      if (isFade(el)) {
        createFadeReveal(el, {
          scrollTrigger: {
            trigger: el,
            start: cfg.scrollStart,
            toggleActions: 'play none none none',
          },
        })
      } else {
        createCmyAutoSplitReveal(el, cfg, {
          scrollTrigger: {
            trigger: el,
            start: cfg.scrollStart,
            toggleActions: 'play none none none',
          },
        }, splitMode(el))
      }
    })

    // ── Image reveals: all pages ──
    initImageReveals()

    // ── Line reveals: site-wide border draw-in ──
    initLineReveals()

    // ── Home page reveals ──
    initHomeReveals()

    // ── Footer: fade up on every page ──
    const footer = document.querySelector<HTMLElement>('.footer')
    if (footer) {
      gsap.set(footer, { opacity: 0, y: 20 })
      gsap.to(footer, {
        opacity: 1, y: 0,
        duration: 0.7, ease: 'power3.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 95%',
          toggleActions: 'play none none none',
        },
      })
    }

    // ── Short-page safety net ──────────────────────────────────
    // On pages that can't scroll enough for every trigger to fire
    // (colophon, 404, about, etc.), detect unreachable triggers and
    // force-play them so nothing stays invisible.
    requestAnimationFrame(() => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      ScrollTrigger.getAll().forEach(st => {
        // If the trigger can never be reached by scrolling, play it now
        if (st.start > maxScroll && !st.progress) {
          st.scroll(st.start)
          st.update()
        }
      })
    })
  })
}

/* ── Image reveal animations — site-wide ── */

function initImageReveals() {
  const main = document.querySelector('main')
  if (!main) return

  const imgStart = 'top 70%'
  const imgDuration = 0.9
  const imgEase = 'power3.out'

  const blurUp = { opacity: 0, y: 30 }
  const blurUpTo = { opacity: 1, y: 0, duration: imgDuration, ease: imgEase }

  // Case study body gets richer image reveals
  const body = document.querySelector('.case-study-body')

  if (body) {
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

  // ── General images: any img in main not inside carousel/already-animated containers ──
  main.querySelectorAll<HTMLElement>('img').forEach(el => {
    // Skip images handled by other animation systems
    if (el.closest('.case-study-body')) return
    if (el.closest('.carousel-track')) return
    if (el.closest('.work-track')) return
    if (el.closest('[data-no-reveal]')) return
    if (el.classList.contains('nav-logo-icon')) return
    gsap.set(el, blurUp)
    gsap.to(el, {
      ...blurUpTo,
      scrollTrigger: { trigger: el, start: imgStart, toggleActions: 'play none none none' },
      onComplete() { gsap.set(el, { clearProps: 'transform,translate,rotate,scale' }) },
    })
  })
}

/* ── Line reveal animations — site-wide border draw-in ── */

function initLineReveals() {
  const start = cfg.scrollStart // same trigger as text reveals (top 70%)
  const lineDuration = 0.8
  const lineEase = 'power3.inOut'
  const borderDuration = 0.6
  const borderEase = 'power2.out'

  // ── Structural lines: pseudo-element scaleX/scaleY draw-in ──

  // Section rules: draw from left to right (skip the first one — handled by entrance animation)
  const allRules = document.querySelectorAll<HTMLElement>('.section-rule')
  allRules.forEach((el, i) => {
    if (i === 0) return // first rule animated by Nav.astro entrance timeline
    gsap.set(el, { scaleX: 0, transformOrigin: 'left' })
    gsap.to(el, {
      scaleX: 1,
      duration: lineDuration,
      ease: lineEase,
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none none',
      },
    })
  })

  // Bio divider: draw in (vertical on desktop, horizontal on mobile)
  document.querySelectorAll<HTMLElement>('.bio-divider').forEach(el => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    gsap.to(el, {
      scaleX: isMobile ? 1 : undefined,
      scaleY: isMobile ? undefined : 1,
      duration: lineDuration,
      ease: lineEase,
      scrollTrigger: {
        trigger: el.closest('.bio-section') || el,
        start,
        toggleActions: 'play none none none',
      },
    })
  })

  // Experience header: bottom line draw-in
  document.querySelectorAll<HTMLElement>('.experience-header').forEach(el => {
    const after = el as HTMLElement
    gsap.to(after, {
      '--experience-header-draw': 1,
      duration: lineDuration,
      ease: lineEase,
      scrollTrigger: {
        trigger: el.closest('.experience-section') || el,
        start,
        toggleActions: 'play none none none',
      },
    } as any)
  })

  // Footer ::before line
  document.querySelectorAll<HTMLElement>('.footer').forEach(el => {
    gsap.fromTo(el, { '--footer-line-draw': 0 } as any, {
      '--footer-line-draw': 1,
      duration: lineDuration,
      ease: lineEase,
      scrollTrigger: {
        trigger: el,
        start: 'top 95%',
        toggleActions: 'play none none none',
      },
    } as any)
  })

  // ── Internal borders: border-color transparent → visible ──

  // Resolve CSS variables to computed colors so GSAP can interpolate
  const rootStyles = getComputedStyle(document.documentElement)
  const ruleColor = rootStyles.getPropertyValue('--color-rule').trim()
  const primaryColor = rootStyles.getPropertyValue('--color-text-primary').trim()

  // Helper: set borders transparent then animate to target color
  function animateBorders(selector: string, targetColor: string, triggerSelector?: string) {
    document.querySelectorAll<HTMLElement>(selector).forEach(el => {
      const trigger = triggerSelector ? el.closest(triggerSelector) || el : el
      gsap.set(el, { borderColor: 'transparent' })
      gsap.to(el, {
        borderColor: targetColor,
        duration: borderDuration,
        ease: borderEase,
        scrollTrigger: {
          trigger,
          start,
          toggleActions: 'play none none none',
        },
      })
    })
  }

  const rule = ruleColor
  const primary = primaryColor

  // Work carousel borders — pseudo-element draw-in via --border-draw
  document.querySelectorAll<HTMLElement>('.work-header, .work-carousel, .work-card, .work-card-label, .work-see-all, .work-carousel-dots').forEach(el => {
    gsap.to(el, {
      '--border-draw': 1,
      duration: lineDuration,
      ease: lineEase,
      scrollTrigger: {
        trigger: el.closest('.work-section') || el,
        start,
        toggleActions: 'play none none none',
      },
    } as any)
  })

  // Timeline borders — all pseudo-element draw-ins via --border-draw custom property
  // (year cells: ::after bottom + ::before right, job cards: ::after bottom, download: ::before left)
  document.querySelectorAll<HTMLElement>('.tl-year, .tl-job, .experience-download').forEach(el => {
    gsap.to(el, {
      '--border-draw': 1,
      duration: lineDuration,
      ease: lineEase,
      scrollTrigger: {
        trigger: el.closest('.experience-section') || el,
        start,
        toggleActions: 'play none none none',
      },
    } as any)
  })

  // Footer internal borders — draw-in via --border-draw, triggered at top 95% (page bottom)
  document.querySelectorAll<HTMLElement>('.footer-bar, .footer-icon-cell').forEach(el => {
    gsap.to(el, {
      '--border-draw': 1,
      duration: lineDuration,
      ease: lineEase,
      scrollTrigger: {
        trigger: el.closest('.footer') || el,
        start: 'top 95%',
        toggleActions: 'play none none none',
      },
    } as any)
  })

  // Resume borders — pseudo-element draw-in via --border-draw
  document.querySelectorAll<HTMLElement>('.resume-summary, .resume-section-heading, .resume-entry').forEach(el => {
    gsap.to(el, {
      '--border-draw': 1,
      duration: lineDuration,
      ease: lineEase,
      scrollTrigger: {
        trigger: el.closest('.resume-page') || el,
        start,
        toggleActions: 'play none none none',
      },
    } as any)
  })

  // Work index borders — pseudo-element draw-in via --border-draw
  document.querySelectorAll<HTMLElement>('.work-row, .work-row-info, .work-row--reversed .work-row-image').forEach(el => {
    gsap.to(el, {
      '--border-draw': 1,
      duration: lineDuration,
      ease: lineEase,
      scrollTrigger: {
        trigger: el.closest('.work-index') || el,
        start,
        toggleActions: 'play none none none',
      },
    } as any)
  })

  // About link borders — pseudo-element draw-in via --border-draw
  document.querySelectorAll<HTMLElement>('.about-link').forEach(el => {
    gsap.to(el, {
      '--border-draw': 1,
      duration: lineDuration,
      ease: lineEase,
      scrollTrigger: {
        trigger: el.closest('.about-page') || el,
        start,
        toggleActions: 'play none none none',
      },
    } as any)
  })

  // Blog post blockquote border — pseudo-element draw-in via --border-draw
  document.querySelectorAll<HTMLElement>('.blog-post-body blockquote').forEach(el => {
    gsap.to(el, {
      '--border-draw': 1,
      duration: lineDuration,
      ease: lineEase,
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none none',
      },
    } as any)
  })

  // Case study container borders — intentional borderColor fade (full-box borders)
  // These elements have 4-sided borders where pseudo-element draw-in is impractical.
  animateBorders('.case-study-body .cs-meta-item + .cs-meta-item', primary)
  animateBorders('.case-study-body .cs-hero-image', rule)
  animateBorders('.case-study-body .cs-hero-meta', rule)
  // Case study nav border — pseudo-element draw-in via --border-draw
  document.querySelectorAll<HTMLElement>('.cs-nav-inner').forEach(el => {
    gsap.to(el, {
      '--border-draw': 1,
      duration: lineDuration,
      ease: lineEase,
      scrollTrigger: {
        trigger: el.closest('.cs-nav') || el,
        start,
        toggleActions: 'play none none none',
      },
    } as any)
  })
  animateBorders('.case-study-body .accent-band', primary)
  animateBorders('.case-study-body .lottie-grid', primary)
  animateBorders('.case-study-body .lottie-grid .lottie-player', primary)
  animateBorders('.case-study-body .image-grid', primary)
  animateBorders('.case-study-body .image-pair', rule)
  animateBorders('.case-study-body .image-pair-cell', rule)
  animateBorders('.case-study-body .carousel', rule)
  animateBorders('.case-study-body .carousel-dots', rule)
  animateBorders('.case-study-body .zigzag-section', rule)
  animateBorders('.case-study-body > .cs-figure', rule)
}

/* ── Home page reveal animations ── */

function initHomeReveals() {
  const start = 'top 70%'
  const duration = 0.9
  const ease = 'power3.out'

  // ── Work cards: handled by WorkCarousel.astro's own entrance animation ──

  // ── Timeline: job cards stagger in ──
  const timelineJobs = document.querySelectorAll<HTMLElement>('.tl-job')
  if (timelineJobs.length) {
    gsap.set(timelineJobs, { opacity: 0, y: 20 })
    gsap.to(timelineJobs, {
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

  // ── Timeline: year cells stagger in ──
  const yearCells = document.querySelectorAll<HTMLElement>('.tl-year')
  if (yearCells.length) {
    gsap.set(yearCells, { opacity: 0 })
    gsap.to(yearCells, {
      opacity: 1,
      duration: 0.7, ease,
      stagger: 0.05,
      delay: 0.2,
      scrollTrigger: {
        trigger: document.querySelector('.experience-timeline'),
        start,
        toggleActions: 'play none none none',
      },
    })
  }

  // ── Timeline: download icon ──
  const downloadIcon = document.querySelector<HTMLElement>('.experience-download')
  if (downloadIcon) {
    gsap.set(downloadIcon, { opacity: 0 })
    gsap.to(downloadIcon, {
      opacity: 1,
      duration: 0.7, ease,
      scrollTrigger: {
        trigger: downloadIcon.closest('.experience-section'),
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

  // ── Dot grid: fade in via CSS custom property ──
  const interestsSection = document.querySelector<HTMLElement>('.interests-section')
  if (interestsSection) {
    gsap.fromTo(interestsSection, { '--dot-grid-reveal': 0 } as any, {
      '--dot-grid-reveal': 1,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: interestsSection,
        start,
        toggleActions: 'play none none none',
      },
    } as any)
  }

}
