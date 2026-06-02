export type ChartStyle = 'scientific' | 'publication' | 'presentation'
export type ChartFormat = 'png' | 'svg' | 'pdf'

export interface AnalyzeReport {
  summary: string
  key_findings: string[]
  peak_assignments: Array<Record<string, unknown>>
  suggestions: string[]
  references: string[]
  confidence: number
}

export interface FullAnalyzeResponse {
  success: boolean
  processed_data: Record<string, unknown>
  chart_metadata: Record<string, unknown>
  chart_image_base64: string
  chart_image_mime: string
  report: AnalyzeReport | string
  ai_status: 'ok' | 'degraded'
  ai_error: string | null
}

export interface RenderResponse {
  success: boolean
  image_base64: string
  image_mime: string
  metadata: Record<string, unknown>
}

export interface AnalyzeOptions {
  style: ChartStyle
  useGrounding: boolean
  useKnowledge: boolean
}

const env = import.meta as ImportMeta & {
  env?: {
    VITE_API_BASE_URL?: string
  }
}

const apiBaseUrl = (env.env?.VITE_API_BASE_URL || '').replace(/\/$/, '')

function toApiUrl(path: string): string {
  if (!apiBaseUrl) {
    return path
  }
  return `${apiBaseUrl}${path}`
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const detail = typeof payload === 'object' && payload !== null && 'detail' in payload
      ? String((payload as { detail: unknown }).detail)
      : `HTTP ${response.status}`
    throw new Error(detail)
  }

  return payload as T
}

export async function analyzeFull(
  file: File,
  options: AnalyzeOptions,
): Promise<FullAnalyzeResponse> {
  const params = new URLSearchParams({
    style: options.style,
    use_grounding: String(options.useGrounding),
    use_knowledge: String(options.useKnowledge),
  })

  const form = new FormData()
  form.append('file', file)

  const response = await fetch(toApiUrl(`/api/analyze/full?${params.toString()}`), {
    method: 'POST',
    body: form,
  })

  return parseJsonResponse<FullAnalyzeResponse>(response)
}

export async function renderChart(
  file: File,
  style: ChartStyle,
  format: ChartFormat,
): Promise<RenderResponse> {
  const params = new URLSearchParams({
    style,
    format,
  })

  const form = new FormData()
  form.append('file', file)

  const response = await fetch(toApiUrl(`/api/analyze/render?${params.toString()}`), {
    method: 'POST',
    body: form,
  })

  return parseJsonResponse<RenderResponse>(response)
}

export function base64ToBytes(base64: string): Uint8Array {
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)

  for (let i = 0; i < bin.length; i += 1) {
    bytes[i] = bin.charCodeAt(i)
  }

  return bytes
}

export function downloadBase64File(
  base64: string,
  mimeType: string,
  fileName: string,
): void {
  const bytes = base64ToBytes(base64)
  const arrayBuffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(arrayBuffer).set(bytes)
  const blob = new Blob([arrayBuffer], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}
