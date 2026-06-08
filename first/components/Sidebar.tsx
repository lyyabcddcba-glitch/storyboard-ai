'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  {
    section: '🏠 迎新控制台',
    items: [{ href: '/', label: '数据看板', icon: '📊' }],
  },
  {
    section: '🎬 创作中心',
    items: [
      { href: '/storyboard', label: 'AI 分镜脚本', icon: '🎥' },
      { href: '/gallery', label: 'AI 生图作品集', icon: '🖼️' },
    ],
  },
  {
    section: '⚡ 战时支撑',
    items: [
      { href: '/sales', label: '销售金句库', icon: '💬' },
      { href: '/materials', label: '素材库（入库）', icon: '📁' },
    ],
  },
  {
    section: '📚 新生保姆',
    items: [{ href: '/guide', label: '入学完全指南', icon: '🎓' }],
  },
  {
    section: '🎁 选号预约',
    items: [{ href: '/booking', label: '靓号预约登记', icon: '📱' }],
  },
]

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-56'} flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-200 overflow-hidden`}>
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-zinc-800 flex-shrink-0">
        <button onClick={onToggle} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2 truncate">
            <span className="text-base">🚀</span>
            <span className="text-sm font-bold text-white truncate">全能枢纽</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_ITEMS.map((group) => (
          <div key={group.section}>
            {!collapsed && <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-3 mb-1.5">{group.section}</div>}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                      active
                        ? 'bg-indigo-500/15 text-indigo-400 font-medium'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 底部 */}
      {!collapsed && (
        <div className="p-3 border-t border-zinc-800">
          <div className="text-[10px] text-zinc-600 text-center">
            Storyboard AI · 迎新全能枢纽
          </div>
        </div>
      )}
    </aside>
  )
}
