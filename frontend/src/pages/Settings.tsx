import { ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { useSettingsStore } from '@/stores/settingsStore'

export default function Settings() {
  const {
    defaultStyle,
    defaultExportFormat,
    useGrounding,
    useKnowledge,
    setDefaultStyle,
    setDefaultExportFormat,
    setUseGrounding,
    setUseKnowledge,
  } = useSettingsStore()

  const onStyleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDefaultStyle(event.target.value as typeof defaultStyle)
  }

  const onExportFormatChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDefaultExportFormat(event.target.value as typeof defaultExportFormat)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-title text-ink-black mb-6">设置</h1>

        <div className="ink-card p-6 mb-6">
          <h2 className="font-title text-xl text-ink-black mb-4">账户信息</h2>
          <div className="space-y-4">
            <Input label="邮箱" type="email" placeholder="anonymous@local" disabled />
            <p className="text-sm text-ink-light">当前为匿名模式，本轮版本不启用登录鉴权。</p>
          </div>
        </div>

        <div className="ink-card p-6 mb-6">
          <h2 className="font-title text-xl text-ink-black mb-4">分析偏好</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-ink-medium text-sm mb-2">默认图表样式</label>
              <select className="ink-input" value={defaultStyle} onChange={onStyleChange}>
                <option value="scientific">科研风格</option>
                <option value="publication">期刊级</option>
                <option value="presentation">演示用</option>
              </select>
            </div>
            <div>
              <label className="block text-ink-medium text-sm mb-2">默认导出格式</label>
              <select className="ink-input" value={defaultExportFormat} onChange={onExportFormatChange}>
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <label className="flex items-center gap-3 text-sm text-ink-medium">
              <input
                type="checkbox"
                checked={useGrounding}
                onChange={(event) => setUseGrounding(event.target.checked)}
              />
              启用 Google Search Grounding
            </label>
            <label className="flex items-center gap-3 text-sm text-ink-medium">
              <input
                type="checkbox"
                checked={useKnowledge}
                onChange={(event) => setUseKnowledge(event.target.checked)}
              />
              启用知识库检索
            </label>
          </div>
        </div>

        <div className="ink-card p-6">
          <h2 className="font-title text-xl text-ink-black mb-4">本地配置</h2>
          <p className="text-sm text-ink-light mb-4">
            所有偏好保存在当前浏览器本地存储中，刷新页面后仍会保留。
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              setDefaultStyle('scientific')
              setDefaultExportFormat('png')
              setUseGrounding(true)
              setUseKnowledge(true)
            }}
          >
            恢复默认设置
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
