'use client'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-lg border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-200">
              <span className="text-white text-xl">🚗</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 tracking-tight">
                AI招生增长<span className="text-primary-600">系统</span>
              </h1>
              <p className="text-xs text-gray-400 -mt-0.5">
                3分钟出方案 · 提升咨询转化 · 减少招生工作量
              </p>
            </div>
          </div>

          {/* 右侧 */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              2,300+ 机构在使用
            </span>
            <a
              href="#pricing"
              className="hidden sm:inline-flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
            >
              💎 升级专业版
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
