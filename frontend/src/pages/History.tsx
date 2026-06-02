import { motion } from 'framer-motion'
import { useHistoryStore } from '@/stores/historyStore'
import Button from '@/components/common/Button'

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) {
    return isoString
  }
  return date.toLocaleString()
}

export default function History() {
  const { items, deleteItem, clear } = useHistoryStore()

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-title text-ink-black">历史记录</h1>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clear}>清空历史</Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="ink-card p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-ink-medium mb-2">暂无分析记录</p>
            <p className="text-sm text-ink-light">您的分析记录将在此显示</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                className="ink-card p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-body text-ink-black">{item.fileName}</h3>
                    <p className="text-sm text-ink-light mt-1">
                      {item.dataType} · {item.style} · {formatTime(item.createdAt)}
                    </p>
                    <p className="text-sm text-ink-medium mt-2 line-clamp-2">{item.reportSummary}</p>
                    <p className="text-xs mt-2 text-ink-faint">
                      AI 状态: {item.aiStatus === 'ok' ? '正常' : '降级'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
                    删除
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
