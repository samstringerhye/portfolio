import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useTuningStore } from './store.js'
import heroSchema, { presets } from './heroSchema.js'

const PANEL_WIDTH = 280

/* -- Reusable input components for each schema type -- */

function Tooltip({ itemKey, info, hoveredTooltip, setHoveredTooltip }) {
  if (!info) return null
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', marginLeft: 4 }}
      onMouseEnter={() => setHoveredTooltip(itemKey)}
      onMouseLeave={() => setHoveredTooltip(null)}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 13, height: 13, borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)', color: '#666',
        fontSize: 9, fontWeight: 600, cursor: 'default', lineHeight: 1,
      }}>?</span>
      {hoveredTooltip === itemKey && (
        <span style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: 6, padding: '5px 8px', borderRadius: 4,
          background: 'rgba(0,0,0,0.9)', color: '#ddd',
          fontSize: 10, lineHeight: '1.35', whiteSpace: 'nowrap',
          pointerEvents: 'none', zIndex: 10001,
        }}>{info}</span>
      )}
    </span>
  )
}

function GroupHeader({ item, idx }) {
  return (
    <div style={{
      marginTop: idx > 0 ? 14 : 0,
      marginBottom: 8,
      paddingTop: idx > 0 ? 10 : 0,
      borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
      fontSize: 10,
      fontWeight: 600,
      color: '#777',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {item.label}
    </div>
  )
}

function ActionInput({ item, value, setVal }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <button
        onClick={() => setVal(item.key, (value ?? 0) + 1)}
        style={{
          width: '100%',
          padding: '6px 0',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(100,200,255,0.12)',
          color: '#aadcff',
          fontSize: 11,
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        {item.label}
      </button>
    </div>
  )
}

function SelectInput({ item, value, setVal, tooltip }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
        <span style={{ color: '#999' }}>{item.label}</span>
        {tooltip}
      </div>
      <select
        value={value}
        onChange={e => setVal(item.key, e.target.value)}
        style={{
          width: '100%',
          padding: '4px 6px',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.06)',
          color: '#ccc',
          fontSize: 11,
          fontFamily: 'inherit',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {item.options.map(opt => (
          <option key={opt} value={opt} style={{ background: '#222' }}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

function ToggleInput({ item, value, setVal, tooltip }) {
  return (
    <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ display: 'flex', alignItems: 'center', color: '#999' }}>
        {item.label}
        {tooltip}
      </span>
      <button
        onClick={() => setVal(item.key, !value)}
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.15)',
          background: value ? 'rgba(100,200,255,0.35)' : 'rgba(255,255,255,0.06)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.15s',
          padding: 0,
          flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute',
          top: 2,
          left: value ? 18 : 2,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: value ? '#fff' : '#666',
          transition: 'left 0.15s, background 0.15s',
        }} />
      </button>
    </div>
  )
}

function ColorInput({ item, value, setVal, tooltip }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <span style={{ display: 'flex', alignItems: 'center', color: '#999' }}>
          {item.label}
          {tooltip}
        </span>
        <span style={{ color: '#fff', fontVariantNumeric: 'tabular-nums', fontSize: 10 }}>{value}</span>
      </div>
      <input
        type="color"
        value={value}
        onChange={e => setVal(item.key, e.target.value)}
        style={{
          width: '100%',
          height: 24,
          padding: 0,
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 4,
          background: 'none',
          cursor: 'pointer',
        }}
      />
    </div>
  )
}

function RangeInput({ item, value, setVal, tooltip }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <span style={{ display: 'flex', alignItems: 'center', color: '#999' }}>
          {item.label}
          {tooltip}
        </span>
        <span style={{ color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
          {typeof value === 'number' ? value.toFixed(3) : value}
        </span>
      </div>
      <input
        type="range"
        min={item.min}
        max={item.max}
        step={item.step}
        value={value}
        onChange={e => setVal(item.key, parseFloat(e.target.value))}
        style={{
          width: '100%',
          height: 4,
          appearance: 'none',
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 2,
          outline: 'none',
          cursor: 'pointer',
        }}
      />
    </div>
  )
}

const INPUT_COMPONENTS = {
  action: ActionInput,
  select: SelectInput,
  toggle: ToggleInput,
  color: ColorInput,
  range: RangeInput,
}

/* -- Main panel -- */

export default function TuningPanel() {
  const [visible, setVisible] = useState(false)
  const [hoveredTooltip, setHoveredTooltip] = useState(null)
  const [saveConfirm, setSaveConfirm] = useState(false)
  const fileInputRef = useRef(null)

  const storeState = useTuningStore()
  const { set: setVal, reset, applyPreset, exportJSON, importJSON } = useTuningStore(
    useShallow(s => ({
      set: s.set,
      reset: s.reset,
      applyPreset: s.applyPreset,
      exportJSON: s.exportJSON,
      importJSON: s.importJSON,
    }))
  )

  const resolved = useMemo(() => {
    const vals = {}
    for (const item of heroSchema) {
      if (item.key) vals[item.key] = storeState[item.key] ?? item.default
    }
    return vals
  }, [storeState])

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        setVisible(v => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleExport = useCallback(() => {
    const json = exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hero-tunables.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [exportJSON])

  const handleSave = useCallback(() => {
    const json = exportJSON()
    localStorage.setItem('hero-tunables-saved', json)
    setSaveConfirm(true)
    setTimeout(() => setSaveConfirm(false), 1500)
  }, [exportJSON])

  const handleImport = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const success = importJSON(reader.result)
      if (!success) console.warn('[TuningPanel] Failed to parse imported JSON')
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [importJSON])

  return (
    <>
      {/* Gear icon toggle */}
      <button
        onClick={() => setVisible(v => !v)}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 10000,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(20,20,20,0.7)',
          color: '#aaa',
          fontSize: 18,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
        }}
        title="Toggle Tuning Panel (Ctrl+Shift+T)"
      >
        {'\u2699'}
      </button>

      {/* Panel */}
      {visible && (
        <div style={{
          position: 'fixed',
          bottom: 60,
          right: 16,
          zIndex: 10000,
          width: PANEL_WIDTH,
          maxHeight: '70vh',
          overflowY: 'auto',
          background: 'rgba(20,20,20,0.92)',
          backdropFilter: 'blur(12px)',
          borderRadius: 10,
          padding: '16px 14px',
          fontFamily: 'ui-monospace, "SF Mono", Monaco, monospace',
          fontSize: 11,
          color: '#ccc',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 12, color: '#fff' }}>
            Hero Tunables
          </div>

          {/* Presets */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {Object.entries(presets).map(([name, values]) => (
              <button
                key={name}
                onClick={() => applyPreset(values)}
                style={{
                  flex: 1,
                  padding: '5px 0',
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#bbb',
                  fontSize: 10,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Controls */}
          {heroSchema.map((item, idx) => {
            const type = item.type || 'range'

            if (type === 'group') {
              return <GroupHeader key={`group-${idx}`} item={item} idx={idx} />
            }

            if (item.visibleWhen) {
              const dep = resolved[item.visibleWhen.key]
              if (!item.visibleWhen.values.includes(dep)) return null
            }

            const value = resolved[item.key] ?? item.default
            const tooltip = (
              <Tooltip
                itemKey={item.key}
                info={item.info}
                hoveredTooltip={hoveredTooltip}
                setHoveredTooltip={setHoveredTooltip}
              />
            )

            const InputComponent = INPUT_COMPONENTS[type] || RangeInput
            return (
              <InputComponent
                key={item.key}
                item={item}
                value={value}
                setVal={setVal}
                tooltip={tooltip}
              />
            )
          })}

          {/* Actions */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            <button onClick={handleSave} style={{
              ...actionBtnStyle,
              ...(saveConfirm ? { background: 'rgba(52,211,153,0.2)', color: '#6ee7b7', borderColor: 'rgba(52,211,153,0.3)' } : {}),
            }}>
              {saveConfirm ? 'Saved!' : 'Save'}
            </button>
            <button onClick={reset} style={actionBtnStyle}>Reset</button>
            <button onClick={handleExport} style={actionBtnStyle}>Export</button>
            <button onClick={() => fileInputRef.current?.click()} style={actionBtnStyle}>Import</button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>
      )}
    </>
  )
}

const actionBtnStyle = {
  padding: '4px 10px',
  borderRadius: 4,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.04)',
  color: '#999',
  fontSize: 10,
  fontFamily: 'inherit',
  cursor: 'pointer',
}
