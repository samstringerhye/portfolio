import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import heroSchema from './heroSchema.js'

// Extract defaults from schema
const defaults = {}
for (const item of heroSchema) {
  if (item.key) defaults[item.key] = item.default
}

export const useTuningStore = create(
  persist(
    (set, get) => ({
      ...defaults,

      set(key, value) {
        set({ [key]: value })
      },

      reset() {
        set(defaults)
      },

      applyPreset(values) {
        set({ ...defaults, ...values })
      },

      exportJSON() {
        const state = get()
        const data = {}
        for (const item of heroSchema) {
          if (item.key) data[item.key] = state[item.key]
        }
        return JSON.stringify(data, null, 2)
      },

      importJSON(json) {
        try {
          const data = JSON.parse(json)
          const clamped = {}
          for (const item of heroSchema) {
            if (!item.key || !(item.key in data)) continue
            if (typeof item.min === 'number' && typeof item.max === 'number') {
              clamped[item.key] = Math.min(Math.max(data[item.key], item.min), item.max)
            } else {
              clamped[item.key] = data[item.key]
            }
          }
          set(clamped)
          return true
        } catch {
          return false
        }
      },
    }),
    {
      name: 'hero-tunables',
      version: 1,
      migrate: () => ({ ...defaults }),
      partialize: (state) => {
        const data = {}
        for (const item of heroSchema) {
          if (item.key) data[item.key] = state[item.key]
        }
        return data
      },
    }
  )
)

export default useTuningStore
