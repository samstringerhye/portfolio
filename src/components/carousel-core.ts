import gsap from 'gsap'

export interface CarouselDragConfig {
  carousel: HTMLElement
  track: HTMLElement
  dotsContainer: HTMLElement | null
  dotClassName: string
}

/**
 * Shared carousel logic: dot indicators, pointer drag, keyboard nav,
 * snap animation, and nearest-index search.
 *
 * Consumers own their own sizing + snap-point calculation and call
 * `setSnapPoints()` whenever layout changes.
 */
export function initCarouselDrag(config: CarouselDragConfig) {
  const { carousel, track, dotsContainer, dotClassName } = config
  let currentIndex = 0
  let snapPoints: number[] = []

  // ── Nearest snap index ──

  function nearestIndex(x: number): number {
    let best = 0
    let bestD = Infinity
    snapPoints.forEach((p, i) => {
      const d = Math.abs(x - p)
      if (d < bestD) { bestD = d; best = i }
    })
    return best
  }

  // ── Dot indicators ──

  function renderDots() {
    if (!dotsContainer) return
    dotsContainer.innerHTML = ''
    snapPoints.forEach((_, i) => {
      const dot = document.createElement('span')
      dot.className = dotClassName + (i === 0 ? ' is-active' : '')
      dot.setAttribute('aria-hidden', 'true')
      dotsContainer.appendChild(dot)
    })
  }

  function updateDots(index: number) {
    if (!dotsContainer) return
    dotsContainer.querySelectorAll(`.${dotClassName}`).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index)
    })
  }

  // ── Snap animation ──

  function animateTo(index: number) {
    const i = Math.max(0, Math.min(index, snapPoints.length - 1))
    currentIndex = i
    updateDots(i)
    gsap.to(track, {
      x: snapPoints[i],
      duration: 0.5,
      ease: 'power3.out',
      overwrite: true,
    })
  }

  // ── Pointer drag ──

  let didDrag = false
  let dragging = false
  let startX = 0
  let startY = 0
  let trackStartX = 0
  let lastX = 0
  let lastTime = 0
  let velocityX = 0
  let pointerId = -1

  // Suppress click after drag
  track.addEventListener('click', (e) => {
    if (didDrag) { e.stopPropagation(); e.preventDefault(); didDrag = false }
  }, true)

  track.addEventListener('pointerdown', (e: PointerEvent) => {
    if (e.button !== 0) return
    dragging = true
    didDrag = false
    pointerId = e.pointerId
    startX = e.clientX
    startY = e.clientY
    lastX = e.clientX
    lastTime = Date.now()
    velocityX = 0
    trackStartX = (gsap.getProperty(track, 'x') as number) || 0
    gsap.killTweensOf(track)
  })

  track.addEventListener('pointermove', (e: PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY

    if (!didDrag) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < 5 && absDy < 5) return
      if (absDy > absDx * 1.2) {
        dragging = false
        return
      }
      didDrag = true
      track.setPointerCapture(pointerId)
      track.classList.add('is-dragging')
    }

    e.preventDefault()

    const now = Date.now()
    const dt = now - lastTime
    if (dt > 0) {
      velocityX = (e.clientX - lastX) / dt * 1000
      lastX = e.clientX
      lastTime = now
    }

    let newX = trackStartX + dx
    const minX = snapPoints[snapPoints.length - 1]
    const maxX = snapPoints[0]
    if (newX > maxX) newX = maxX + (newX - maxX) * 0.3
    else if (newX < minX) newX = minX + (newX - minX) * 0.3
    gsap.set(track, { x: newX })
    updateDots(nearestIndex(newX))
  })

  function onPointerEnd() {
    if (!dragging) return
    dragging = false
    track.classList.remove('is-dragging')

    if (!didDrag) return

    const trackX = gsap.getProperty(track, 'x') as number
    let targetIndex = nearestIndex(trackX)

    if (Math.abs(velocityX) > 300) {
      targetIndex = velocityX > 0
        ? Math.max(0, currentIndex - 1)
        : Math.min(snapPoints.length - 1, currentIndex + 1)
    }

    animateTo(targetIndex)
  }

  track.addEventListener('pointerup', onPointerEnd)
  track.addEventListener('pointercancel', onPointerEnd)
  track.addEventListener('dragstart', (e) => e.preventDefault())

  // ── Keyboard ──

  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { animateTo(currentIndex + 1); e.preventDefault() }
    else if (e.key === 'ArrowLeft') { animateTo(currentIndex - 1); e.preventDefault() }
  })

  // ── Public API ──

  return {
    get currentIndex() { return currentIndex },
    set currentIndex(i: number) { currentIndex = i },
    get snapPoints() { return snapPoints },
    setSnapPoints(pts: number[]) {
      snapPoints = pts
      renderDots()
      updateDots(Math.min(currentIndex, pts.length - 1))
    },
    animateTo,
    updateDots,
    nearestIndex,
  }
}
