import { animations, semantic } from '../data/tokens'

const cfg = animations.hero.canvas

const TWO_PI = Math.PI * 2
const PHI = (1 + Math.sqrt(5)) / 2

const roundedSquareWave = (t: number, delta: number, a: number, f: number) =>
  ((2 * a) / Math.PI) * Math.atan(Math.sin(TWO_PI * t * f) / delta)

/* -- Arrangement generators (flat typed arrays) -- */
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

/* -- Update dot instance matrices for a given time -- */
function updateDots(
  matArr: Float32Array, total: number,
  posX: Float32Array, posY: Float32Array, dist: Float32Array,
  dotScales: Float32Array, time: number,
) {
  for (let i = 0; i < total; i++) {
    const d = dist[i]
    const t = time * cfg.waveSpeed - d / cfg.propagation
    const wave = roundedSquareWave(t, cfg.waveSharpness + (0.2 * d) / 50, cfg.waveAmplitude, cfg.waveFrequency)
    const scale = wave + cfg.baseScale
    const tw = wave * cfg.twistAmount
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

/**
 * Initialize the hero canvas with vanilla Three.js (no React).
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

  // Dynamic Three.js imports
  const [
    { Scene, OrthographicCamera, Color, SRGBColorSpace, WebGLRenderer, InstancedMesh, CircleGeometry, MeshBasicMaterial },
    { EffectComposer },
    { RenderPass },
    { ShaderPass },
    { FXAAShader },
    { OutputPass },
  ] = await Promise.all([
    import('three'),
    import('three/examples/jsm/postprocessing/EffectComposer.js'),
    import('three/examples/jsm/postprocessing/RenderPass.js'),
    import('three/examples/jsm/postprocessing/ShaderPass.js'),
    import('three/examples/jsm/shaders/FXAAShader.js'),
    import('three/examples/jsm/postprocessing/OutputPass.js'),
  ])

  // Build scene
  const gen = generators[cfg.arrangement] || generators.concentric
  const numRays = isMobile ? Math.round(cfg.numRays * 0.5) : cfg.numRays
  const dotsPerRay = isMobile ? Math.round(cfg.dotsPerRay * 0.5) : cfg.dotsPerRay
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
  const geometry = new CircleGeometry(cfg.dotRadius, cfg.dotSegments)

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

  // Renderer
  const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.5 : cfg.maxDpr)
  const renderer = new WebGLRenderer({ antialias: false, alpha: false })
  renderer.sortObjects = false
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(new Color(cfg.bgColor || semantic.color.bg.primary).convertSRGBToLinear(), 1)
  container.appendChild(renderer.domElement)
  renderer.domElement.style.display = 'block'

  // Camera
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000)
  camera.position.set(0, 0, 100)
  camera.zoom = cfg.zoom

  // Post-processing
  const composer = new EffectComposer(renderer)
  const renderPass = new RenderPass(scene, camera)
  renderPass.clearAlpha = 1
  composer.addPass(renderPass)
  const fxaaPass = new ShaderPass(FXAAShader)
  composer.addPass(fxaaPass)
  const outputPass = new OutputPass()
  composer.addPass(outputPass)

  // Visibility tracking
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

  // Sizing
  function resize() {
    const w = container.clientWidth
    const h = container.clientHeight
    if (w === 0 || h === 0) return
    renderer.setSize(w, h)
    const pw = w * dpr
    const ph = h * dpr
    composer.setSize(w, h)
    fxaaPass.uniforms.resolution.value.set(1 / pw, 1 / ph)
    camera.left = -w / 2
    camera.right = w / 2
    camera.top = h / 2
    camera.bottom = -h / 2
    camera.zoom = cfg.zoom
    camera.position.set(0, 0, 100)
    camera.updateProjectionMatrix()
  }

  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(container)

  // Animation loop
  const startTime = performance.now()
  const cmyDelay = animations.hero.canvas.cmyStagger

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
    composer.render()
  }

  tick()

  // Return cleanup
  return () => {
    cancelAnimationFrame(frameId)
    observer.disconnect()
    ro.disconnect()
    composer.dispose()
    meshes.forEach(mesh => (mesh.material as MeshBasicMaterial).dispose())
    meshes[0].geometry.dispose()
    renderer.dispose()
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }
}
