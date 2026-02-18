import gsap from 'gsap'
import tokens from '../data/tokens.json'

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const hover = tokens.hover

export function initHoverEffects() {
  if (prefersReduced()) return

  // Caustic cards — tilt + CMY box-shadow
  document.querySelectorAll<HTMLElement>('[data-hover="caustic-card"]').forEach(initCausticCard)

  // Spectral links — shimmer underline
  document.querySelectorAll<HTMLElement>('[data-hover="spectral-link"]').forEach(initSpectralLink)

  // Spectral buttons — shimmer + glow
  document.querySelectorAll<HTMLElement>('[data-hover="spectral-button"]').forEach(initSpectralButton)
}

function getGlowColors() {
  const style = getComputedStyle(document.documentElement)
  return {
    cyan: style.getPropertyValue('--glow-cyan').trim(),
    magenta: style.getPropertyValue('--glow-magenta').trim(),
    yellow: style.getPropertyValue('--glow-yellow').trim(),
  }
}

function initCausticCard(el: HTMLElement) {
  const quickRx = gsap.quickTo(el, 'rotationX', { ease: 'power3', duration: 0.5 })
  const quickRy = gsap.quickTo(el, 'rotationY', { ease: 'power3', duration: 0.5 })

  gsap.set(el, { transformStyle: 'preserve-3d' })

  if (el.parentElement) {
    gsap.set(el.parentElement, { perspective: hover.perspective })
  }

  el.addEventListener('mousemove', (e: MouseEvent) => {
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    quickRx(gsap.utils.interpolate(hover.tiltDeg, -hover.tiltDeg, y))
    quickRy(gsap.utils.interpolate(-hover.tiltDeg, hover.tiltDeg, x))
  })

  function activate() {
    const { cyan, magenta, yellow } = getGlowColors()
    el.style.boxShadow = `0 4px 24px -4px ${cyan}, 0 8px 48px -8px ${magenta}, 0 12px 64px -12px ${yellow}`
  }

  function deactivate() {
    quickRx(0)
    quickRy(0)
    el.style.boxShadow = ''
  }

  el.addEventListener('mouseenter', activate)
  el.addEventListener('mouseleave', deactivate)
  el.addEventListener('focusin', activate)
  el.addEventListener('focusout', deactivate)
}

function initSpectralLink(el: HTMLElement) {
  if (!el.querySelector('.spectral-underline')) {
    el.style.position = 'relative'
    el.style.display = 'inline-block'

    const line = document.createElement('span')
    line.className = 'spectral-underline'
    line.style.cssText = `
      position: absolute; bottom: 0; left: 0; right: 0;
      height: ${hover.underlineHeight}; background: currentColor; opacity: ${hover.underlineOpacity};
      border-radius: var(--radius-sm); transition: height var(--transition-base) ease, opacity var(--transition-base) ease;
    `
    el.appendChild(line)

    function activate() {
      line.style.height = hover.underlineHoverHeight
      line.style.opacity = String(hover.underlineHoverOpacity)
    }

    function deactivate() {
      line.style.height = hover.underlineHeight
      line.style.opacity = String(hover.underlineOpacity)
    }

    el.addEventListener('mouseenter', activate)
    el.addEventListener('mouseleave', deactivate)
    el.addEventListener('focusin', activate)
    el.addEventListener('focusout', deactivate)
  }
}

function initSpectralButton(el: HTMLElement) {
  el.style.transition = `box-shadow var(--transition-base) ease, transform var(--transition-fast) ease`

  function activate() {
    const { cyan, magenta, yellow } = getGlowColors()
    el.style.boxShadow = `0 2px 16px -2px ${cyan}, 0 4px 28px -4px ${magenta}, 0 8px 40px -8px ${yellow}`
    el.style.transform = `translateY(${hover.lift})`
  }

  function deactivate() {
    el.style.boxShadow = ''
    el.style.transform = ''
  }

  el.addEventListener('mouseenter', activate)
  el.addEventListener('mouseleave', deactivate)
  el.addEventListener('focusin', activate)
  el.addEventListener('focusout', deactivate)
}
