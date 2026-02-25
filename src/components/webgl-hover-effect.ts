/**
 * webgl-hover-effect.ts
 *
 * Chromatic aberration hover effect for work card images.
 * Based on https://github.com/akella/webgl-mouseover-effects
 *
 * Per-card WebGL canvas overlays the image on hover.
 * Mouse velocity drives the intensity of the RGB channel split.
 * All tuneable values read from animation.config.json → animations.workHover
 */

import * as THREE from 'three'
import { animations } from '../data/tokens'

const cfg = animations.workHover

// ── Shaders ──────────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uVelo;
  uniform vec2 uResolution;
  uniform vec2 uCoverScale;
  uniform float uRadius;
  uniform vec3 uChannelSpread;

  varying vec2 vUv;

  float circle(vec2 uv, vec2 center, float radius, float border) {
    uv -= center;
    uv *= uResolution;
    float dist = length(uv);
    return smoothstep(radius + border, radius - border, dist);
  }

  vec2 coverUV(vec2 uv) {
    return (uv - 0.5) * uCoverScale + 0.5;
  }

  void main() {
    vec2 newUV = vUv;
    float c = circle(newUV, uMouse, 0.0, uRadius);

    // Chromatic aberration: sample R, G, B at progressively offset UVs
    float r = texture2D(uTexture, coverUV(newUV += c * (uVelo * uChannelSpread.x))).x;
    float g = texture2D(uTexture, coverUV(newUV += c * (uVelo * uChannelSpread.y))).y;
    float b = texture2D(uTexture, coverUV(newUV += c * (uVelo * uChannelSpread.z))).z;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`

// ── Per-card state ───────────────────────────────────────────────────────────

interface CardState {
  renderer: THREE.WebGLRenderer
  canvas: HTMLCanvasElement
  uniforms: {
    uTexture: { value: THREE.Texture | null }
    uMouse: { value: THREE.Vector2 }
    uVelo: { value: number }
    uResolution: { value: THREE.Vector2 }
    uCoverScale: { value: THREE.Vector2 }
    uRadius: { value: number }
    uChannelSpread: { value: THREE.Vector3 }
  }
  scene: THREE.Scene
  camera: THREE.OrthographicCamera
  rafId: number | null
  targetSpeed: number
  mouse: { x: number; y: number }
  prevMouse: { x: number; y: number }
  followMouse: THREE.Vector2
  hovered: boolean
}

function setupCard(inner: HTMLElement, img: HTMLImageElement): CardState | null {
  const W = inner.offsetWidth
  const H = inner.offsetHeight
  if (!W || !H) return null

  const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, cfg.maxDpr))
  renderer.setSize(W, H)
  renderer.setClearColor(0xfdfcfb, 1)

  const canvas = renderer.domElement
  canvas.style.position = 'absolute'
  canvas.style.inset = '0'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '2'
  canvas.style.opacity = '0'
  canvas.style.transition = `opacity ${cfg.fadeDuration}s ease`
  inner.appendChild(canvas)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const geo = new THREE.PlaneGeometry(2, 2)

  const uniforms = {
    uTexture: { value: null as THREE.Texture | null },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uVelo: { value: 0 },
    uResolution: { value: new THREE.Vector2(1.0, H / W) },
    uCoverScale: { value: new THREE.Vector2(1, 1) },
    uRadius: { value: cfg.radius },
    uChannelSpread: { value: new THREE.Vector3(cfg.channelSpread.r, cfg.channelSpread.g, cfg.channelSpread.b) },
  }

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
  })
  scene.add(new THREE.Mesh(geo, mat))

  // Texture from the already-loaded img element
  const tex = new THREE.Texture(img)
  tex.minFilter = THREE.LinearFilter
  tex.generateMipmaps = false
  tex.needsUpdate = true
  uniforms.uTexture.value = tex

  // Cover scale: replicate object-fit: cover
  const imgAspect = img.naturalWidth / img.naturalHeight
  const canvasAspect = W / H
  if (canvasAspect < imgAspect) {
    uniforms.uCoverScale.value.set(canvasAspect / imgAspect, 1.0)
  } else {
    uniforms.uCoverScale.value.set(1.0, imgAspect / canvasAspect)
  }

  return {
    renderer,
    canvas,
    uniforms,
    scene,
    camera,
    rafId: null,
    targetSpeed: 0,
    mouse: { x: 0.5, y: 0.5 },
    prevMouse: { x: 0.5, y: 0.5 },
    followMouse: new THREE.Vector2(0.5, 0.5),
    hovered: false,
  }
}

function startRenderLoop(state: CardState) {
  if (state.rafId !== null) return

  function loop() {
    state.rafId = requestAnimationFrame(loop)

    // Smooth mouse following
    state.followMouse.x += cfg.mouseSmoothing * (state.mouse.x - state.followMouse.x)
    state.followMouse.y += cfg.mouseSmoothing * (state.mouse.y - state.followMouse.y)

    // Compute velocity
    const dx = state.mouse.x - state.prevMouse.x
    const dy = state.mouse.y - state.prevMouse.y
    const speed = Math.sqrt(dx * dx + dy * dy)
    state.targetSpeed += cfg.speedSmoothing * (speed - state.targetSpeed)
    state.targetSpeed *= cfg.speedDecay
    state.prevMouse.x = state.mouse.x
    state.prevMouse.y = state.mouse.y

    // Update uniforms
    state.uniforms.uMouse.value.copy(state.followMouse)
    state.uniforms.uVelo.value = Math.min(state.targetSpeed, cfg.maxVelocity)

    state.renderer.render(state.scene, state.camera)

    // Stop rendering once velocity decays and not hovered
    if (!state.hovered && state.targetSpeed < cfg.idleThreshold) {
      stopRenderLoop(state)
      state.canvas.style.opacity = '0'
    }
  }

  loop()
}

function stopRenderLoop(state: CardState) {
  if (state.rafId !== null) {
    cancelAnimationFrame(state.rafId)
    state.rafId = null
  }
}

// ── Public init ──────────────────────────────────────────────────────────────

export function initWebGLHoverEffect() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // Skip on touch-only devices
  if (!window.matchMedia('(hover: hover)').matches) return

  document.querySelectorAll<HTMLElement>('[data-work-card]').forEach((card) => {
    if (card.dataset.webglHoverBound === 'true') return
    card.dataset.webglHoverBound = 'true'

    const inner = card.querySelector<HTMLElement>('.work-card-inner')
    const img = inner?.querySelector<HTMLImageElement>('img')
    if (!inner || !img) return

    let state: CardState | null = null

    function ensureState() {
      if (!state && img!.complete && img!.naturalWidth > 0) {
        state = setupCard(inner!, img!)
      }
      return state
    }

    inner.addEventListener('mouseenter', () => {
      const s = ensureState()
      if (!s) return
      s.hovered = true
      s.canvas.style.opacity = '1'
      startRenderLoop(s)
    })

    inner.addEventListener('mousemove', (e: MouseEvent) => {
      if (!state) return
      const rect = inner!.getBoundingClientRect()
      state.mouse.x = (e.clientX - rect.left) / rect.width
      state.mouse.y = 1.0 - (e.clientY - rect.top) / rect.height // flip Y for GL
    })

    inner.addEventListener('mouseleave', () => {
      if (!state) return
      state.hovered = false
      // Render loop continues until velocity decays, then hides canvas
    })
  })
}
