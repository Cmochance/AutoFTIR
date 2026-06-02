import { create } from 'zustand'
import type { AnalyzeReport } from '@/services/analyzeApi'

export type AnalyzeStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'rendering'
  | 'analyzing'
  | 'done'
  | 'error'

export type AIStatus = 'ok' | 'degraded' | null

interface AnalyzeState {
  status: AnalyzeStatus
  progress: number
  error: string | null

  file: File | null
  processedData: Record<string, unknown> | null
  chartImageBase64: string | null
  chartMime: string | null
  chartMetadata: Record<string, unknown> | null
  report: AnalyzeReport | string | null
  aiStatus: AIStatus
  aiError: string | null

  setFile: (file: File | null) => void
  setStatus: (status: AnalyzeStatus) => void
  setProgress: (progress: number) => void
  setError: (error: string | null) => void
  setProcessedData: (data: Record<string, unknown> | null) => void
  setChartImage: (base64: string | null, mime: string | null) => void
  setChartMetadata: (metadata: Record<string, unknown> | null) => void
  setReport: (report: AnalyzeReport | string | null) => void
  setAIStatus: (status: AIStatus, error: string | null) => void
  reset: () => void
}

const initialState = {
  status: 'idle' as AnalyzeStatus,
  progress: 0,
  error: null,
  file: null,
  processedData: null,
  chartImageBase64: null,
  chartMime: null,
  chartMetadata: null,
  report: null,
  aiStatus: null as AIStatus,
  aiError: null,
}

export const useAnalyzeStore = create<AnalyzeState>((set) => ({
  ...initialState,

  setFile: (file) => set({ file }),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error, status: error ? 'error' : 'idle' }),
  setProcessedData: (processedData) => set({ processedData }),
  setChartImage: (chartImageBase64, chartMime) => set({ chartImageBase64, chartMime }),
  setChartMetadata: (chartMetadata) => set({ chartMetadata }),
  setReport: (report) => set({ report }),
  setAIStatus: (aiStatus, aiError) => set({ aiStatus, aiError }),
  reset: () => set(initialState),
}))
