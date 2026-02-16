import React, { useRef, useMemo, useEffect, useState, lazy, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Color, Vector3, Object3D, WebGLRenderTarget, LinearFilter, RGBAFormat } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
import { useShallow } from 'zustand/react/shallow'
import { useTuningStore } from './store.js'

const TuningPanel = import.meta.env.DEV
  ? lazy(() => import('./TuningPanel.jsx'))
  : null

const TWO_PI = Math.PI * 2
const PHI = (1 + Math.sqrt(5)) / 2

const roundedSquareWave = (t, delta, a, f) =>
  ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)

/* -- Arrangement generators -- */
function generateSpiral(numRays, dotsPerRay, spacing, _innerRadius) {
  const positions = []
  const distances = []
  const total = numRays * dotsPerRay
  const goldenAngle = TWO_PI / (PHI * PHI)
  for (let i = 0; i < total; i++) {
    const angle = i * goldenAngle
    const r = spacing * Math.sqrt(i)
    const v = new Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0)
    positions.push(v)
    distances.push(v.length())
  }
  return { positions, distances }
}

function generateConcentric(numRays, dotsPerRay, spacing, innerRadius) {
  const positions = []
  const distances = []
  for (let ring = 0; ring < dotsPerRay; ring++) {
    const r = innerRadius + ring * spacing
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * TWO_PI
      const v = new Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0)
      positions.push(v)
      distances.push(v.length())
    }
  }
  return { positions, distances }
}

function generateHexagonal(numRays, dotsPerRay, spacing, _innerRadius) {
  const positions = []
  const distances = []
  const maxR = dotsPerRay * spacing
  const rowH = spacing * Math.sqrt(3) / 2
  const rows = Math.ceil(maxR * 2 / rowH)
  for (let row = -rows; row <= rows; row++) {
    const y = row * rowH
    const offset = (row % 2) * spacing * 0.5
    const cols = Math.ceil(maxR * 2 / spacing)
    for (let col = -cols; col <= cols; col++) {
      const x = col * spacing + offset
      if (x * x + y * y > maxR * maxR) continue
      const v = new Vector3(x, y, 0)
      positions.push(v)
      distances.push(v.length())
    }
  }
  return { positions, distances }
}

function generateRose(numRays, dotsPerRay, spacing, _innerRadius) {
  const positions = []
  const distances = []
  const k = Math.max(2, Math.round(numRays / 20))
  const total = numRays * dotsPerRay
  for (let i = 0; i < total; i++) {
    const theta = (i / total) * TWO_PI * k
    const r = Math.cos(k * theta) * dotsPerRay * spacing * 0.3
    const absR = Math.abs(r)
    const sign = r >= 0 ? 1 : -1
    const v = new Vector3(
      Math.cos(theta) * absR * sign,
      Math.sin(theta) * absR * sign,
      0,
    )
    positions.push(v)
    distances.push(v.length())
  }
  return { positions, distances }
}

const generators = { spiral: generateSpiral, concentric: generateConcentric, hexagonal: generateHexagonal, rose: generateRose }

/* -- Size taper -- */
function sizeTaper(n, sizeStart, sizeMid, sizeEnd) {
  const inv = 1 - n
  return inv * inv * sizeStart + 2 * inv * n * sizeMid + n * n * sizeEnd
}

/* -- Temporal RGB split shader -- */
const triColorMix = {
  uniforms: {
    tDiffuse: { value: null },
    tPrev: { value: null },
    tPrevPrev: { value: null },
    uReverse: { value: 0.0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D tPrev;
    uniform sampler2D tPrevPrev;
    uniform float uReverse;
    varying vec2 vUv;
    void main() {
      vec4 curr = texture2D(tDiffuse, vUv);
      vec4 prev = texture2D(tPrev, vUv);
      vec4 pprev = texture2D(tPrevPrev, vUv);
      float r = mix(curr.r, pprev.r, uReverse);
      float g = prev.g;
      float b = mix(pprev.b, curr.b, uReverse);
      gl_FragColor = vec4(r, g, b, curr.a);
    }
  `,
}

/* -- SunburstDots -- */
function SunburstDots() {
  const ref = useRef()

  // Structural params: re-render when these change to rebuild geometry
  const {
    arrangement, numRays, dotsPerRay, spacing, innerRadius,
    dotRadius, dotSegments, dotColor,
    sizeStart, sizeMid, sizeEnd,
  } = useTuningStore(
    useShallow(s => ({
      arrangement: s.arrangement,
      numRays: s.numRays,
      dotsPerRay: s.dotsPerRay,
      spacing: s.spacing,
      innerRadius: s.innerRadius,
      dotRadius: s.dotRadius,
      dotSegments: s.dotSegments,
      dotColor: s.dotColor,
      sizeStart: s.sizeStart,
      sizeMid: s.sizeMid,
      sizeEnd: s.sizeEnd,
    }))
  )

  const { positions, distances, dotScales } = useMemo(() => {
    const gen = generators[arrangement] || generators.concentric
    const { positions: pos, distances: dist } = gen(numRays, dotsPerRay, spacing, innerRadius)
    const maxDist = dist.reduce((a, b) => Math.max(a, b), 1)
    const scales = pos.map((_, i) => sizeTaper(dist[i] / maxDist, sizeStart, sizeMid, sizeEnd))
    return { positions: pos, distances: dist, dotScales: scales }
  }, [arrangement, numRays, dotsPerRay, spacing, innerRadius, sizeStart, sizeMid, sizeEnd])

  const total = positions.length
  const tempObj = useMemo(() => new Object3D(), [])

  useFrame(({ clock }) => {
    const mesh = ref.current
    if (!mesh) return

    const cfg = useTuningStore.getState()
    const time = cfg.wavePaused ? 0 : clock.elapsedTime

    for (let i = 0; i < total; i++) {
      const d = distances[i]
      const t = time * cfg.waveSpeed - d / cfg.propagation
      const wave = roundedSquareWave(t, cfg.waveSharpness + (0.2 * d) / 50, cfg.waveAmplitude, cfg.waveFrequency)
      const scale = wave + cfg.baseScale
      const tw = wave * cfg.twistAmount
      const rx = positions[i].x * scale
      const ry = positions[i].y * scale
      const cosT = Math.cos(tw)
      const sinT = Math.sin(tw)
      const px = rx * cosT - ry * sinT
      const py = rx * sinT + ry * cosT

      tempObj.position.set(px, py, 0)
      tempObj.scale.setScalar(dotScales[i])
      tempObj.updateMatrix()
      mesh.setMatrixAt(i, tempObj.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, total]}>
      <circleGeometry args={[dotRadius, dotSegments]} />
      <meshBasicMaterial color={dotColor} />
    </instancedMesh>
  )
}

/* -- Post-processing -- */
function Effects() {
  const { gl, scene, camera, size } = useThree()
  const composer = useRef()
  const blendPass = useRef()
  const savePassRef = useRef()
  const fxaaRef = useRef()
  const ringIdx = useRef(0)

  const rgbDelay = useTuningStore(s => s.rgbDelay)
  const bgColor = useTuningStore(s => s.bgColor)
  const ringSize = rgbDelay * 2 + 1

  const ringBuffer = useMemo(() => {
    return Array.from({ length: ringSize }, () =>
      new WebGLRenderTarget(1, 1, { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat })
    )
  }, [ringSize])

  useEffect(() => {
    // Render background color into WebGL so RGB channels have contrast
    // against black dots — required for temporal RGB split to be visible
    gl.setClearColor(new Color(bgColor), 1)

    const comp = new EffectComposer(gl)

    const rp = new RenderPass(scene, camera)
    rp.clearAlpha = 1
    comp.addPass(rp)

    const sp = new SavePass(ringBuffer[0])
    savePassRef.current = sp
    comp.addPass(sp)

    const bp = new ShaderPass(triColorMix)
    blendPass.current = bp
    comp.addPass(bp)

    const fp = new ShaderPass(FXAAShader)
    fxaaRef.current = fp
    comp.addPass(fp)

    const cp = new ShaderPass(CopyShader)
    cp.renderToScreen = true
    comp.addPass(cp)

    composer.current = comp
    ringIdx.current = 0

    return () => {
      comp.dispose()
      ringBuffer.forEach(rt => rt.dispose())
    }
  }, [gl, scene, camera, ringBuffer, bgColor])

  useEffect(() => {
    if (!composer.current) return
    const pr = gl.getPixelRatio()
    const pw = size.width * pr
    const ph = size.height * pr
    composer.current.setSize(size.width, size.height)
    ringBuffer.forEach(rt => rt.setSize(pw, ph))
    if (fxaaRef.current) {
      fxaaRef.current.uniforms.resolution.value.set(1 / pw, 1 / ph)
    }
  }, [size, gl, ringBuffer])

  useFrame((_, delta) => {
    if (!composer.current) return

    const cfg = useTuningStore.getState()
    const idx = ringIdx.current
    savePassRef.current.renderTarget = ringBuffer[idx]
    blendPass.current.uniforms.tPrev.value = ringBuffer[(idx - cfg.rgbDelay + ringSize) % ringSize].texture
    blendPass.current.uniforms.tPrevPrev.value = ringBuffer[(idx - cfg.rgbDelay * 2 + ringSize) % ringSize].texture
    blendPass.current.uniforms.uReverse.value = cfg.rgbSplitMode === 'rgb' ? 1.0 : 0.0
    ringIdx.current = (idx + 1) % ringSize

    composer.current.render(delta)
  }, 1)

  return null
}

/* -- FPS counter (dev only) -- */
function FPSDisplay() {
  const [fps, setFps] = useState('--')
  const frameRef = useRef(0)
  const lastRef = useRef(performance.now())

  useEffect(() => {
    let raf
    const tick = () => {
      frameRef.current++
      const now = performance.now()
      if (now - lastRef.current >= 1000) {
        setFps(`${frameRef.current} fps`)
        frameRef.current = 0
        lastRef.current = now
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div style={{
      position: 'fixed', top: 16, left: 16, zIndex: 10000,
      fontFamily: 'ui-monospace, "SF Mono", Monaco, monospace',
      fontSize: 11, color: '#666', background: 'rgba(250,250,249,0.8)',
      padding: '3px 8px', borderRadius: 4, pointerEvents: 'none',
    }}>
      {fps}
    </div>
  )
}

/* -- Camera sync -- */
function CameraSync() {
  const { camera, size } = useThree()
  const zoom = useTuningStore(s => s.zoom)

  useEffect(() => {
    camera.zoom = zoom
    const heroHeight = size.height / 2
    const offset = (heroHeight * 0.5) / zoom
    camera.position.y = -offset
    camera.updateProjectionMatrix()
  }, [camera, size, zoom])

  return null
}

/* -- Main export -- */
export default function HeroCanvas() {
  const zoom = useTuningStore(s => s.zoom)

  return (
    <>
      <Canvas
        orthographic
        camera={{ zoom, position: [0, 0, 100] }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '200%', zIndex: 0, backgroundColor: '#FAFAF9' }}
      >
        <CameraSync />
        <SunburstDots />
        <Effects />
      </Canvas>
      {import.meta.env.DEV && <FPSDisplay />}
      {import.meta.env.DEV && TuningPanel && (
        <Suspense fallback={null}>
          <TuningPanel />
        </Suspense>
      )}
    </>
  )
}
