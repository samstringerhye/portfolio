import { animations, semantic } from '../data/tokens'

const cfg = animations.hero.canvas

const MOBILE_FACTOR = 0.5

/**
 * Initialize the hero canvas.
 * Uses OffscreenCanvas + Web Worker when supported, falls back to inline Three.js.
 * Returns a cleanup function.
 */
export async function initHeroCanvas(container: HTMLElement): Promise<() => void> {
  // WebGL support check
  try {
    const testCanvas = document.createElement('canvas')
    const testGl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl')
    if (!testGl) return () => {}
  } catch { return () => {} }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = window.matchMedia('(max-width: 768px)').matches

  // Get the canvas element from the DOM (added in HeroSection.astro)
  const canvas = container.querySelector('canvas') as HTMLCanvasElement | null
  if (!canvas) return () => {}

  // Feature-detect OffscreenCanvas with WebGL support
  let supportsOffscreen = false
  try {
    if (typeof canvas.transferControlToOffscreen === 'function') {
      // Probe with a throwaway canvas to avoid consuming the real one
      const probe = document.createElement('canvas')
      const off = probe.transferControlToOffscreen()
      const gl = off.getContext('webgl2') || off.getContext('webgl')
      supportsOffscreen = !!gl
    }
  } catch {}

  if (supportsOffscreen) {
    return initWithWorker(container, canvas, isMobile, prefersReduced)
  }
  return initFallback(container, canvas, isMobile, prefersReduced)
}

/* -- OffscreenCanvas Worker path -- */
function initWithWorker(
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  isMobile: boolean,
  prefersReduced: boolean,
): () => void {
  const offscreen = canvas.transferControlToOffscreen()
  const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.5 : cfg.maxDpr)
  const bgStyle = getComputedStyle(container).backgroundColor || 'rgb(239,244,245)'
  const accentColors = semantic.color.accent

  const worker = new Worker(
    new URL('./hero-canvas.worker.ts', import.meta.url),
    { type: 'module' },
  )

  // If the worker errors (e.g. Safari WebGL on OffscreenCanvas), fall back
  let fellBack = false
  function fallbackToInline() {
    if (fellBack) return
    fellBack = true
    clearTimeout(readyTimeout)
    worker.terminate()
    ro.disconnect()
    io.disconnect()
    // Re-create canvas since transferControlToOffscreen consumed the original
    const newCanvas = document.createElement('canvas')
    newCanvas.style.cssText = 'display:block;width:100%;height:100%'
    container.innerHTML = ''
    container.appendChild(newCanvas)
    initFallback(container, newCanvas, isMobile, prefersReduced)
  }

  worker.onerror = fallbackToInline

  // Timeout: if worker doesn't signal ready within 5s, fall back
  const readyTimeout = setTimeout(fallbackToInline, 5000)

  worker.onmessage = (e) => {
    if (e.data.type === 'ready') {
      clearTimeout(readyTimeout)
      requestAnimationFrame(() => container.classList.add('is-ready'))
    } else if (e.data.type === 'error') {
      fallbackToInline()
    }
  }

  // Ensure we have real dimensions (may be 0 during requestIdleCallback)
  let w = container.clientWidth
  let h = container.clientHeight
  if (w === 0 || h === 0) {
    const rect = container.getBoundingClientRect()
    w = Math.round(rect.width)
    h = Math.round(rect.height)
  }

  worker.postMessage({
    type: 'init',
    canvas: offscreen,
    width: w,
    height: h,
    dpr,
    bgColor: bgStyle,
    isMobile,
    prefersReduced,
    config: {
      arrangement: cfg.arrangement,
      numRays: cfg.numRays,
      dotsPerRay: cfg.dotsPerRay,
      spacing: cfg.spacing,
      innerRadius: cfg.innerRadius,
      dotRadius: cfg.dotRadius,
      sizeStart: cfg.sizeStart,
      sizeMid: cfg.sizeMid,
      sizeEnd: cfg.sizeEnd,
      waveSpeed: cfg.waveSpeed,
      waveFrequency: cfg.waveFrequency,
      waveAmplitude: cfg.waveAmplitude,
      waveSharpness: cfg.waveSharpness,
      propagation: cfg.propagation,
      baseScale: cfg.baseScale,
      twistAmount: cfg.twistAmount,
      zoom: isMobile ? cfg.zoom * MOBILE_FACTOR : cfg.zoom,
      accentOpacity: cfg.accentOpacity,
      cmyStagger: cfg.cmyStagger,
      wavePaused: cfg.wavePaused,
    },
    colors: {
      accent1: accentColors['1'],
      accent2: accentColors['2'],
      accent3: accentColors['3'],
      textPrimary: semantic.color.text.primary,
    },
  } as any, [offscreen])

  // ResizeObserver → post size changes to worker
  const ro = new ResizeObserver(() => {
    const w = container.clientWidth
    const h = container.clientHeight
    if (w > 0 && h > 0) {
      worker.postMessage({ type: 'resize', width: w, height: h })
    }
  })
  ro.observe(container)

  // IntersectionObserver → post visibility changes to worker
  const io = new IntersectionObserver(
    ([entry]) => {
      worker.postMessage({ type: 'visibility', visible: entry.isIntersecting })
    },
    { threshold: 0 },
  )
  io.observe(container)

  return () => {
    clearTimeout(readyTimeout)
    ro.disconnect()
    io.disconnect()
    worker.terminate()
  }
}

/* -- Fallback: inline Three.js (no OffscreenCanvas support) -- */
async function initFallback(
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  isMobile: boolean,
  prefersReduced: boolean,
): Promise<() => void> {
  const TWO_PI = Math.PI * 2
  const PHI = (1 + Math.sqrt(5)) / 2

  const roundedSquareWave = (t: number, delta: number, a: number, f: number) =>
    ((2 * a) / Math.PI) * Math.atan(Math.sin(TWO_PI * t * f) / delta)

  function generateSpiral(numRays: number, dotsPerRay: number, spacing: number) {
    const total = numRays * dotsPerRay
    const posX = new Float32Array(total)
    const posY = new Float32Array(total)
    const dist = new Float32Array(total)
    const goldenAngle = TWO_PI / (PHI * PHI)
    for (let i = 0; i < total; i++) {
      const angle = i * goldenAngle
      const r = spacing * Math.sqrt(i)
      const x = Math.cos(angle) * r
      const y = Math.sin(angle) * r
      posX[i] = x
      posY[i] = y
      dist[i] = Math.sqrt(x * x + y * y)
    }
    return { posX, posY, dist, total }
  }

  function generateConcentric(numRays: number, dotsPerRay: number, spacing: number, innerRadius: number) {
    const total = numRays * dotsPerRay
    const posX = new Float32Array(total)
    const posY = new Float32Array(total)
    const dist = new Float32Array(total)
    let idx = 0
    for (let ring = 0; ring < dotsPerRay; ring++) {
      const r = innerRadius + ring * spacing
      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * TWO_PI
        posX[idx] = Math.cos(angle) * r
        posY[idx] = Math.sin(angle) * r
        dist[idx] = r
        idx++
      }
    }
    return { posX, posY, dist, total }
  }

  function generateHexagonal(_numRays: number, dotsPerRay: number, spacing: number) {
    const maxR = dotsPerRay * spacing
    const rowH = spacing * Math.sqrt(3) / 2
    const rows = Math.ceil(maxR * 2 / rowH)
    const tmpX: number[] = [], tmpY: number[] = [], tmpD: number[] = []
    for (let row = -rows; row <= rows; row++) {
      const y = row * rowH
      const offset = (row % 2) * spacing * 0.5
      const cols = Math.ceil(maxR * 2 / spacing)
      for (let col = -cols; col <= cols; col++) {
        const x = col * spacing + offset
        const d2 = x * x + y * y
        if (d2 > maxR * maxR) continue
        tmpX.push(x)
        tmpY.push(y)
        tmpD.push(Math.sqrt(d2))
      }
    }
    return {
      posX: new Float32Array(tmpX),
      posY: new Float32Array(tmpY),
      dist: new Float32Array(tmpD),
      total: tmpX.length,
    }
  }

  function generateRose(numRays: number, dotsPerRay: number, spacing: number) {
    const total = numRays * dotsPerRay
    const posX = new Float32Array(total)
    const posY = new Float32Array(total)
    const dist = new Float32Array(total)
    const k = Math.max(2, Math.round(numRays / 20))
    for (let i = 0; i < total; i++) {
      const theta = (i / total) * TWO_PI * k
      const r = Math.cos(k * theta) * dotsPerRay * spacing * 0.3
      const absR = Math.abs(r)
      const sign = r >= 0 ? 1 : -1
      const x = Math.cos(theta) * absR * sign
      const y = Math.sin(theta) * absR * sign
      posX[i] = x
      posY[i] = y
      dist[i] = Math.sqrt(x * x + y * y)
    }
    return { posX, posY, dist, total }
  }

  const generators: Record<string, Function> = {
    spiral: generateSpiral, concentric: generateConcentric,
    hexagonal: generateHexagonal, rose: generateRose,
  }

  function sizeTaper(n: number, sizeStart: number, sizeMid: number, sizeEnd: number) {
    const inv = 1 - n
    return inv * inv * sizeStart + 2 * inv * n * sizeMid + n * n * sizeEnd
  }

  const _waveSpeed = cfg.waveSpeed
  const _propagation = cfg.propagation
  const _waveSharpness = cfg.waveSharpness
  const _waveAmplitude = cfg.waveAmplitude
  const _waveFrequency = cfg.waveFrequency
  const _baseScale = cfg.baseScale
  const _twistAmount = cfg.twistAmount

  function updateDots(
    matArr: Float32Array, total: number,
    posX: Float32Array, posY: Float32Array, dist: Float32Array,
    dotScales: Float32Array, time: number,
  ) {
    for (let i = 0; i < total; i++) {
      const d = dist[i]
      const t = time * _waveSpeed - d / _propagation
      const wave = roundedSquareWave(t, _waveSharpness + (0.2 * d) / 50, _waveAmplitude, _waveFrequency)
      const scale = wave + _baseScale
      const tw = wave * _twistAmount
      const px = posX[i] * scale
      const py = posY[i] * scale
      const cosT = Math.cos(tw)
      const sinT = Math.sin(tw)
      const s = dotScales[i]
      const o = i * 16
      matArr[o]      = s
      matArr[o + 5]  = s
      matArr[o + 10] = s
      matArr[o + 12] = px * cosT - py * sinT
      matArr[o + 13] = px * sinT + py * cosT
    }
  }

  const { Scene, OrthographicCamera, Color, SRGBColorSpace, WebGLRenderer, InstancedMesh, CircleGeometry, MeshBasicMaterial } = await import('three')

  const gen = generators[cfg.arrangement] || generators.concentric
  const numRays = isMobile ? Math.round(cfg.numRays * MOBILE_FACTOR) : cfg.numRays
  const dotsPerRay = isMobile ? Math.round(cfg.dotsPerRay * MOBILE_FACTOR) : cfg.dotsPerRay
  const { posX, posY, dist, total } = gen(numRays, dotsPerRay, cfg.spacing, cfg.innerRadius)

  let maxDist = 0
  for (let i = 0; i < total; i++) {
    if (dist[i] > maxDist) maxDist = dist[i]
  }
  if (maxDist === 0) maxDist = 1

  const dotScales = new Float32Array(total)
  for (let i = 0; i < total; i++) {
    dotScales[i] = sizeTaper(dist[i] / maxDist, cfg.sizeStart, cfg.sizeMid, cfg.sizeEnd)
  }

  const scene = new Scene()
  const geometry = new CircleGeometry(cfg.dotRadius, 6)
  const accentColors = semantic.color.accent
  const accentOpacity = cfg.accentOpacity ?? 1
  const layers = [
    { color: accentColors['1'], delay: 1, opacity: accentOpacity },
    { color: accentColors['2'], delay: 2, opacity: accentOpacity },
    { color: accentColors['3'], delay: 3, opacity: accentOpacity },
    { color: semantic.color.text.primary, delay: 0, opacity: 1 },
  ]

  const meshes: InstanceType<typeof InstancedMesh>[] = []
  const delays: number[] = []
  for (const layer of layers) {
    const mat = new MeshBasicMaterial({
      color: layer.color, depthWrite: false, depthTest: false,
      transparent: true, opacity: layer.opacity,
    })
    const mesh = new InstancedMesh(geometry, mat, total)
    scene.add(mesh)
    meshes.push(mesh)
    delays.push(layer.delay)
  }

  const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.5 : cfg.maxDpr)
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' })
  renderer.sortObjects = false
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setPixelRatio(dpr)
  const bgStyle = getComputedStyle(container).backgroundColor || 'rgb(239,244,245)'
  const bgColor = new Color(bgStyle)
  renderer.setClearColor(bgColor, 1)

  const effectiveZoom = isMobile ? cfg.zoom * MOBILE_FACTOR : cfg.zoom

  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000)
  camera.position.set(0, 0, 100)
  camera.zoom = effectiveZoom

  let isVisible = true
  let hiddenAt = 0
  let pauseAccum = 0
  let frameId = 0

  const observer = new IntersectionObserver(
    ([entry]) => {
      const wasVisible = isVisible
      isVisible = entry.isIntersecting
      if (!isVisible && wasVisible) {
        cancelAnimationFrame(frameId)
        hiddenAt = performance.now()
      } else if (isVisible && !wasVisible && !prefersReduced) {
        pauseAccum += performance.now() - hiddenAt
        frameId = requestAnimationFrame(tick)
      }
    },
    { threshold: 0 },
  )
  observer.observe(container)

  function resize() {
    const w = container.clientWidth
    const h = container.clientHeight
    if (w === 0 || h === 0) return
    renderer.setSize(w, h, false)
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    camera.left = -w / 2
    camera.right = w / 2
    camera.top = h / 2
    camera.bottom = -h / 2
    camera.zoom = effectiveZoom
    camera.position.set(0, 0, 100)
    camera.updateProjectionMatrix()
  }

  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(container)

  const startTime = performance.now()
  const cmyDelay = cfg.cmyStagger

  function tick() {
    if (!prefersReduced) {
      frameId = requestAnimationFrame(tick)
    }
    const elapsed = (performance.now() - startTime - pauseAccum) / 1000
    const time = (cfg.wavePaused || prefersReduced) ? 0 : elapsed
    meshes.forEach((mesh, i) => {
      updateDots(mesh.instanceMatrix.array as Float32Array, total, posX, posY, dist, dotScales, time - delays[i] * cmyDelay)
      mesh.instanceMatrix.needsUpdate = true
    })
    renderer.render(scene, camera)
  }

  tick()
  requestAnimationFrame(() => container.classList.add('is-ready'))

  return () => {
    cancelAnimationFrame(frameId)
    observer.disconnect()
    ro.disconnect()
    meshes.forEach(mesh => (mesh.material as MeshBasicMaterial).dispose())
    meshes[0].geometry.dispose()
    renderer.dispose()
  }
}
