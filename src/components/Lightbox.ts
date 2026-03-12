import gsap from 'gsap'

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface LightboxState {
  overlay: HTMLElement | null
  closeBtn: HTMLElement | null
  prevBtn: HTMLElement | null
  nextBtn: HTMLElement | null
  counter: HTMLElement | null
  imgContainer: HTMLElement | null
  images: HTMLImageElement[]
  currentIndex: number
  sectionImages: HTMLImageElement[]
  isOpen: boolean
  triggerElement: HTMLElement | null
  removeTrap: (() => void) | null
}

const state: LightboxState = {
  overlay: null,
  closeBtn: null,
  prevBtn: null,
  nextBtn: null,
  counter: null,
  imgContainer: null,
  images: [],
  currentIndex: 0,
  sectionImages: [],
  isOpen: false,
  triggerElement: null,
  removeTrap: null,
}

function createOverlay() {
  if (state.overlay) return

  const overlay = document.createElement('div')
  overlay.className = 'lightbox-overlay'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-label', 'Image lightbox')
  overlay.innerHTML = `
    <div class="lightbox-backdrop"></div>
    <div class="lightbox-content">
      <div class="lightbox-img-container"></div>
    </div>
    <button class="lightbox-close" aria-label="Close lightbox">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    <button class="lightbox-nav lightbox-nav-prev" aria-label="Previous image">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    <button class="lightbox-nav lightbox-nav-next" aria-label="Next image">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 6 15 12 9 18"></polyline>
      </svg>
    </button>
    <div class="lightbox-counter" aria-live="polite"></div>
  `
  document.body.appendChild(overlay)

  state.overlay = overlay
  state.closeBtn = overlay.querySelector('.lightbox-close')
  state.prevBtn = overlay.querySelector('.lightbox-nav-prev')
  state.nextBtn = overlay.querySelector('.lightbox-nav-next')
  state.counter = overlay.querySelector('.lightbox-counter')
  state.imgContainer = overlay.querySelector('.lightbox-img-container')

  // Event listeners
  state.closeBtn?.addEventListener('click', close)
  state.prevBtn?.addEventListener('click', () => navigate(-1))
  state.nextBtn?.addEventListener('click', () => navigate(1))
  overlay.querySelector('.lightbox-backdrop')?.addEventListener('click', close)
}

function installFocusTrap() {
  if (!state.overlay) return

  const focusable = state.overlay.querySelectorAll<HTMLElement>(
    'button:not([style*="display: none"]), [tabindex]:not([tabindex="-1"])'
  )
  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  function handler(e: KeyboardEvent) {
    if (e.key !== 'Tab') return
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first?.focus()
    }
  }

  state.overlay.addEventListener('keydown', handler)
  state.removeTrap = () => state.overlay?.removeEventListener('keydown', handler)
}

function getSectionImages(clickedImg: HTMLImageElement): HTMLImageElement[] {
  const body = document.querySelector('.case-study-body')
  if (!body) return [clickedImg]

  // Phone scroll: return all non-dupe device screens as a navigable set
  const phoneScroll = clickedImg.closest('.hero-phone-scroll')
  if (phoneScroll) {
    return Array.from(phoneScroll.querySelectorAll<HTMLImageElement>(
      '.scroll-phone:not([data-phone-dupe]) .device-screen'
    ))
  }

  const carousel = clickedImg.closest('.carousel')
  if (carousel) return Array.from(carousel.querySelectorAll<HTMLImageElement>('img'))

  const grid = clickedImg.closest('.image-grid')
  if (grid) return Array.from(grid.querySelectorAll<HTMLImageElement>('img'))

  const pair = clickedImg.closest('.image-pair')
  if (pair) return Array.from(pair.querySelectorAll<HTMLImageElement>('img'))

  const zigzag = clickedImg.closest('.zigzag-section')
  if (zigzag) return Array.from(zigzag.querySelectorAll<HTMLImageElement>('img'))

  return [clickedImg]
}

function open(img: HTMLImageElement) {
  createOverlay()
  if (!state.overlay || !state.imgContainer) return

  state.triggerElement = img
  state.sectionImages = getSectionImages(img)
  state.currentIndex = state.sectionImages.indexOf(img)
  if (state.currentIndex < 0) state.currentIndex = 0

  showImage(img)

  state.overlay.classList.add('is-open')
  state.isOpen = true
  document.body.style.overflow = 'hidden'

  if (!prefersReduced()) {
    gsap.fromTo(state.overlay.querySelector('.lightbox-backdrop'),
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    )
    gsap.fromTo(state.imgContainer,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.4, ease: 'power4.out' }
    )
  }

  updateNav()

  // Focus management: move focus into lightbox
  installFocusTrap()
  state.closeBtn?.focus()
}

function showImage(img: HTMLImageElement) {
  if (!state.imgContainer) return
  state.imgContainer.innerHTML = ''

  const phoneParent = img.closest('.scroll-phone')

  if (phoneParent) {
    // Composite phone view: screen + device frame stacked via grid
    const wrapper = document.createElement('div')
    wrapper.className = 'lightbox-phone'

    const screen = document.createElement('img')
    screen.src = img.currentSrc || img.src
    screen.alt = img.alt
    screen.className = 'lightbox-phone-screen'

    const frame = document.createElement('img')
    frame.src = '/images/iphone-frame.png'
    frame.alt = ''
    frame.className = 'lightbox-phone-frame'

    wrapper.appendChild(screen)
    wrapper.appendChild(frame)
    state.imgContainer.appendChild(wrapper)
  } else {
    const clone = document.createElement('img')
    clone.src = img.currentSrc || img.src
    clone.alt = img.alt
    clone.className = 'lightbox-img'
    state.imgContainer.appendChild(clone)
  }
}

function navigate(direction: number) {
  const newIndex = state.currentIndex + direction
  if (newIndex < 0 || newIndex >= state.sectionImages.length) return

  state.currentIndex = newIndex
  const img = state.sectionImages[state.currentIndex]

  if (!prefersReduced() && state.imgContainer) {
    gsap.to(state.imgContainer, {
      opacity: 0, x: direction * -30, duration: 0.15, ease: 'power2.in',
      onComplete() {
        showImage(img)
        gsap.fromTo(state.imgContainer!,
          { opacity: 0, x: direction * 30 },
          { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }
        )
      },
    })
  } else {
    showImage(img)
  }

  updateNav()
}

function updateNav() {
  const total = state.sectionImages.length
  const hasPrev = state.currentIndex > 0
  const hasNext = state.currentIndex < total - 1

  if (state.prevBtn) state.prevBtn.style.display = hasPrev ? '' : 'none'
  if (state.nextBtn) state.nextBtn.style.display = hasNext ? '' : 'none'
  if (state.counter) {
    state.counter.textContent = total > 1 ? `${state.currentIndex + 1} / ${total}` : ''
  }
}

function close() {
  if (!state.overlay || !state.isOpen) return

  state.isOpen = false
  document.body.style.overflow = ''

  // Remove focus trap
  state.removeTrap?.()
  state.removeTrap = null

  const done = () => {
    state.overlay?.classList.remove('is-open')
    if (state.imgContainer) state.imgContainer.innerHTML = ''

    // Restore focus to trigger element
    if (state.triggerElement) {
      state.triggerElement.focus()
      state.triggerElement = null
    }
  }

  if (!prefersReduced()) {
    gsap.to(state.overlay.querySelector('.lightbox-backdrop'), { opacity: 0, duration: 0.2 })
    gsap.to(state.imgContainer, {
      opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in',
      onComplete: done,
    })
  } else {
    done()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!state.isOpen) return
  if (e.key === 'Escape') { close(); e.preventDefault() }
  else if (e.key === 'ArrowRight') { navigate(1); e.preventDefault() }
  else if (e.key === 'ArrowLeft') { navigate(-1); e.preventDefault() }
}

export function initLightbox() {
  const body = document.querySelector('.case-study-body')
  if (!body) return

  // Attach click + keyboard handlers to all case study images
  body.querySelectorAll<HTMLImageElement>('img').forEach(img => {
    if (img.closest('.cs-hero-image')) return // Skip hero image
    if (img.closest('[data-no-lightbox]')) return // Skip elements that opt out
    if (img.closest('.carousel-track')) return // Skip carousel images — handled by drag
    if (img.dataset.lightboxBound === 'true') return
    img.dataset.lightboxBound = 'true'

    img.setAttribute('tabindex', '0')
    img.setAttribute('role', 'button')
    img.setAttribute('aria-label', `View ${img.alt || 'image'} in lightbox`)

    img.addEventListener('click', () => open(img))
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        open(img)
      }
    })
  })

  // Remove previous listener to prevent accumulation across page navigations
  document.removeEventListener('keydown', handleKeydown)
  document.addEventListener('keydown', handleKeydown)
}
