import { defineToolbarApp } from 'astro/toolbar'
import { roles, primitives } from '../data/tokens'

/* ── Role config from tokens ── */
const ROLE_LABELS: Record<string, string> = {
  'prose-title-lg': 'Title (L)',
  'prose-heading-lg': 'Heading (L)',
  'prose-subhead-lg': 'Subhead (L)',
  'prose-title-sm': 'Title (S)',
  'prose-heading-sm': 'Heading (S)',
  'prose-body': 'Body',
  'ui-nav-item-lg': 'Nav Item',
  'ui-nav-section': 'Nav Section',
}

interface RoleCfg {
  key: string
  label: string
  defaultFamily: string
  defaultWeight: number
  defaultTracking: number
}

const ROLES: RoleCfg[] = Object.entries(roles).map(([name, cfg]) => {
  const c = cfg as { family: string; weight: number; tracking: number }
  return {
    key: name,
    label: ROLE_LABELS[name] || name,
    defaultFamily: c.family,
    defaultWeight: c.weight,
    defaultTracking: c.tracking,
  }
})

/* ── Font registry ── */
const FONTS = [
  { label: 'PP Editorial New', value: '"PP Editorial New", serif', variable: false },
  { label: 'PP Neue Montreal', value: '"PP Neue Montreal", sans-serif', variable: false },
  { label: 'PP Frama', value: '"PP Frama", sans-serif', variable: false },
  { label: 'PP Monument Extended', value: '"PP Monument Extended", sans-serif', variable: false },
  { label: 'PP Monument Normal', value: '"PP Monument Normal", sans-serif', variable: false },
  { label: 'PP Mori', value: '"PP Mori", sans-serif', variable: false },
  { label: 'PP Neue Corp', value: '"PP Neue Corp", sans-serif', variable: false },
  { label: 'PP Watch', value: '"PP Watch", sans-serif', variable: false },
]

/* ── Override storage ── */
interface RoleOverrides {
  family?: string
  weight?: number
  tracking?: string
  transform?: string
  stretch?: string
}
type AllOverrides = Record<string, RoleOverrides>

const CSS_PROPS = ['family', 'weight', 'tracking', 'transform', 'stretch'] as const
const STORAGE_KEY = 'dev-font-overrides'

function loadOverrides(): AllOverrides {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}
function saveOverrides(all: AllOverrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}
function applyOverridesToCSS(role: string, ov: RoleOverrides) {
  const s = document.documentElement.style
  for (const prop of CSS_PROPS) {
    if (ov[prop] != null) s.setProperty(`--typo-${role}-${prop}`, String(ov[prop]))
  }
}
function clearRoleCSS(role: string) {
  const s = document.documentElement.style
  for (const prop of CSS_PROPS) s.removeProperty(`--typo-${role}-${prop}`)
}
function fmtTracking(v: number): string {
  return v === 0 ? '0em' : v.toFixed(2) + 'em'
}

/* ── Toolbar App ── */
export default defineToolbarApp({
  init(canvas, app) {
    // Clean up old format
    localStorage.removeItem('dev-font-serif')
    localStorage.removeItem('dev-font-sans')

    let overrides = loadOverrides()

    // Apply stored overrides immediately
    for (const [role, ov] of Object.entries(overrides)) applyOverridesToCSS(role, ov)

    /* ── Build UI ── */
    const style = document.createElement('style')
    style.textContent = `
      :host { font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #fff; }

      .fs-panel { padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; width: 280px; }

      .fs-header { font-size: 13px; font-weight: 600; margin: 0 0 2px; }

      select, input[type="range"] { accent-color: #a78bfa; }

      select {
        width: 100%;
        padding: 5px 6px;
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,0.15);
        background: rgba(255,255,255,0.08);
        color: #fff;
        font-size: 12px;
        cursor: pointer;
      }
      select option { background: #1e1e2e; color: #fff; }

      .fs-controls { display: flex; flex-direction: column; gap: 8px; }

      .fs-field { display: flex; align-items: center; gap: 8px; }
      .fs-field-label {
        width: 44px;
        flex-shrink: 0;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: rgba(255,255,255,0.55);
      }
      .fs-field select { flex: 1; min-width: 0; }

      .fs-range-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .fs-range-wrap input[type="range"] {
        flex: 1;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: rgba(255,255,255,0.15);
        border-radius: 2px;
        cursor: pointer;
      }
      .fs-range-wrap input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px; height: 12px;
        border-radius: 50%;
        background: #a78bfa;
        cursor: pointer;
      }
      .fs-range-wrap output {
        width: 40px;
        text-align: right;
        font-size: 10px;
        font-variant-numeric: tabular-nums;
        color: rgba(255,255,255,0.65);
      }

      .fs-check-field label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: rgba(255,255,255,0.75);
        cursor: pointer;
        padding-left: 52px;
      }
      .fs-check-field input[type="checkbox"] { margin: 0; cursor: pointer; accent-color: #a78bfa; }

      .fs-field[hidden] { display: none; }

      .fs-actions {
        display: flex;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(255,255,255,0.08);
      }
      .fs-actions button {
        flex: 1;
        padding: 4px 0;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 4px;
        background: rgba(255,255,255,0.05);
        font-size: 10px;
        color: rgba(255,255,255,0.55);
        cursor: pointer;
        text-align: center;
      }
      .fs-actions button:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
      }
    `
    canvas.appendChild(style)

    const win = document.createElement('astro-dev-toolbar-window')

    const panel = document.createElement('div')
    panel.className = 'fs-panel'
    panel.innerHTML = `
      <div class="fs-header">Typography</div>
      <select id="fs-role" aria-label="Typography role"></select>
      <div class="fs-controls">
        <div class="fs-field">
          <span class="fs-field-label">Font</span>
          <select id="fs-family"></select>
        </div>
        <div class="fs-field">
          <span class="fs-field-label">Weight</span>
          <div class="fs-range-wrap">
            <input type="range" id="fs-weight" min="100" max="900" step="100" />
            <output id="fs-weight-out">400</output>
          </div>
        </div>
        <div class="fs-field">
          <span class="fs-field-label">Track</span>
          <div class="fs-range-wrap">
            <input type="range" id="fs-tracking" min="-0.1" max="0.2" step="0.01" />
            <output id="fs-tracking-out">0em</output>
          </div>
        </div>
        <div class="fs-check-field">
          <label><input type="checkbox" id="fs-caps" /> Uppercase</label>
        </div>
        <div class="fs-field" id="fs-stretch-field" hidden>
          <span class="fs-field-label">Width</span>
          <div class="fs-range-wrap">
            <input type="range" id="fs-stretch" min="50" max="200" step="5" />
            <output id="fs-stretch-out">100%</output>
          </div>
        </div>
      </div>
      <div class="fs-actions">
        <button id="fs-reset-role">Reset role</button>
        <button id="fs-reset-all">Reset all</button>
      </div>
    `

    win.appendChild(panel)
    canvas.appendChild(win)

    /* ── Query elements inside the shadow root ── */
    const $ = <T extends Element>(id: string) => panel.querySelector<T>(`#${id}`)!
    const roleSelect = $<HTMLSelectElement>('fs-role')
    const familySelect = $<HTMLSelectElement>('fs-family')
    const weightRange = $<HTMLInputElement>('fs-weight')
    const weightOut = $<HTMLOutputElement>('fs-weight-out')
    const trackingRange = $<HTMLInputElement>('fs-tracking')
    const trackingOut = $<HTMLOutputElement>('fs-tracking-out')
    const capsCheck = $<HTMLInputElement>('fs-caps')
    const stretchField = $<HTMLDivElement>('fs-stretch-field')
    const stretchRange = $<HTMLInputElement>('fs-stretch')
    const stretchOut = $<HTMLOutputElement>('fs-stretch-out')
    const resetRoleBtn = $<HTMLButtonElement>('fs-reset-role')
    const resetAllBtn = $<HTMLButtonElement>('fs-reset-all')

    /* ── Populate dropdowns ── */
    for (const r of ROLES) {
      const opt = document.createElement('option')
      opt.value = r.key
      opt.textContent = r.label + (overrides[r.key] ? ' \u2022' : '')
      roleSelect.appendChild(opt)
    }
    for (const f of FONTS) {
      const opt = document.createElement('option')
      opt.value = f.value
      opt.textContent = f.label
      familySelect.appendChild(opt)
    }

    /* ── Show/hide width based on variable font ── */
    function updateStretchVisibility() {
      const font = FONTS.find(f => f.value === familySelect.value)
      stretchField.hidden = !font?.variable
    }

    /* ── Load controls for a role ── */
    function showRole(roleKey: string) {
      const cfg = ROLES.find(r => r.key === roleKey)!
      const ov = overrides[roleKey]

      familySelect.value = ov?.family || cfg.defaultFamily
      weightRange.value = String(ov?.weight ?? cfg.defaultWeight)
      weightOut.textContent = weightRange.value

      const trackVal = ov?.tracking ? parseFloat(ov.tracking) : cfg.defaultTracking
      trackingRange.value = String(trackVal)
      trackingOut.textContent = fmtTracking(trackVal)

      capsCheck.checked = ov?.transform === 'uppercase'
      stretchRange.value = String(ov?.stretch ? parseInt(ov.stretch) : 100)
      stretchOut.textContent = stretchRange.value + '%'

      updateStretchVisibility()
    }

    /* ── Save current controls as override ── */
    function saveCurrentRole() {
      const roleKey = roleSelect.value
      const ov: RoleOverrides = {
        family: familySelect.value,
        weight: parseInt(weightRange.value),
        tracking: parseFloat(trackingRange.value).toFixed(2) + 'em',
        transform: capsCheck.checked ? 'uppercase' : 'none',
      }
      const font = FONTS.find(f => f.value === familySelect.value)
      if (font?.variable) ov.stretch = stretchRange.value + '%'

      overrides[roleKey] = ov
      applyOverridesToCSS(roleKey, ov)
      saveOverrides(overrides)
      updateRoleLabels()
    }

    /* ── Mark modified roles in dropdown ── */
    function updateRoleLabels() {
      for (let i = 0; i < ROLES.length; i++) {
        const r = ROLES[i]
        roleSelect.options[i].textContent = r.label + (overrides[r.key] ? ' \u2022' : '')
      }
    }

    /* ── Show notification badge if any overrides exist ── */
    function updateNotification() {
      const hasOverrides = Object.keys(overrides).length > 0
      app.toggleNotification({ state: hasOverrides, level: 'info' })
    }

    /* ── Initial state ── */
    showRole(ROLES[0].key)
    updateNotification()

    /* ── Event listeners ── */
    roleSelect.addEventListener('change', () => showRole(roleSelect.value))

    familySelect.addEventListener('change', () => {
      updateStretchVisibility()
      saveCurrentRole()
      updateNotification()
    })

    weightRange.addEventListener('input', () => {
      weightOut.textContent = weightRange.value
      saveCurrentRole()
    })

    trackingRange.addEventListener('input', () => {
      trackingOut.textContent = fmtTracking(parseFloat(trackingRange.value))
      saveCurrentRole()
    })

    capsCheck.addEventListener('change', () => {
      saveCurrentRole()
    })

    stretchRange.addEventListener('input', () => {
      stretchOut.textContent = stretchRange.value + '%'
      saveCurrentRole()
    })

    resetRoleBtn.addEventListener('click', () => {
      const roleKey = roleSelect.value
      delete overrides[roleKey]
      clearRoleCSS(roleKey)
      saveOverrides(overrides)
      showRole(roleKey)
      updateRoleLabels()
      updateNotification()
    })

    resetAllBtn.addEventListener('click', () => {
      for (const roleKey of Object.keys(overrides)) clearRoleCSS(roleKey)
      overrides = {}
      saveOverrides(overrides)
      showRole(roleSelect.value)
      updateRoleLabels()
      updateNotification()
    })
  },
})
