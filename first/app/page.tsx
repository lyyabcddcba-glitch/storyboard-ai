'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

const STATS = [
  { label: '今日选号预约', value: '37', icon: '📱', color: 'text-green-400' },
  { label: '合伙人活跃', value: '89', icon: '👥', color: 'text-blue-400' },
  { label: '素材被下载', value: '156', icon: '📥', color: 'text-amber-400' },
  { label: 'AI 脚本生成', value: '23', icon: '🎬', color: 'text-purple-400' },
]

const QUICK_ACTIONS = [
  { href: '/storyboard', label: '创作脚本', icon: '🎥', desc: 'AI 分镜生成 + Kolors 生图' },
  { href: '/sales', label: '查话术', icon: '💬', desc: '销售金句一键复制' },
  { href: '/materials', label: '找素材', icon: '📁', desc: '三校专属图片视频' },
  { href: '/booking', label: '新预约', icon: '📱', desc: '靓号登记' },
]

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="p-6 space-y-6">
      {/* 顶部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">👋 迎新控制台</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{session?.user?.email || '欢迎回来'}</p>
        </div>
        <span className="text-xs text-zinc-600 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
          西油 · 西华 · 川医 三校联动
        </span>
      </div>

      {/* 数据卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{s.icon}</span>
              <span className={`text-2xl font-extrabold tabular-nums ${s.color}`}>{s.value}</span>
            </div>
            <div className="text-xs text-zinc-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map(a => (
          <Link key={a.href} href={a.href}
            className="bg-zinc-900/50 border border-zinc-800 hover:border-indigo-500/30 hover:bg-zinc-900 rounded-xl p-4 transition-all group">
            <div className="text-2xl mb-2">{a.icon}</div>
            <div className="text-sm font-medium text-zinc-200">{a.label}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{a.desc}</div>
          </Link>
        ))}
      </div>

      {/* 今日实况 */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">📡 今日实况</h2>
        <div className="space-y-3">
          {[
            { time: '14:32', text: '合伙人 张伟 刚复制了一条"游戏延迟低"话术', school: '西油' },
            { time: '14:18', text: '新生 李同学 完成靓号预约 138****8888', school: '川医' },
            { time: '14:05', text: 'AI 完成"图书馆夕阳"分镜生图，已同步素材库', school: '西华' },
            { time: '13:50', text: '素材"宿舍开黑"被下载 12 次', school: '西油' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="text-xs text-zinc-600 font-mono w-10 flex-shrink-0">{item.time}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 flex-shrink-0">{item.school}</span>
              <span className="text-zinc-400 truncate">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
