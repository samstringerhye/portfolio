/// <reference lib="webworker" />

const TWO_PI = Math.PI * 2
const PHI = (1 + Math.sqrt(5)) / 2

const roundedSquareWave = (t: number, delta: number, a: number, f: number) =>
  ((2 * a) / Math.PI) * Math.atan(Math.sin(TWO_PI * t * f) / delta)

/* -- Arrangement generators -- */
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
  spiral: generateSpiral,
  concentric: generateConcentric,
  hexagonal: generateHexagonal,
  rose: generateRose,
}

/* -- Size taper -- */
function sizeTaper(n: number, sizeStart: number, sizeMid: number, sizeEnd: number) {
  const inv = 1 - n
  return inv * inv * sizeStart + 2 * inv * n * sizeMid + n * n * sizeEnd
}

/* -- Update dot instance matrices -- */
function updateDots(
  matArr: Float32Array, total: number,
  posX: Float32Array, posY: Float32Array, dist: Float32Array,
  dotScales: Float32Array, time: number,
  waveSpeed: number, propagation: number, waveSharpness: number,
  waveAmplitude: number, waveFrequency: number, baseScale: number, twistAmount: number,
) {
  for (let i = 0; i < total; i++) {
    const d = dist[i]
    const t = time * waveSpeed - d / propagation
    const wave = roundedSquareWave(t, waveSharpness + (0.2 * d) / 50, waveAmplitude, waveFrequency)
    const scale = wave + baseScale
    const tw = wave * twistAmount
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

/* -- Worker message types -- */
interface InitMessage {
  type: 'init'
  canvas: OffscreenCanvas
  width: number
  height: number
  dpr: number
  bgColor: string
  isMobile: boolean
  prefersReduced: boolean
  config: {
    arrangement: string
    numRays: number
    dotsPerRay: number
    spacing: number
    innerRadius: number
    dotRadius: number
    sizeStart: number
    sizeMid: number
    sizeEnd: number
    waveSpeed: number
    waveFrequency: number
    waveAmplitude: number
    waveSharpness: number
    propagation: number
    baseScale: number
    twistAmount: number
    zoom: number
    accentOpacity: number
    cmyStagger: number
    wavePaused?: boolean
  }
  colors: {
    accent1: string
    accent2: string
    accent3: string
    textPrimary: string
  }
}

interface ResizeMessage {
  type: 'resize'
  width: number
  height: number
}

interface VisibilityMessage {
  type: 'visibility'
  visible: boolean
}

type WorkerMessage = InitMessage | ResizeMessage | VisibilityMessage

let frameId: number | null = null

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data

  if (msg.type === 'init') {
    try {
      await initScene(msg)
    } catch (err) {
      self.postMessage({ type: 'error', message: String(err) })
      return
    }
  } else if (msg.type === 'resize') {
    handleResize(msg.width, msg.height)
  } else if (msg.type === 'visibility') {
    handleVisibility(msg.visible)
  }
}

// Scene state (set during init)
let renderer: any
let camera: any
let scene: any
let meshes: any[] = []
let delays: number[] = []
let posX: Float32Array
let posY: Float32Array
let dist: Float32Array
let dotScales: Float32Array
let total: number
let cfg: InitMessage['config']
let isVisible = true
let hiddenAt = 0
let pauseAccum = 0
let startTime = 0
let prefersReduced = false

async function initScene(msg: InitMessage) {
  cfg = msg.config
  prefersReduced = msg.prefersReduced

  const {
    Scene, OrthographicCamera, Color, SRGBColorSpace, WebGLRenderer,
    InstancedMesh, CircleGeometry, MeshBasicMaterial,
  } = await import('three')

  const gen = generators[cfg.arrangement] || generators.concentric
  const mobileFactor = 0.5
  const numRays = msg.isMobile ? Math.round(cfg.numRays * mobileFactor) : cfg.numRays
  const dotsPerRay = msg.isMobile ? Math.round(cfg.dotsPerRay * mobileFactor) : cfg.dotsPerRay
  const result = gen(numRays, dotsPerRay, cfg.spacing, cfg.innerRadius)
  posX = result.posX
  posY = result.posY
  dist = result.dist
  total = result.total

  let maxDist = 0
  for (let i = 0; i < total; i++) {
    if (dist[i] > maxDist) maxDist = dist[i]
  }
  if (maxDist === 0) maxDist = 1

  dotScales = new Float32Array(total)
  for (let i = 0; i < total; i++) {
    dotScales[i] = sizeTaper(dist[i] / maxDist, cfg.sizeStart, cfg.sizeMid, cfg.sizeEnd)
  }

  scene = new Scene()
  const geometry = new CircleGeometry(cfg.dotRadius, 6)

  const accentOpacity = cfg.accentOpacity ?? 1
  const layers = [
    { color: msg.colors.accent1, delay: 1, opacity: accentOpacity },
    { color: msg.colors.accent2, delay: 2, opacity: accentOpacity },
    { color: msg.colors.accent3, delay: 3, opacity: accentOpacity },
    { color: msg.colors.textPrimary, delay: 0, opacity: 1 },
  ]

  meshes = []
  delays = []
  for (const layer of layers) {
    const mat = new MeshBasicMaterial({
      color: layer.color,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      opacity: layer.opacity,
    })
    const mesh = new InstancedMesh(geometry, mat, total)
    scene.add(mesh)
    meshes.push(mesh)
    delays.push(layer.delay)
  }

  renderer = new WebGLRenderer({
    canvas: msg.canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'low-power',
  })
  renderer.sortObjects = false
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setPixelRatio(msg.dpr)
  const bgColor = new Color(msg.bgColor)
  renderer.setClearColor(bgColor, 1)

  camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000)
  camera.position.set(0, 0, 100)
  camera.zoom = cfg.zoom

  applySize(msg.width, msg.height)

  startTime = performance.now()
  tick()

  // Signal ready to main thread
  self.postMessage({ type: 'ready' })
}

function applySize(w: number, h: number) {
  if (!renderer || w === 0 || h === 0) return
  renderer.setSize(w, h, false) // false = don't set style (no DOM in worker)
  camera.left = -w / 2
  camera.right = w / 2
  camera.top = h / 2
  camera.bottom = -h / 2
  camera.zoom = cfg.zoom
  camera.position.set(0, 0, 100)
  camera.updateProjectionMatrix()
}

function handleResize(width: number, height: number) {
  applySize(width, height)
}

function handleVisibility(visible: boolean) {
  const wasVisible = isVisible
  isVisible = visible
  if (!isVisible && wasVisible) {
    if (frameId != null) cancelAnimationFrame(frameId)
    frameId = null
    hiddenAt = performance.now()
  } else if (isVisible && !wasVisible && !prefersReduced) {
    pauseAccum += performance.now() - hiddenAt
    tick()
  }
}

function tick() {
  if (!prefersReduced) {
    frameId = requestAnimationFrame(tick)
  }

  const elapsed = (performance.now() - startTime - pauseAccum) / 1000
  const time = (cfg.wavePaused || prefersReduced) ? 0 : elapsed
  const cmyDelay = cfg.cmyStagger

  for (let i = 0; i < meshes.length; i++) {
    const mesh = meshes[i]
    updateDots(
      mesh.instanceMatrix.array as Float32Array, total,
      posX, posY, dist, dotScales, time - delays[i] * cmyDelay,
      cfg.waveSpeed, cfg.propagation, cfg.waveSharpness,
      cfg.waveAmplitude, cfg.waveFrequency, cfg.baseScale, cfg.twistAmount,
    )
    mesh.instanceMatrix.needsUpdate = true
  }

  renderer.render(scene, camera)
}
