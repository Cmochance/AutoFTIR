import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChartFormat, ChartStyle } from '@/services/analyzeApi'

interface SettingsState {
  defaultStyle: ChartStyle
  defaultExportFormat: ChartFormat
  useGrounding: boolean
  useKnowledge: boolean
  setDefaultStyle: (style: ChartStyle) => void
  setDefaultExportFormat: (format: ChartFormat) => void
  setUseGrounding: (enabled: boolean) => void
  setUseKnowledge: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultStyle: 'scientific',
      defaultExportFormat: 'png',
      useGrounding: true,
      useKnowledge: true,
      setDefaultStyle: (defaultStyle) => set({ defaultStyle }),
      setDefaultExportFormat: (defaultExportFormat) => set({ defaultExportFormat }),
      setUseGrounding: (useGrounding) => set({ useGrounding }),
      setUseKnowledge: (useKnowledge) => set({ useKnowledge }),
    }),
    {
      name: 'scidata-settings',
    },
  ),
)
