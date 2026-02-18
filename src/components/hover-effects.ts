import gsap from 'gsap'

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function initHoverEffects() {
  if (prefersReduced()) return

  // Caustic cards — tilt + CMY box-shadow
  document.querySelectorAll<HTMLElement>('[data-hover="caustic-card"]').forEach(initCausticCard)

  // Spectral links — shimmer underline
  document.querySelectorAll<HTMLElement>('[data-hover="spectral-link"]').forEach(initSpectralLink)

  // Spectral buttons — shimmer + glow
  document.querySelectorAll<HTMLElement>('[data-hover="spectral-button"]').forEach(initSpectralButton)
}

function initCausticCard(el: HTMLElement) {
  const quickRx = gsap.quickTo(el, 'rotationX', { ease: 'power3', duration: 0.5 })
  const quickRy = gsap.quickTo(el, 'rotationY', { ease: 'power3', duration: 0.5 })

  gsap.set(el, { transformStyle: 'preserve-3d' })

  if (el.parentElement) {
    gsap.set(el.parentElement, { perspective: 800 })
  }

  el.addEventListener('mousemove', (e: MouseEvent) => {
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    quickRx(gsap.utils.interpolate(6, -6, y))
    quickRy(gsap.utils.interpolate(-6, 6, x))
  })

  el.addEventListener('mouseenter', () => {
    const style = getComputedStyle(document.documentElement)
    const cyan = style.getPropertyValue('--glow-cyan').trim() || 'rgba(0,255,255,0.5)'
    const magenta = style.getPropertyValue('--glow-magenta').trim() || 'rgba(255,0,255,0.35)'
    const yellow = style.getPropertyValue('--glow-yellow').trim() || 'rgba(255,255,0,0.25)'
    el.style.boxShadow = `0 4px 24px -4px ${cyan}, 0 8px 48px -8px ${magenta}, 0 12px 64px -12px ${yellow}`
  })

  el.addEventListener('mouseleave', () => {
    quickRx(0)
    quickRy(0)
    el.style.boxShadow = ''
  })
}

function initSpectralLink(el: HTMLElement) {
  if (!el.querySelector('.spectral-underline')) {
    el.style.position = 'relative'
    el.style.display = 'inline-block'

    const line = document.createElement('span')
    line.className = 'spectral-underline'
    line.style.cssText = `
      position: absolute; bottom: 0; left: 0; right: 0;
      height: 1px; background: currentColor; opacity: 0.3;
      border-radius: 1px; transition: height 0.3s ease, opacity 0.3s ease;
    `
    el.appendChild(line)

    el.addEventListener('mouseenter', () => {
      line.style.height = '2px'
      line.style.opacity = '0.8'
    })

    el.addEventListener('mouseleave', () => {
      line.style.height = '1px'
      line.style.opacity = '0.3'
    })
  }
}

function initSpectralButton(el: HTMLElement) {
  el.style.transition = 'box-shadow 0.3s ease, transform 0.2s ease'

  el.addEventListener('mouseenter', () => {
    const style = getComputedStyle(document.documentElement)
    const cyan = style.getPropertyValue('--glow-cyan').trim() || 'rgba(0,255,255,0.5)'
    const magenta = style.getPropertyValue('--glow-magenta').trim() || 'rgba(255,0,255,0.35)'
    const yellow = style.getPropertyValue('--glow-yellow').trim() || 'rgba(255,255,0,0.25)'
    el.style.boxShadow = `0 2px 16px -2px ${cyan}, 0 4px 28px -4px ${magenta}, 0 8px 40px -8px ${yellow}`
    el.style.transform = 'translateY(-1px)'
  })

  el.addEventListener('mouseleave', () => {
    el.style.boxShadow = ''
    el.style.transform = ''
  })
}
