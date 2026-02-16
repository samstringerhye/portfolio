import { useRef, useEffect, useState, useCallback } from 'react'
import { Draggable } from 'gsap/Draggable'
import { gsap, ScrollTrigger } from './animation'

gsap.registerPlugin(Draggable)

const CARD_GAP = 24
const WHEEL_THRESHOLD = 60
const MOMENTUM_FACTOR = 12

function getContentMargin() {
  const maxWidth = 1200
  const vw = window.innerWidth
  return Math.max(32, (vw - maxWidth) / 2)
}

function computeCardWidth() {
  return Math.floor(window.innerWidth * 0.75)
}

/**
 * Encapsulates draggable carousel logic: snap points, wheel/keyboard
 * navigation, drag momentum, and responsive resize handling.
 */
export function useDraggableCarousel(cards, trackRef, containerRef, smoothVelocityRef, isDraggingRef) {
  const activeIndexRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const snapPointsRef = useRef([])
  const draggableRef = useRef(null)
  const [cardWidth, setCardWidth] = useState(400)
  const [contentMargin, setContentMargin] = useState(32)

  useEffect(() => {
    setCardWidth(computeCardWidth())
    setContentMargin(getContentMargin())
  }, [])

  const goToIndex = useCallback((index) => {
    const snapPoints = snapPointsRef.current
    if (!snapPoints.length) return
    const clamped = Math.max(0, Math.min(cards.length - 1, index))
    activeIndexRef.current = clamped
    setActiveIndex(clamped)

    const track = trackRef.current
    if (!track) return

    const currentX = gsap.getProperty(track, 'x')
    const targetX = snapPoints[clamped]
    const distance = Math.abs(currentX - targetX)
    const duration = Math.min(0.8, Math.max(0.3, distance / 1500))

    gsap.to(track, {
      x: targetX,
      duration,
      ease: 'power3.out',
      overwrite: true,
      onUpdate() {
        draggableRef.current?.update()
      },
    })
  }, [cards.length, trackRef])

  // Draggable + wheel + keyboard
  useEffect(() => {
    const track = trackRef.current
    const container = containerRef.current
    if (!track || !container) return

    let wheelAccum = 0
    let wheelResetTimer = null

    const setupDraggable = () => {
      const cw = computeCardWidth()
      const margin = getContentMargin()
      setCardWidth(cw)
      setContentMargin(margin)

      const snapPoints = cards.map((_, i) => -(i * (cw + CARD_GAP)))
      snapPointsRef.current = snapPoints

      const targetIdx = activeIndexRef.current
      gsap.set(track, { x: snapPoints[targetIdx] || 0 })

      const totalTrackWidth = cards.length * cw + (cards.length - 1) * CARD_GAP + margin
      const minX = -(totalTrackWidth - window.innerWidth)

      let rawVelocity = 0

      const [instance] = Draggable.create(track, {
        type: 'x',
        bounds: { minX, maxX: snapPoints[0] },
        edgeResistance: 0.85,
        onDragStart() {
          isDraggingRef.current = true
          rawVelocity = 0
        },
        onDrag() {
          rawVelocity = this.deltaX
          const speed = Math.min(Math.abs(this.deltaX) / 16, 1)
          const dir = this.deltaX > 0 ? 1 : -1
          smoothVelocityRef.current += (speed * dir - smoothVelocityRef.current) * 0.3
        },
        onDragEnd() {
          const currentX = gsap.getProperty(track, 'x')
          const projectedX = currentX + rawVelocity * MOMENTUM_FACTOR

          let nearest = 0
          let minDist = Infinity
          snapPoints.forEach((sp, i) => {
            const d = Math.abs(projectedX - sp)
            if (d < minDist) { minDist = d; nearest = i }
          })

          goToIndex(nearest)

          gsap.to(smoothVelocityRef, {
            current: 0, duration: 0.6, ease: 'power2.out',
            onComplete: () => { isDraggingRef.current = false },
          })
        },
      })

      draggableRef.current = instance
      return instance
    }

    let draggable = setupDraggable()

    const handleWheel = (e) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0)
      if (Math.abs(dx) < 2) return
      e.preventDefault()

      wheelAccum += dx

      clearTimeout(wheelResetTimer)
      wheelResetTimer = setTimeout(() => { wheelAccum = 0 }, 200)

      if (wheelAccum > WHEEL_THRESHOLD) {
        goToIndex(activeIndexRef.current + 1)
        wheelAccum = 0
        smoothVelocityRef.current = 0.4
        gsap.to(smoothVelocityRef, { current: 0, duration: 0.5, ease: 'power2.out' })
      } else if (wheelAccum < -WHEEL_THRESHOLD) {
        goToIndex(activeIndexRef.current - 1)
        wheelAccum = 0
        smoothVelocityRef.current = -0.4
        gsap.to(smoothVelocityRef, { current: 0, duration: 0.5, ease: 'power2.out' })
      }
    }

    const handleKeydown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToIndex(activeIndexRef.current + 1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToIndex(activeIndexRef.current - 1)
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('keydown', handleKeydown)

    const handleResize = () => {
      draggable?.kill()
      draggable = setupDraggable()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('resize', handleResize)
      clearTimeout(wheelResetTimer)
      draggable?.kill()
      gsap.set(track, { clearProps: 'all' })
    }
  }, [cards, goToIndex, trackRef, containerRef, smoothVelocityRef, isDraggingRef])

  return { activeIndex, goToIndex, cardWidth, contentMargin }
}

/** Entrance animation triggered by ScrollTrigger */
export function useCarouselEntrance(cardsElRef, containerRef) {
  useEffect(() => {
    const els = cardsElRef.current.filter(Boolean)
    const container = containerRef.current
    if (!els.length || !container) return

    gsap.set(els, { filter: 'blur(10px)', opacity: 0, x: 120 })

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        gsap.to(els, {
          filter: 'blur(0px)', opacity: 1, x: 0,
          duration: 0.8, ease: 'power2.out', stagger: 0.08,
        })
      },
    })

    return () => {
      trigger.kill()
      gsap.set(els, { clearProps: 'all' })
    }
  }, [cardsElRef, containerRef])
}
