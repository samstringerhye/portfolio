import gsap from 'gsap'
import { hover } from '../data/tokens'

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function initHoverEffects() {
  if (prefersReduced()) return

  // Spectral links — shimmer underline
  document.querySelectorAll<HTMLElement>('[data-hover="spectral-link"]').forEach(initSpectralLink)
}

function initSpectralLink(el: HTMLElement) {
  if (el.dataset.hoverSpectralLinkBound === 'true') return
  el.dataset.hoverSpectralLinkBound = 'true'

  if (!el.querySelector('.spectral-underline')) {
    el.style.position = 'relative'
    el.style.display = 'inline-block'

    const line = document.createElement('span')
    line.className = 'spectral-underline'
    line.style.cssText = `
      position: absolute; bottom: 0; left: 0; right: 0;
      height: ${hover.underlineHeight}; background: currentColor; opacity: ${hover.underlineOpacity};
      border-radius: var(--radius-1x); transition: height var(--transition-1x) ease, opacity var(--transition-1x) ease;
    `
    el.appendChild(line)
  }

  const line = el.querySelector<HTMLElement>('.spectral-underline')
  if (!line) return

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
