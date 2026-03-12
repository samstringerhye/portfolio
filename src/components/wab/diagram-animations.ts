/**
 * Shared scroll-triggered entrance animations for all WAB diagram components.
 * Imported and called once from the case study layout or MDX.
 * Each diagram gets a staggered fade-up on its child elements.
 */

export async function initDiagramAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const { default: gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  // Helper: animate a set of elements with stagger
  function staggerIn(
    selector: string,
    triggerSelector: string,
    config: { y?: number; x?: number; delay?: number; stagger?: number; duration?: number } = {}
  ) {
    const { y = 25, x = 0, delay = 0, stagger = 0.08, duration = 0.5 } = config
    gsap.utils.toArray<HTMLElement>(selector).forEach((el, i) => {
      if (el.dataset.animInit) return
      el.dataset.animInit = 'true'
      gsap.from(el, {
        y,
        x,
        opacity: 0,
        duration,
        delay: delay + i * stagger,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: document.querySelector(triggerSelector) || el.parentElement,
          start: 'top 82%',
        },
      })
    })
  }

  // Token Architecture: tiers + arrows
  staggerIn('.token-arch .tier', '.token-arch', { stagger: 0.15, duration: 0.6 })
  gsap.utils.toArray<HTMLElement>('.token-arch .arrow').forEach((arrow) => {
    if (arrow.dataset.animInit) return
    arrow.dataset.animInit = 'true'
    gsap.from(arrow, {
      scale: 0,
      opacity: 0,
      duration: 0.4,
      ease: 'back.out(2)',
      scrollTrigger: { trigger: arrow, start: 'top 85%' },
    })
  })

  // Color States: state preview cards
  staggerIn('.color-states .states-grid > div', '.color-states .states-grid', { stagger: 0.06 })

  // Typography Scale: specimens
  staggerIn('.type-scale .scale-table > div', '.type-scale .scale-table', { x: -20, y: 0, stagger: 0.08 })

  // Spacing System: spacing rows + radius items
  staggerIn('.spacing-system .spacing-row', '.spacing-system .spacing-rows', { y: 15, stagger: 0.05, duration: 0.4 })
  staggerIn('.spacing-system .radius-grid > div', '.spacing-system .radius-grid', { y: 15, stagger: 0.06, duration: 0.4 })

  // Motion System: duration items + easing card
  staggerIn('.motion-system .duration-item', '.motion-system .duration-bars', { stagger: 0.12 })
  staggerIn('.motion-system .easing-card', '.motion-system .motion-easing', { duration: 0.6 })

  // Elevation System: cards stagger in with increasing offset
  gsap.utils.toArray<HTMLElement>('.elevation-system .elev-card').forEach((card, i) => {
    if (card.dataset.animInit) return
    card.dataset.animInit = 'true'
    gsap.from(card, {
      y: 20 + i * 5,
      opacity: 0,
      duration: 0.6,
      delay: i * 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: card.parentElement, start: 'top 80%' },
    })
  })

  // Component Library: cards + footer stats
  staggerIn('.comp-lib .lib-card', '.comp-lib .lib-grid', { stagger: 0.1 })
  staggerIn('.comp-lib .lib-footer-stat', '.comp-lib .lib-footer', { y: 15, delay: 0.3, stagger: 0.1, duration: 0.4 })
}
