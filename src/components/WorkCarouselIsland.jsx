import React, { useRef, useEffect, useState, useCallback } from 'react'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import tokens from '../data/tokens.json'

gsap.registerPlugin(Draggable, ScrollTrigger)

const snapCfg = tokens.animations.carousel.snap
const entrCfg = tokens.animations.carousel.entrance
const WHEEL_THRESHOLD = snapCfg.wheelThreshold
const MOMENTUM_FACTOR = snapCfg.momentumFactor
const CARD_GAP = tokens.animations.carousel.cardGap
const CARD_RADIUS = tokens.animations.carousel.cardRadius
const MOBILE_BREAKPOINT = tokens.breakpoints.mobile
const CONTENT_WIDTH = tokens.layout.contentWidth

function computeCardWidth() {
  const vw = window.innerWidth
  if (vw < MOBILE_BREAKPOINT) return vw - 48
  return Math.min(CONTENT_WIDTH, vw - 80)
}

function computeSideMargin() {
  const vw = window.innerWidth
  const cardWidth = computeCardWidth()
  return (vw - cardWidth) / 2
}

function CarouselCard({ card, cardWidth, titleTag: TitleTag = 'h4', titleRole = '' }) {
  return (
    <a
      href={`/work/${card.slug}`}
      draggable={false}
      aria-label={`${card.title} — ${card.role}, ${card.year}`}
      style={{
        display: 'block',
        width: cardWidth,
        flexShrink: 0,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div
        style={{
          borderRadius: CARD_RADIUS,
          overflow: 'hidden',
          aspectRatio: '1.85 / 1',
        }}
      >
        <img
          src={card.thumbnail}
          alt=""
          draggable={false}
          width="1260"
          height="681"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      </div>
      <TitleTag
        className={titleRole}
        style={{
          margin: 0,
          marginTop: 'var(--space-2)',
        }}
      >
        {card.title}
      </TitleTag>
    </a>
  )
}

export default function WorkCarousel({ cards, cardTitleTag, cardTitleRole }) {
  const containerRef = useRef(null)
  const trackRef = useRef(null)
  const activeIndexRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const cardsElRef = useRef([])
  const snapPointsRef = useRef([])
  const draggableRef = useRef(null)
  const isDraggingRef = useRef(false)
  const didDragRef = useRef(false)
  const [cardWidth, setCardWidth] = useState(400)
  const [sideMargin, setSideMargin] = useState(40)

  useEffect(() => {
    setCardWidth(computeCardWidth())
    setSideMargin(computeSideMargin())
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
      ease: snapCfg.ease,
      overwrite: true,
      onUpdate() {
        draggableRef.current?.update()
      },
    })
  }, [cards.length])

  // Entrance animation
  useEffect(() => {
    const els = cardsElRef.current.filter(Boolean)
    const container = containerRef.current
    if (!els.length || !container) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    gsap.set(els, { filter: `blur(${entrCfg.blur}px)`, opacity: 0, x: entrCfg.x })

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: entrCfg.triggerStart,
      once: true,
      onEnter: () => {
        gsap.to(els, {
          filter: 'blur(0px)', opacity: 1, x: 0,
          duration: entrCfg.duration, ease: entrCfg.ease, stagger: entrCfg.stagger,
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
      const margin = computeSideMargin()
      setCardWidth(cw)
      setSideMargin(margin)

      // Snap points: track paddingLeft already offsets the first card to center,
      // so snap x=0 centers card 0, and each subsequent card shifts left by (cardWidth + gap)
      const snapPoints = cards.map((_, i) => -(i * (cw + CARD_GAP)))
      snapPointsRef.current = snapPoints

      const targetIdx = activeIndexRef.current
      gsap.set(track, { x: snapPoints[targetIdx] || 0 })

      const lastSnap = snapPoints[snapPoints.length - 1]
      const minX = lastSnap
      const maxX = snapPoints[0]

      let rawVelocity = 0

      const [instance] = Draggable.create(track, {
        type: 'x',
        bounds: { minX, maxX },
        edgeResistance: 0.85,
        onDragStart() {
          isDraggingRef.current = true
          didDragRef.current = false
          rawVelocity = 0
        },
        onDrag() {
          rawVelocity = this.deltaX
          if (Math.abs(this.x - this.startX) > 5) {
            didDragRef.current = true
          }
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

          isDraggingRef.current = false
          setTimeout(() => { didDragRef.current = false }, 50)
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
      } else if (wheelAccum < -WHEEL_THRESHOLD) {
        goToIndex(activeIndexRef.current - 1)
        wheelAccum = 0
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

    // Prevent link navigation after drag
    const handleClick = (e) => {
      if (didDragRef.current) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('keydown', handleKeydown)
    container.addEventListener('click', handleClick, true)

    const handleResize = () => {
      draggable?.kill()
      draggable = setupDraggable()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('keydown', handleKeydown)
      container.removeEventListener('click', handleClick, true)
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
      style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
    >
      <div style={{ position: 'relative', cursor: 'grab' }}>
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: CARD_GAP,
            paddingLeft: sideMargin,
            paddingRight: sideMargin,
          }}
        >
          {cards.map((card, i) => (
            <div
              key={card.slug}
              ref={el => cardsElRef.current[i] = el}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${cards.length}: ${card.title}`}
            >
              <CarouselCard card={card} cardWidth={cardWidth} titleTag={cardTitleTag} titleRole={cardTitleRole} />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 8,
        padding: 'var(--space-3) 0 0',
      }}>
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); goToIndex(i) }}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === activeIndex ? 'true' : undefined}
            style={{
              minWidth: 44,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <span style={{
              width: i === activeIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === activeIndex ? 'var(--color-text-primary)' : 'var(--color-dot-inactive)',
              transition: 'width var(--transition-base) ease, background var(--transition-base) ease',
              display: 'block',
            }} />
          </button>
        ))}
      </div>

      {/* Screen reader live region for slide announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {`Slide ${activeIndex + 1} of ${cards.length}: ${cards[activeIndex]?.title}`}
      </div>
    </div>
  )
}
