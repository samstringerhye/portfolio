import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { animations, cmyRgba } from '../data/tokens'

gsap.registerPlugin(SplitText)

type TextRevealConfig = typeof animations.textReveal

/**
 * Build a text-shadow string from CMY channel progress values.
 * offset = distance each channel shadow travels (px)
 * opacity = base opacity of color trails
 * progress = per-channel 1→0 animation proxy
 */
function buildCmyShadow(
  offset: number,
  blur: number,
  opacity: number,
  progress: { cy: number; mg: number; yw: number },
): string {
  const [cRgba, mRgba, yRgba] = cmyRgba(1)
  const cOff = offset * progress.cy
  const mOff = offset * progress.mg
  const yOff = offset * progress.yw
  const cBlur = blur * progress.cy
  const mBlur = blur * progress.mg
  const yBlur = blur * progress.yw
  const cA = opacity * progress.cy
  const mA = opacity * progress.mg
  const yA = opacity * progress.yw
  return [
    `0 ${cOff}px ${cBlur}px ${cRgba.replace(/,1\)$/, `,${cA})`)}`,
    `0 ${mOff}px ${mBlur}px ${mRgba.replace(/,1\)$/, `,${mA})`)}`,
    `0 ${yOff}px ${yBlur}px ${yRgba.replace(/,1\)$/, `,${yA})`)}`,
  ].join(', ')
}

/**
 * Compute the initial CMY shadow for gsap.set (all channels at full offset).
 * slideUp = font-size-proportional distance (px)
 */
function initialShadow(slideDistance: number, cfg: TextRevealConfig): string {
  return buildCmyShadow(slideDistance, cfg.initialBlur, cfg.cmyOpacity, { cy: 1, mg: 1, yw: 1 })
}

/**
 * Create a self-contained CMY reveal sub-timeline for one element (word).
 * Includes motion tween (opacity → 1, y → 0, blur → 0) and
 * 3 staggered channel tweens with onUpdate rebuilding text-shadow.
 */
export function createCmyReveal(
  el: HTMLElement,
  cfg: TextRevealConfig,
  slideDistance: number,
  timelineVars?: gsap.TimelineVars,
): gsap.core.Timeline {
  const hasCmy = cfg.cmyStagger > 0
  const s = { cy: 1, mg: 1, yw: 1 }

  const tl = gsap.timeline({
    ...timelineVars,
    ...(hasCmy && {
      onUpdate() {
        el.style.textShadow = buildCmyShadow(slideDistance, cfg.initialBlur, cfg.cmyOpacity, s)
      },
    }),
  })

  tl.to(el, {
    opacity: 1, y: 0, filter: 'blur(0px)',
    duration: cfg.duration, ease: cfg.ease,
  }, 0)

  if (hasCmy) {
    tl.to(s, { cy: 0, duration: cfg.duration, ease: cfg.ease }, 0)
    tl.to(s, { mg: 0, duration: cfg.duration, ease: cfg.ease }, cfg.cmyStagger)
    tl.to(s, { yw: 0, duration: cfg.duration, ease: cfg.ease }, cfg.cmyStagger * 2)
  }

  return tl
}

/* ── Visual line detection ──────────────────────────────────────────── */

/**
 * Group word spans into visual lines by comparing getBoundingClientRect().top.
 * Works with any inline elements — no block-level line wrappers needed.
 */
function detectVisualLines(words: HTMLElement[]): HTMLElement[][] {
  if (!words.length) return []
  const lines: HTMLElement[][] = []
  let currentLine: HTMLElement[] = [words[0]]
  let currentTop = words[0].getBoundingClientRect().top

  for (let i = 1; i < words.length; i++) {
    const top = words[i].getBoundingClientRect().top
    if (Math.abs(top - currentTop) > 2) {
      lines.push(currentLine)
      currentLine = [words[i]]
      currentTop = top
    } else {
      currentLine.push(words[i])
    }
  }
  lines.push(currentLine)
  return lines
}

/* ── Public API ─────────────────────────────────────────────────────── */

/**
 * Handle returned by the reveal functions.
 * Provides access to the SplitText instance, the timeline,
 * and a single kill() method that cleans up everything.
 */
export interface CmyAutoSplitHandle {
  split: SplitText
  get tl(): gsap.core.Timeline | null
  kill(): void
}

/**
 * Words-only SplitText + staggered CMY reveal.
 *
 * Splits into words only (no line divs) and detects visual lines via
 * getBoundingClientRect. This avoids the block-level line wrappers that
 * alter document flow and cause wrong line breaks + visible reflow on revert.
 *
 * Caller must await document.fonts.ready before calling so that word
 * positions reflect final font metrics.
 */
export function createCmyAutoSplitReveal(
  el: HTMLElement,
  cfg: TextRevealConfig,
  timelineVars?: gsap.TimelineVars,
): CmyAutoSplitHandle {
  const slideDistance = cfg.slideUp
  const hasCmy = cfg.cmyStagger > 0

  const split = new SplitText(el, { type: 'words', wordsClass: 'cmy-word' })
  const words = split.words as HTMLElement[]
  const lines = detectVisualLines(words)
  const multiline = lines.length > 1

  // Transfer hidden state from parent to individual words
  gsap.set(el, { opacity: 1, y: 0, filter: 'none', textShadow: 'none', visibility: 'visible' })
  gsap.set(words, {
    opacity: 0, y: slideDistance, filter: `blur(${cfg.initialBlur}px)`,
    ...(hasCmy && { textShadow: initialShadow(slideDistance, cfg) }),
  })

  const tl = gsap.timeline({
    ...timelineVars,
    onComplete() {
      split.revert()
      gsap.set(el, { opacity: 1, y: 0, filter: 'none', textShadow: 'none', visibility: 'visible' })
    },
  })

  if (multiline) {
    // Animate all words in a line together, stagger between lines
    lines.forEach((lineWords, lineIdx) => {
      lineWords.forEach(word => {
        tl.add(createCmyReveal(word, cfg, slideDistance), lineIdx * cfg.blockStagger)
      })
    })
  } else {
    words.forEach((word, idx) => {
      tl.add(createCmyReveal(word, cfg, slideDistance), idx * cfg.wordStagger)
    })
  }

  return {
    split,
    get tl() { return tl },
    kill() { tl.kill(); if (split.isSplit) split.revert() },
  }
}

/**
 * Words-only variant for grouped reveals inside a parent timeline.
 *
 * The child timeline is inserted into parentTl at the given position.
 * On complete, the child is removed from the parent and the split is reverted.
 */
export function createCmyAutoSplitRevealGrouped(
  el: HTMLElement,
  cfg: TextRevealConfig,
  parentTl: gsap.core.Timeline,
  position: number,
): CmyAutoSplitHandle {
  const slideDistance = cfg.slideUp
  const hasCmy = cfg.cmyStagger > 0

  const split = new SplitText(el, { type: 'words', wordsClass: 'cmy-word' })
  const words = split.words as HTMLElement[]
  const lines = detectVisualLines(words)
  const multiline = lines.length > 1

  gsap.set(el, { opacity: 1, y: 0, filter: 'none', textShadow: 'none', visibility: 'visible' })
  gsap.set(words, {
    opacity: 0, y: slideDistance, filter: `blur(${cfg.initialBlur}px)`,
    ...(hasCmy && { textShadow: initialShadow(slideDistance, cfg) }),
  })

  const tl = gsap.timeline({
    onComplete() {
      parentTl.remove(tl)
      split.revert()
      gsap.set(el, { opacity: 1, y: 0, filter: 'none', textShadow: 'none', visibility: 'visible' })
    },
  })

  if (multiline) {
    lines.forEach((lineWords, lineIdx) => {
      lineWords.forEach(word => {
        tl.add(createCmyReveal(word, cfg, slideDistance), lineIdx * cfg.blockStagger)
      })
    })
  } else {
    words.forEach((word, idx) => {
      tl.add(createCmyReveal(word, cfg, slideDistance), idx * cfg.wordStagger)
    })
  }

  parentTl.add(tl, position)

  return {
    split,
    get tl() { return tl },
    kill() {
      parentTl.remove(tl)
      tl.kill()
      if (split.isSplit) split.revert()
    },
  }
}
