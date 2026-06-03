export default function Footer() {
  return (
    <footer className="mt-auto py-8 border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-gray-400">
          © 2026 AI招生增长助手 · 让每一次招生都更高效
        </p>
        <p className="mt-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs text-primary-600 bg-primary-50 rounded-full">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-500" />
            </span>
            会员功能即将上线，敬请期待
          </span>
        </p>
      </div>
    </footer>
  )
}
