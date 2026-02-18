import React, { useRef, useEffect, useState } from 'react'
import {
  Scene, OrthographicCamera, Color,
  WebGLRenderer, WebGLRenderTarget, LinearFilter, RGBAFormat,
  InstancedMesh, CircleGeometry, MeshBasicMaterial,
} from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import animConfig from '../data/animations.json'

const cfg = animConfig.hero.canvas

const TWO_PI = Math.PI * 2
const PHI = (1 + Math.sqrt(5)) / 2

const roundedSquareWave = (t, delta, a, f) =>
  ((2 * a) / Math.PI) * Math.atan(Math.sin(TWO_PI * t * f) / delta)

/* -- Arrangement generators (flat typed arrays) -- */
function generateSpiral(numRays, dotsPerRay, spacing) {
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

function generateConcentric(numRays, dotsPerRay, spacing, innerRadius) {
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

function generateHexagonal(_numRays, dotsPerRay, spacing) {
  const maxR = dotsPerRay * spacing
  const rowH = spacing * Math.sqrt(3) / 2
  const rows = Math.ceil(maxR * 2 / rowH)
  const tmpX = [], tmpY = [], tmpD = []
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

function generateRose(numRays, dotsPerRay, spacing) {
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

/* -- Build the scene -- */
function createHeroScene() {
  const gen = generators[cfg.arrangement] || generators.concentric
  const { posX, posY, dist, total } = gen(cfg.numRays, cfg.dotsPerRay, cfg.spacing, cfg.innerRadius)

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
  const material = new MeshBasicMaterial({ color: cfg.dotColor })
  const mesh = new InstancedMesh(geometry, material, total)
  scene.add(mesh)

  return { scene, mesh, posX, posY, dist, dotScales, total }
}

/* -- Main export -- */
export default function HeroCanvas() {
  const containerRef = useRef(null)
  const [webglSupported, setWebglSupported] = useState(true)

  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas')
      const testGl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl')
      if (!testGl) { setWebglSupported(false); return }
    } catch { setWebglSupported(false); return }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !webglSupported) return

    // Renderer
    const dpr = Math.min(window.devicePixelRatio, cfg.maxDpr)
    const renderer = new WebGLRenderer({ antialias: false, alpha: false })
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(new Color(cfg.bgColor), 1)
    container.appendChild(renderer.domElement)
    renderer.domElement.style.display = 'block'

    // Camera
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000)
    camera.position.set(0, 0, 100)
    camera.zoom = cfg.zoom

    // Scene + dots
    const { scene, mesh, posX, posY, dist, dotScales, total } = createHeroScene()
    const matArr = mesh.instanceMatrix.array

    // Post-processing (4 passes — no redundant CopyPass)
    const ringSize = Math.round(cfg.rgbDelay * 2 + 1)
    const ringBuffer = Array.from({ length: ringSize }, () =>
      new WebGLRenderTarget(1, 1, { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat })
    )

    const composer = new EffectComposer(renderer)

    const renderPass = new RenderPass(scene, camera)
    renderPass.clearAlpha = 1
    composer.addPass(renderPass)

    const savePass = new SavePass(ringBuffer[0])
    composer.addPass(savePass)

    const blendPass = new ShaderPass(triColorMix)
    composer.addPass(blendPass)

    const fxaaPass = new ShaderPass(FXAAShader)
    fxaaPass.renderToScreen = true
    composer.addPass(fxaaPass)

    let ringIdx = 0
    let warmup = 0

    // Visibility tracking — pause RAF when hero is off-screen
    let isVisible = true
    let hiddenAt = 0
    let pauseAccum = 0

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible
        isVisible = entry.isIntersecting
        if (!isVisible && wasVisible) {
          cancelAnimationFrame(frameId)
          hiddenAt = performance.now()
        } else if (isVisible && !wasVisible) {
          pauseAccum += performance.now() - hiddenAt
          frameId = requestAnimationFrame(tick)
        }
      },
      { threshold: 0 }
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
      ringBuffer.forEach(rt => rt.setSize(pw, ph))
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
    let frameId = 0
    const startTime = performance.now()

    function tick() {
      frameId = requestAnimationFrame(tick)

      const elapsed = (performance.now() - startTime - pauseAccum) / 1000
      const time = cfg.wavePaused ? 0 : elapsed

      // Update instanced dot matrices directly (skip Object3D overhead)
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
        matArr[o]      = s    // scaleX
        matArr[o + 5]  = s    // scaleY
        matArr[o + 10] = s    // scaleZ
        matArr[o + 12] = px * cosT - py * sinT // positionX
        matArr[o + 13] = px * sinT + py * cosT // positionY
      }
      mesh.instanceMatrix.needsUpdate = true

      // Temporal RGB split
      const idx = ringIdx

      if (warmup < ringSize) {
        warmup++
        blendPass.uniforms.tPrev.value = ringBuffer[idx].texture
        blendPass.uniforms.tPrevPrev.value = ringBuffer[idx].texture
      } else {
        blendPass.uniforms.tPrev.value = ringBuffer[(idx - Math.round(cfg.rgbDelay) + ringSize) % ringSize].texture
        blendPass.uniforms.tPrevPrev.value = ringBuffer[(idx - Math.round(cfg.rgbDelay) * 2 + ringSize) % ringSize].texture
      }

      savePass.renderTarget = ringBuffer[idx]
      blendPass.uniforms.uReverse.value = cfg.rgbSplitMode === 'rgb' ? 1.0 : 0.0
      ringIdx = (idx + 1) % ringSize

      composer.render(1 / 60)
    }

    tick()

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      ro.disconnect()
      composer.dispose()
      ringBuffer.forEach(rt => rt.dispose())
      mesh.geometry.dispose()
      mesh.material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }
  }, [webglSupported])

  if (!webglSupported) return null

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, backgroundColor: cfg.bgColor }}
    />
  )
}
