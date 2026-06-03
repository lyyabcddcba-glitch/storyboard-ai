'use client'

import { useState } from 'react'
import type { StrategyItem } from '@/lib/types'
import LoadingSpinner from './LoadingSpinner'

interface ResultDisplayProps {
  result: string | null
  strategies?: StrategyItem[] | null
  loading: boolean
  error?: string | null
}

export default function ResultDisplay({
  result,
  strategies,
  loading,
  error,
}: ResultDisplayProps) {
  // 空状态
  if (!loading && !result && !error && (!strategies || strategies.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-300">
        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
        <p className="text-sm">输入内容后点击生成，AI将为您创作</p>
      </div>
    )
  }

  // 加载态
  if (loading) {
    return (
      <div className="py-4">
        <LoadingSpinner text="AI正在为您创作内容..." />
      </div>
    )
  }

  // 错误态
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-sm text-red-500">{error}</p>
        <p className="text-xs text-gray-400">请稍后重试</p>
      </div>
    )
  }

  // 多策略卡片展示（销售话术专用）
  if (strategies && strategies.length > 0) {
    return (
      <div className="animate-fade-in space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            AI生成了 {strategies.length} 套策略，选最合适的用
          </span>
          <CopyAllButton strategies={strategies} />
        </div>

        {strategies.map((s, i) => (
          <StrategyCard key={i} strategy={s} index={i} />
        ))}
      </div>
    )
  }

  // 单结果展示
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
          AI生成结果
        </span>
        <CopyButton text={result!} />
      </div>
      <div className="result-content bg-gray-50 rounded-xl p-4 border border-gray-100 max-h-80 overflow-y-auto">
        {result}
      </div>
    </div>
  )
}

/* 单条策略卡片 */
function StrategyCard({ strategy, index }: { strategy: StrategyItem; index: number }) {
  const [expanded, setExpanded] = useState(true)
  const colors = [
    'border-l-red-400 bg-red-50/30',
    'border-l-blue-400 bg-blue-50/30',
    'border-l-green-400 bg-green-50/30',
  ]
  const color = colors[index % colors.length]

  const styleColors: Record<string, string> = {
    '温和': 'bg-green-50 text-green-600 border-green-200',
    '专业': 'bg-blue-50 text-blue-600 border-blue-200',
    '直接': 'bg-orange-50 text-orange-600 border-orange-200',
  }

  const styleTag = strategy.style?.split('·')[0]?.trim() || ''
  const psychTag = strategy.style?.split('·')[1]?.trim() || strategy.style || ''
  const styleClass = styleColors[styleTag] || 'bg-gray-50 text-gray-500 border-gray-200'

  return (
    <div className={`rounded-xl border border-gray-100 overflow-hidden ${color} border-l-4 shadow-sm`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">{strategy.icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-700 truncate">{strategy.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${styleClass}`}>
                {styleTag}
              </span>
              {strategy.category && (
                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {strategy.category}
                </span>
              )}
            </div>
            {psychTag && psychTag !== styleTag && (
              <span className="text-[10px] text-gray-350 mt-0.5 block">🎯 {psychTag}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <CopyButton text={strategy.content} compact />
          <svg
            className={`w-4 h-4 text-gray-300 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="result-content text-[13px] leading-relaxed bg-white/70 rounded-lg p-3 border border-gray-100/50 whitespace-pre-wrap">
            {strategy.content}
          </div>
        </div>
      )}
    </div>
  )
}

/* 复制按钮 */
function CopyButton({ text, compact }: { text: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (compact) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); handleCopy() }}
        className={`text-xs px-2 py-1 rounded-md transition-all ${
          copied ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }`}
      >
        {copied ? '已复制 ✓' : '复制'}
      </button>
    )
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
        copied
          ? 'bg-green-50 text-green-600'
          : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          已复制
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          复制
        </>
      )}
    </button>
  )
}

/* 一键复制全部策略 */
function CopyAllButton({ strategies }: { strategies: StrategyItem[] }) {
  const [copied, setCopied] = useState(false)

  const handleCopyAll = async () => {
    const all = strategies
      .map((s, i) => `【${s.label}】${s.icon}\n\n${s.content}`)
      .join('\n\n━━━━━━━━━━━━\n\n')
    try {
      await navigator.clipboard.writeText(all)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = all
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopyAll}
      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all border ${
        copied
          ? 'bg-green-50 text-green-600 border-green-200'
          : 'text-primary-500 border-primary-200 hover:bg-primary-50'
      }`}
    >
      {copied ? '已复制全部 ✓' : '📋 一键复制全部'}
    </button>
  )
}
