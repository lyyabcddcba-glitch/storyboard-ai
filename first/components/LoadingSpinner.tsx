'use client'

interface LoadingSpinnerProps {
  text?: string
}

export default function LoadingSpinner({
  text = 'AI正在生成中...',
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      {/* 旋转动画 */}
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin" />
      </div>

      {/* 三点脉冲动画 */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-gray-500">{text}</span>
        <span className="flex gap-1 ml-1">
          <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse-dot" />
          <span
            className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse-dot"
            style={{ animationDelay: '0.2s' }}
          />
          <span
            className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse-dot"
            style={{ animationDelay: '0.4s' }}
          />
        </span>
      </div>
    </div>
  )
}
