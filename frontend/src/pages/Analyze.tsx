import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { useAnalyzeStore } from '@/stores/analyzeStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useSettingsStore } from '@/stores/settingsStore'
import {
  analyzeFull,
  downloadBase64File,
  renderChart,
  type AnalyzeReport,
  type ChartFormat,
} from '@/services/analyzeApi'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'

function isAnalyzeReport(value: unknown): value is AnalyzeReport {
  if (!value || typeof value !== 'object') {
    return false
  }

  return 'summary' in value && 'key_findings' in value && 'suggestions' in value
}

function getBaseName(fileName: string): string {
  const index = fileName.lastIndexOf('.')
  if (index <= 0) {
    return fileName
  }
  return fileName.slice(0, index)
}

export default function Analyze() {
  const {
    status,
    file,
    chartImageBase64,
    chartMime,
    report,
    aiStatus,
    aiError,
    error,
    setFile,
    setStatus,
    setError,
    setProcessedData,
    setChartImage,
    setChartMetadata,
    setReport,
    setAIStatus,
    reset,
  } = useAnalyzeStore()

  const { addItem } = useHistoryStore()
  const {
    defaultStyle,
    defaultExportFormat,
    useGrounding,
    useKnowledge,
  } = useSettingsStore()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      reset()
      setFile(acceptedFiles[0])
      setError(null)
    }
  }, [reset, setError, setFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  })

  const handleAnalyze = async () => {
    if (!file) {
      return
    }

    try {
      setError(null)
      setStatus('uploading')

      setStatus('processing')
      const result = await analyzeFull(file, {
        style: defaultStyle,
        useGrounding,
        useKnowledge,
      })

      if (!result.success) {
        throw new Error('后端返回失败状态')
      }

      setStatus('rendering')
      setProcessedData(result.processed_data)
      setChartMetadata(result.chart_metadata)
      setChartImage(result.chart_image_base64, result.chart_image_mime)

      setStatus('analyzing')
      setReport(result.report)
      setAIStatus(result.ai_status, result.ai_error)

      addItem({
        fileName: file.name,
        dataType: String(result.processed_data?.data_type ?? 'unknown'),
        style: defaultStyle,
        aiStatus: result.ai_status,
        reportSummary: isAnalyzeReport(result.report)
          ? result.report.summary || '无摘要'
          : String(result.report || '').slice(0, 120) || '无摘要',
      })

      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败')
    }
  }

  const handleDownload = async (format: ChartFormat) => {
    if (!file) {
      return
    }

    const baseName = getBaseName(file.name)

    try {
      let imageBase64 = chartImageBase64
      let imageMime = chartMime || 'image/png'

      if (format !== 'png' || !imageBase64) {
        const prevStatus = status
        setStatus('rendering')
        const rendered = await renderChart(file, defaultStyle, format)
        imageBase64 = rendered.image_base64
        imageMime = rendered.image_mime
        setStatus(prevStatus === 'error' ? 'done' : prevStatus)
      }

      if (!imageBase64) {
        throw new Error('无可下载图像数据')
      }

      downloadBase64File(imageBase64, imageMime, `${baseName}.${format}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '下载失败')
      setStatus('done')
    }
  }

  const chartDataUri = chartImageBase64 && chartMime
    ? `data:${chartMime};base64,${chartImageBase64}`
    : null

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-title text-ink-black mb-6">数据分析</h1>

        {status === 'idle' && (
          <div
            {...getRootProps()}
            className={`upload-zone text-center ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="text-4xl mb-4">📁</div>
            {isDragActive ? (
              <p className="text-ink-medium">释放文件以上传...</p>
            ) : (
              <>
                <p className="text-ink-medium mb-2">拖拽文件到此处，或点击选择</p>
                <p className="text-sm text-ink-light">支持 CSV、TXT、Excel 格式</p>
              </>
            )}
          </div>
        )}

        {file && status === 'idle' && (
          <motion.div
            className="mt-6 ink-card p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl">📄</div>
                <div>
                  <p className="font-body text-ink-black">{file.name}</p>
                  <p className="text-sm text-ink-light">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={reset}>重选</Button>
                <Button variant="seal" onClick={handleAnalyze}>开始分析</Button>
              </div>
            </div>
          </motion.div>
        )}

        {(status === 'uploading' || status === 'processing' || status === 'rendering' || status === 'analyzing') && (
          <motion.div
            className="mt-6 ink-card p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loading size="lg" text="正在分析数据..." />
            <div className="mt-6 text-sm text-ink-light">
              {status === 'uploading' && '上传文件中...'}
              {status === 'processing' && '识别数据类型中...'}
              {status === 'rendering' && '生成图表中...'}
              {status === 'analyzing' && 'AI 深度分析中...'}
            </div>
          </motion.div>
        )}

        {error && (
          <div className="mt-6 result-card border-l-vermilion">
            <h2 className="font-title text-xl text-vermilion mb-2">处理失败</h2>
            <p className="text-ink-medium">{error}</p>
          </div>
        )}

        {status === 'done' && (
          <motion.div
            className="mt-6 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="ink-card p-6">
              <h2 className="font-title text-xl text-ink-black mb-4">生成图表</h2>
              <div className="bg-paper-cream p-4 rounded-sm flex items-center justify-center min-h-[300px]">
                {chartDataUri ? (
                  <img src={chartDataUri} alt="分析结果图表" className="max-w-full" />
                ) : (
                  <p className="text-ink-light">图表预览区域</p>
                )}
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="ghost" size="sm" onClick={() => handleDownload('png')}>下载 PNG</Button>
                <Button variant="ghost" size="sm" onClick={() => handleDownload('svg')}>下载 SVG</Button>
                <Button variant="ghost" size="sm" onClick={() => handleDownload('pdf')}>下载 PDF</Button>
                <Button variant="ink" size="sm" onClick={() => handleDownload(defaultExportFormat)}>
                  下载默认格式
                </Button>
              </div>
            </div>

            <div className="result-card">
              <h2 className="font-title text-xl text-ink-black mb-4">AI 分析报告</h2>
              {aiStatus === 'degraded' && (
                <div className="mb-4 rounded-sm border border-vermilion/40 bg-vermilion/5 p-3 text-sm text-ink-medium">
                  AI 服务降级，图表仍可用。{aiError ? `原因: ${aiError}` : ''}
                </div>
              )}

              {typeof report === 'string' && report && (
                <pre className="whitespace-pre-wrap text-sm text-ink-medium bg-transparent p-0 m-0">{report}</pre>
              )}

              {isAnalyzeReport(report) && (
                <div className="space-y-4 text-ink-medium">
                  <div>
                    <h3 className="font-semibold text-ink-black mb-2">概述</h3>
                    <p>{report.summary || '暂无概述'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink-black mb-2">关键发现</h3>
                    {report.key_findings.length > 0 ? (
                      <ul className="list-disc pl-6">
                        {report.key_findings.map((item, idx) => (
                          <li key={`finding-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>暂无关键发现</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink-black mb-2">建议</h3>
                    {report.suggestions.length > 0 ? (
                      <ul className="list-disc pl-6">
                        {report.suggestions.map((item, idx) => (
                          <li key={`suggestion-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>暂无建议</p>
                    )}
                  </div>
                </div>
              )}

              {!report && (
                <p className="text-ink-light">
                  AI 分析报告将在此显示，包含数据解读、峰归属、物质推断等专业分析。
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button variant="ink" onClick={reset}>分析新数据</Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
