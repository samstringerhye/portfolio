import React, { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from '../utils/animation'
import { useDraggableCarousel, useCarouselEntrance } from '../utils/use-draggable-carousel'

const CARD_GAP = 24

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
  const cardsElRef = useRef([])
  const [cursorVisible, setCursorVisible] = useState(false)

  const { activeIndex, goToIndex, cardWidth, contentMargin } = useDraggableCarousel(
    cards, trackRef, containerRef, smoothVelocityRef, isDraggingRef
  )

  useCarouselEntrance(cardsElRef, containerRef)

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
