/**
 * cmy-halftone-reveal.ts
 *
 * CMYK halftone shader, scroll-driven.
 * Plates are fully misregistered when the card is below the viewport.
 * As you scroll the card into view, plates animate into register (scrubbed
 * directly to scroll position). Once fully registered, canvas dissolves away.
 */

import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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
  uniform float     uSeparation;
  uniform float     uFrequency;

  varying vec2 vUv;

  vec2 rotUV(vec2 uv, float a) {
    float s = sin(a), c = cos(a);
    uv -= 0.5;
    uv = mat2(c, -s, s, c) * uv;
    uv += 0.5;
    return uv;
  }

  uniform float uAspect; // canvas W/H

  float halftone(vec2 uv, float density, float angle, float freq) {
    // Rescale to isotropic space (equal px/unit in both axes) BEFORE rotating
    // so cells are square in screen space and dots come out circular
    vec2 iso     = vec2(uv.x, uv.y * uAspect);
    vec2 r       = rotUV(iso, angle) * freq;
    vec2 nearest = 2.0 * fract(r) - 1.0;
    return step(length(nearest), sqrt(max(density, 0.0)));
  }

  uniform vec2 uCoverScale;
  uniform vec3 uInkC;
  uniform vec3 uInkM;
  uniform vec3 uInkY;

  // Replicate object-fit: cover — maps screen UV to centred texture UV
  vec2 coverUV(vec2 uv) {
    return (uv - 0.5) * uCoverScale + 0.5;
  }

  void main() {
    float sep = uSeparation * 0.08;

    // Screen-space UVs per plate — Y-axis offset only
    vec2 scrC = vUv + vec2(0.0, -sep);
    vec2 scrM = vUv;
    vec2 scrY = vUv + vec2(0.0,  sep);
    vec2 scrK = vUv;

    // Sample texture using cover-corrected UVs (so image isn't squished)
    vec4 sC = texture2D(uTexture, coverUV(scrC));
    vec4 sM = texture2D(uTexture, coverUV(scrM));
    vec4 sY = texture2D(uTexture, coverUV(scrY));
    vec4 sK = texture2D(uTexture, coverUV(scrK));

    float Kv    = 1.0 - max(max(sK.r, sK.g), sK.b);
    float denom = max(1.0 - Kv, 0.001);
    float C     = clamp((1.0 - sC.r - Kv) / denom, 0.0, 1.0);
    float M     = clamp((1.0 - sM.g - Kv) / denom, 0.0, 1.0);
    float Y     = clamp((1.0 - sY.b - Kv) / denom, 0.0, 1.0);

    // Halftone grid computed in screen-space UVs (so aspect correction is clean)
    float freq = uFrequency;
    float dotC = halftone(scrC, C,  radians(15.0), freq);
    float dotM = halftone(scrM, M,  radians(75.0), freq);
    float dotY = halftone(scrY, Y,  radians( 0.0), freq);
    float dotK = halftone(scrK, Kv, radians(45.0), freq);

    vec3 inkC = uInkC;
    vec3 inkM = uInkM;
    vec3 inkY = uInkY;
    vec3 inkK = vec3(0.07, 0.07, 0.06);

    vec3 result = vec3(1.0);
    result *= mix(vec3(1.0), inkC, dotC);
    result *= mix(vec3(1.0), inkM, dotM);
    result *= mix(vec3(1.0), inkY, dotY);
    result *= mix(vec3(1.0), inkK, dotK);

    gl_FragColor = vec4(result, 1.0);
  }
`

// ── CMY extraction ────────────────────────────────────────────────────────────
// Reads pixel data from the loaded image, finds pixels where each CMY channel
// dominates, and averages their RGB to get per-image ink colors.

function extractCMYColors(img: HTMLImageElement) {
  const SIZE = 120 // downsample for performance
  const offscreen = document.createElement('canvas')
  offscreen.width  = SIZE
  offscreen.height = SIZE
  const ctx = offscreen.getContext('2d')!
  ctx.drawImage(img, 0, 0, SIZE, SIZE)
  const { data } = ctx.getImageData(0, 0, SIZE, SIZE)

  const THRESHOLD = 0.18
  const MARGIN    = 0.06
  let cSum = [0, 0, 0], cN = 0
  let mSum = [0, 0, 0], mN = 0
  let ySum = [0, 0, 0], yN = 0

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]   / 255
    const g = data[i+1] / 255
    const b = data[i+2] / 255
    const C = 1 - r, M = 1 - g, Y = 1 - b

    if (C > THRESHOLD && C > M + MARGIN && C > Y + MARGIN) {
      cSum[0] += r; cSum[1] += g; cSum[2] += b; cN++
    }
    if (M > THRESHOLD && M > C + MARGIN && M > Y + MARGIN) {
      mSum[0] += r; mSum[1] += g; mSum[2] += b; mN++
    }
    if (Y > THRESHOLD && Y > C + MARGIN && Y > M + MARGIN) {
      ySum[0] += r; ySum[1] += g; ySum[2] += b; yN++
    }
  }

  return {
    c: cN > 10 ? new THREE.Vector3(cSum[0]/cN, cSum[1]/cN, cSum[2]/cN)
               : new THREE.Vector3(0.004, 0.682, 0.929),
    m: mN > 10 ? new THREE.Vector3(mSum[0]/mN, mSum[1]/mN, mSum[2]/mN)
               : new THREE.Vector3(0.894, 0.243, 0.553),
    y: yN > 10 ? new THREE.Vector3(ySum[0]/yN, ySum[1]/yN, ySum[2]/yN)
               : new THREE.Vector3(0.973, 0.953, 0.055),
  }
}

// ── Per-card setup ────────────────────────────────────────────────────────────

function setupCard(inner: HTMLElement, img: HTMLImageElement) {
  const W = inner.offsetWidth
  const H = inner.offsetHeight
  if (!W || !H) return

  // ── Renderer ──
  const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(W, H)
  renderer.setClearColor(0xfdfcfb, 1)

  const canvas = renderer.domElement
  // position:absolute takes it out of flow; explicit width/height prevent
  // the canvas pixel-size attributes from busting the card's layout
  canvas.style.position = 'absolute'
  canvas.style.inset     = '0'
  canvas.style.width     = '100%'
  canvas.style.height    = '100%'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex    = '3'
  inner.appendChild(canvas)

  // ── Scene ──
  const scene  = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const geo    = new THREE.PlaneGeometry(2, 2)

  const uniforms = {
    uTexture:    { value: null as THREE.Texture | null },
    uSeparation: { value: 1.5 },
    uFrequency:  { value: 65.0 },
    uCoverScale: { value: new THREE.Vector2(1, 1) },
    uAspect:     { value: W / H },
    // Per-image ink colors — set after pixel extraction
    uInkC: { value: new THREE.Vector3(0.004, 0.682, 0.929) }, // fallback: process cyan
    uInkM: { value: new THREE.Vector3(0.894, 0.243, 0.553) }, // fallback: process magenta
    uInkY: { value: new THREE.Vector3(0.973, 0.953, 0.055) }, // fallback: process yellow
  }

  const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms })
  scene.add(new THREE.Mesh(geo, mat))

  let rafId: number | null = null
  let done = false

  function startRender() {
    if (rafId !== null || done) return
    ;(function loop() {
      rafId = requestAnimationFrame(loop)
      renderer.render(scene, camera)
    })()
  }

  function stopRender() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
  }

  function teardown() {
    done = true
    stopRender()
    canvas.remove()
    renderer.dispose()
  }

  // ── Texture — create directly from the already-loaded img element ──
  // Avoids a second HTTP fetch and works reliably with Astro's /_image URLs
  const tex = new THREE.Texture(img)
  tex.minFilter      = THREE.LinearFilter
  tex.generateMipmaps = false
  tex.needsUpdate    = true
  uniforms.uTexture.value = tex

  // Extract per-image CMY ink colors from actual pixel data
  const { c, m, y } = extractCMYColors(img)
  uniforms.uInkC.value = c
  uniforms.uInkM.value = m
  uniforms.uInkY.value = y

  // Cover scale: replicate object-fit: cover
  const imgAspect    = img.naturalWidth / img.naturalHeight
  const canvasAspect = W / H
  if (canvasAspect < imgAspect) {
    uniforms.uCoverScale.value.set(canvasAspect / imgAspect, 1.0)
  } else {
    uniforms.uCoverScale.value.set(1.0, imgAspect / canvasAspect)
  }

  startRender()

  // ── Scroll-driven separation ──
  // progress 0→1 as card scrolls into view.
  // separation: 1.5→0 (plates register)
  // canvas opacity: stays 1 until 80% progress, then fades to 0 (reveal real image)
  // fully reversible — scrolling back up restores both
  const proxy = { progress: 0 }

  gsap.to(proxy, {
    progress: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: inner,
      start: 'top bottom',
      end:   'top 25%',
      scrub: 1.5,
    },
    onUpdate: () => {
      const p = proxy.progress
      uniforms.uSeparation.value = 1.5 * (1 - p)
      // Hold full opacity until 80% through, then fade canvas away
      canvas.style.opacity = p < 0.8 ? '1' : String(1 - (p - 0.8) / 0.2)
    },
  })
}

// ── Public init ───────────────────────────────────────────────────────────────

export function initCmyHalftoneReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  document.querySelectorAll<HTMLElement>('[data-work-card]').forEach((card) => {
    const inner = card.querySelector<HTMLElement>('.work-card-inner')
    const img   = inner?.querySelector<HTMLImageElement>('img')
    if (!inner || !img) return

    if (img.complete && img.naturalWidth > 0) {
      setupCard(inner, img)
    } else {
      img.addEventListener('load', () => setupCard(inner, img), { once: true })
    }
  })
}
