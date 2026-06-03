'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { GeneratorConfig, GenerateResponse, HistoryItem, StrategyItem } from '@/lib/types'
import ResultDisplay from './ResultDisplay'

const HISTORY_KEY = 'ai-enrollment-history'
const MAX_HISTORY = 20

function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveHistory(items: HistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)))
  } catch { /* quota exceeded */ }
}

const INDUSTRY_TEMPLATES: Record<string, { label: string; prompt: string; demo?: boolean }[]> = {
  'sales-script': [
    { label: '💰 太贵了', prompt: '家长咨询驾校暑假班，觉得价格贵了500元', demo: true },
    { label: '🤔 再考虑', prompt: '家长说再考虑考虑，如何挖掘真实顾虑当场关单', demo: true },
    { label: '🔄 比竞品', prompt: '家长说隔壁机构便宜很多，如何突出自身优势', demo: true },
    { label: '📵 已读不回', prompt: '家长咨询完课程后已读不回5天了', demo: true },
  ],
  'event-plan': [
    { label: '🚗 驾校开放日', prompt: '驾校暑期开放日体验活动，目标到场150组家庭', demo: true },
    { label: '🏫 开学季招新', prompt: '9月开学季招生活动，目标招募200名新学员', demo: true },
    { label: '🎓 高考生专场', prompt: '高考后学车旺季推广，联合本地高中定向宣传', demo: true },
    { label: '🎨 画展+招生', prompt: '学员作品展暨秋季招生，通过画展吸引新生到场', demo: true },
  ],
  'video-script': [
    { label: '🚗 暑假学车', prompt: '高考生暑假学车特惠，立减500元，45天快速拿证', demo: true },
    { label: '🏫 教培招生', prompt: '暑期编程训练营招生，8-15岁零基础，前50名8折', demo: true },
    { label: '👨‍🏫 教练IP', prompt: '驾校教练个人IP打造，展示专业耐心通过率高', demo: true },
    { label: '🎯 学科辅导', prompt: '初中数学暑期提升班，一线名师10人精品小班', demo: true },
  ],
  'moments-post': [
    { label: '⏰ 优惠倒计时', prompt: '驾校早鸟价今晚截止，仅剩17个名额', demo: true },
    { label: '🏫 试听转化', prompt: '周末免费试听课，美术兴趣班4-12岁，到场送画材', demo: true },
    { label: '🎯 老生裂变', prompt: '老学员推荐新生各送2课时，设计裂变文案', demo: true },
    { label: '👨‍👩‍👧 家长好评', prompt: '学员家长真实好评+孩子成果展示，口碑招生', demo: true },
  ],
}

interface GeneratorCardProps {
  config: GeneratorConfig
  featured?: boolean
  expanded?: boolean
  hideTemplates?: boolean
}

export default function GeneratorCard({ config, featured, expanded, hideTemplates }: GeneratorCardProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [strategies, setStrategies] = useState<StrategyItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const templates = INDUSTRY_TEMPLATES[config.type] || []
  const isSales = config.type === 'sales-script'

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, expanded ? 200 : 160) + 'px'
    }
  }, [input, expanded])

  const addToHistory = useCallback((inputText: string, res: string, strats?: StrategyItem[] | null) => {
    const item: HistoryItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type: config.type,
      input: inputText,
      result: res,
      strategies: strats || undefined,
      createdAt: Date.now(),
    }
    const updated = [item, ...history].slice(0, MAX_HISTORY)
    setHistory(updated)
    saveHistory(updated)
  }, [config.type, history])

  const handleGenerate = useCallback(async (prompt?: string, multi?: boolean) => {
    const content = (prompt || input).trim()
    if (!content) return

    setLoading(true)
    setError(null)
    setResult(null)
    setStrategies(null)
    if (prompt) setInput(content)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: config.type,
          input: content,
          multiStrategy: multi ?? false,
        }),
      })

      const data: GenerateResponse = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || '生成失败')

      setResult(data.result)
      if (data.strategies) setStrategies(data.strategies)
      addToHistory(content, data.result, data.strategies)
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误')
    } finally {
      setLoading(false)
    }
  }, [input, config.type, addToHistory])

  const handleTemplateClick = (prompt: string, demo?: boolean) => {
    if (demo) handleGenerate(prompt)
    else { setInput(prompt); setResult(null); setStrategies(null); setError(null) }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const handleExport = () => {
    const content = strategies
      ? strategies.map((s, i) => `【${s.label}】${s.icon}\n${s.style ? '风格：' + s.style + '\n' : ''}${s.category ? '分类：' + s.category + '\n\n' : '\n'}${s.content}`).join('\n\n---\n\n')
      : result || ''
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.title}-${new Date().toLocaleDateString()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasResult = result || (strategies && strategies.length > 0)

  return (
    <div className={`bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden ${
      featured ? 'border-primary-200 ring-1 ring-primary-100 shadow-md' : 'border-gray-100'
    }`}>
      {/* 卡片头部 */}
      <div className={`px-6 pt-6 pb-3 ${featured ? 'bg-gradient-to-b from-primary-50/50 to-white' : ''}`}>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
              {config.title}
              {featured && (
                <span className="text-[10px] font-medium bg-primary-500 text-white px-1.5 py-0.5 rounded-full">最受欢迎</span>
              )}
            </h3>
            <p className="text-sm text-gray-400">{config.description}</p>
          </div>
        </div>

        {/* 行业模板标签 — 完整工具模式下隐藏，避免与首屏重复 */}
        {!hideTemplates && templates.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
            <span className="text-[10px] text-gray-350 mr-1 self-center">试试：</span>
            {templates.map((t) => (
              <button
                key={t.label}
                onClick={() => handleTemplateClick(t.prompt, t.demo)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border transition-all duration-150 ${
                  t.demo
                    ? 'border-primary-200 bg-primary-50 text-primary-600 hover:bg-primary-100 hover:border-primary-300 font-medium'
                    : 'border-gray-150 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-gray-100'
                }`}
              >
                {t.label}
                {t.demo && <span className="text-[10px] opacity-60">⚡一键</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="px-6 pb-4">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={config.placeholder}
          rows={expanded ? 5 : 4}
          className="w-full px-5 py-5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 focus:bg-white transition-all placeholder:text-gray-350"
        />

        {/* 操作栏 */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-350">
              {input.length > 0 ? `${input.length} 字` : '点击标签可直接生成 →'}
            </span>
            {history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`text-xs px-2 py-0.5 rounded-md border transition-colors ${
                  showHistory ? 'bg-primary-50 text-primary-600 border-primary-200' : 'text-gray-400 border-gray-150 hover:border-gray-200'
                }`}
              >
                📜 {history.length}条
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasResult && !loading && (
              <button
                onClick={handleExport}
                className="text-xs px-3 py-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200"
                title="导出为TXT"
              >
                📄 导出
              </button>
            )}

            {isSales && (
              <button
                onClick={() => handleGenerate(undefined, true)}
                disabled={loading || !input.trim()}
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 border-2 ${
                  loading || !input.trim()
                    ? 'border-gray-150 text-gray-350 cursor-not-allowed bg-gray-50'
                    : 'border-gray-300 text-gray-600 bg-white hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/50 active:scale-[0.98]'
                }`}
              >
                多方案
              </button>
            )}

            <button
              onClick={() => handleGenerate()}
              disabled={loading || !input.trim()}
              className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                loading || !input.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200 hover:from-primary-600 hover:to-primary-700 active:scale-[0.98]'
              }`}
            >
              {loading ? '生成中...' : '⚡ 生成'}
            </button>
          </div>
        </div>
      </div>

      {/* 历史记录面板 */}
      {showHistory && history.length > 0 && (
        <div className="px-6 pb-4 animate-fade-in">
          <div className="bg-gray-50 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
            <div className="text-xs font-medium text-gray-400 mb-2">最近使用</div>
            {history.slice(0, 5).map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  setInput(h.input)
                  setResult(h.result)
                  setStrategies(h.strategies || null)
                  setShowHistory(false)
                }}
                className="w-full text-left text-xs text-gray-600 bg-white rounded-lg p-2 hover:bg-primary-50 hover:text-primary-600 transition-colors truncate border border-gray-100"
              >
                <span className="text-gray-350 text-[10px] mr-1">
                  {new Date(h.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {h.input.slice(0, 50)}{h.input.length > 50 ? '...' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 结果展示 */}
      <div className="px-6 pb-6">
        <ResultDisplay result={result} strategies={strategies} loading={loading} error={error} />
      </div>
    </div>
  )
}
