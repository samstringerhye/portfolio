import React, { useRef, useEffect, useState, useCallback } from 'react'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(Draggable, ScrollTrigger)

const CARD_GAP = 24
const WHEEL_THRESHOLD = 60
const MOMENTUM_FACTOR = 12

function getContentMargin() {
  const maxWidth = 1200
  const vw = window.innerWidth
  const margin = Math.max(32, (vw - maxWidth) / 2)
  return margin
}

function computeCardWidth() {
  return Math.floor(window.innerWidth * 0.75)
}

function CarouselCard({ card, cardWidth, isDragging, smoothVelocityRef }) {
  const wrapperRef = useRef(null)
  const imgRef = useRef(null)
  const quickToRef = useRef({ rx: null, ry: null })

  useEffect(() => {
    const wrapper = wrapperRef.current
    const img = imgRef.current
    if (!wrapper || !img) return

    gsap.set(wrapper, { perspective: 800 })
    gsap.set(img, { transformStyle: 'preserve-3d' })

    quickToRef.current.rx = gsap.quickTo(img, 'rotationX', { ease: 'power3', duration: 0.5 })
    quickToRef.current.ry = gsap.quickTo(img, 'rotationY', { ease: 'power3', duration: 0.5 })

    return () => gsap.set(img, { clearProps: 'rotationX,rotationY' })
  }, [])

  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    const onTick = () => {
      const vel = smoothVelocityRef.current
      const absVel = Math.abs(vel)
      if (absVel < 0.01) {
        img.style.boxShadow = 'none'
        return
      }
      const spread = absVel * 16
      const blur = absVel * 20
      img.style.boxShadow = `${vel * 6}px 0 ${blur}px -4px rgba(0,255,255,0.4), ${vel * -6}px 0 ${blur}px -4px rgba(255,0,255,0.4), 0 4px ${spread}px -4px rgba(255,255,0,0.25)`
    }

    gsap.ticker.add(onTick)
    return () => gsap.ticker.remove(onTick)
  }, [smoothVelocityRef])

  const handleMove = useCallback((e) => {
    if (isDragging.current) return
    const img = imgRef.current
    if (!img) return
    const rect = img.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    if (quickToRef.current.rx) {
      quickToRef.current.rx(gsap.utils.interpolate(8, -8, y))
      quickToRef.current.ry(gsap.utils.interpolate(-8, 8, x))
    }
  }, [isDragging])

  const handleLeave = useCallback(() => {
    if (quickToRef.current.rx) {
      quickToRef.current.rx(0)
      quickToRef.current.ry(0)
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      style={{ width: cardWidth, flexShrink: 0 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <a href={`/work/${card.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div
          ref={imgRef}
          style={{
            aspectRatio: '2/1',
            borderRadius: 12,
            overflow: 'hidden',
            position: 'relative',
            willChange: 'transform',
          }}
        >
          <img
            src={card.thumbnail}
            alt={card.title}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
          />
        </div>
        {/* Color gradient shadow beneath image */}
        <div style={{
          height: 24,
          marginTop: -4,
          borderRadius: '0 0 16px 16px',
          background: 'linear-gradient(90deg, rgba(0,255,255,0.15), rgba(255,0,255,0.18), rgba(255,255,0,0.15))',
          filter: 'blur(12px)',
          opacity: 0.7,
          pointerEvents: 'none',
        }} />
        <div style={{ padding: 'var(--space-md) 4px 0' }}>
          <h3 style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-regular)',
            letterSpacing: 'var(--letter-spacing-tight)',
            lineHeight: 'var(--line-height-snug)',
            marginBottom: 'var(--space-xs)',
          }}>{card.title}</h3>
          <span style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-primary)',
          }}>{card.year} — {card.role}</span>
        </div>
      </a>
    </div>
  )
}

export default function WorkCarousel({ cards }) {
  const containerRef = useRef(null)
  const trackRef = useRef(null)
  const cursorRef = useRef(null)
  const quickXRef = useRef(null)
  const quickYRef = useRef(null)
  const smoothVelocityRef = useRef(0)
  const isDraggingRef = useRef(false)
  const activeIndexRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const cardsElRef = useRef([])
  const snapPointsRef = useRef([])
  const draggableRef = useRef(null)
  const [cardWidth, setCardWidth] = useState(400)
  const [contentMargin, setContentMargin] = useState(32)
  const [cursorVisible, setCursorVisible] = useState(false)

  useEffect(() => {
    setCardWidth(computeCardWidth())
    setContentMargin(getContentMargin())
  }, [])

  // Setup quickTo for smooth cursor following
  useEffect(() => {
    const el = cursorRef.current
    if (!el) return
    quickXRef.current = gsap.quickTo(el, 'x', { ease: 'power3', duration: 0.4 })
    quickYRef.current = gsap.quickTo(el, 'y', { ease: 'power3', duration: 0.4 })
  }, [])

  const handleCarouselEnter = useCallback(() => {
    setCursorVisible(true)
  }, [])

  const handleCarouselMove = useCallback((e) => {
    if (quickXRef.current) quickXRef.current(e.clientX)
    if (quickYRef.current) quickYRef.current(e.clientY)
  }, [])

  const handleCarouselLeave = useCallback(() => {
    setCursorVisible(false)
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
  }, [cards.length])

  // Entrance animation — triggered by ScrollTrigger
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
  }, [])

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

      // Calculate right bound: last card should end at viewport width - margin
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
  }, [cards, goToIndex])

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Work carousel"
      aria-roledescription="carousel"
      style={{ position: 'relative', width: '100%', overflow: 'hidden', outline: 'none', cursor: cursorVisible ? 'none' : 'auto' }}
      onMouseEnter={handleCarouselEnter}
      onMouseMove={handleCarouselMove}
      onMouseLeave={handleCarouselLeave}
    >
      {/* Floating drag cursor */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(26,26,26,0.85)',
          color: '#fff',
          fontSize: 11,
          fontFamily: 'var(--font-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 100,
          opacity: cursorVisible ? 1 : 0,
          transform: 'translate(-50%, -50%)',
          transition: 'opacity 0.2s ease',
        }}
      >
        Drag
      </div>
      <div style={{ position: 'relative', cursor: cursorVisible ? 'none' : 'grab' }}>
        <div
          ref={trackRef}
          style={{ display: 'flex', gap: CARD_GAP, paddingLeft: contentMargin, paddingRight: contentMargin, willChange: 'transform' }}
        >
          {cards.map((card, i) => (
            <div key={card.slug} ref={el => cardsElRef.current[i] = el}>
              <CarouselCard
                card={card}
                cardWidth={cardWidth}
                isDragging={isDraggingRef}
                smoothVelocityRef={smoothVelocityRef}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Clickable pagination dots */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 8,
        padding: '24px 0 0',
      }}>
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => goToIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === activeIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === activeIndex ? 'var(--color-text-primary)' : 'var(--color-border)',
              transition: 'width 0.3s ease, background 0.3s ease',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  )
}
