'use client'

import { useState } from 'react'
import { salesHubDatabase, SALES_GOLD_QUOTES } from '@/lib/campus-data'

const CATEGORIES = ['全部', '⭐ 群聊破冰', '⭐ 扫楼破门', '⭐ 解决抗拒', '网络优势', '价格说服', '校园场景', '竞品对比']

const BASIC = [
  { category: '网络优势', q: '学校网络卡不卡？', a: '"同学，我们电信在你们学校有专属基站，宿舍打游戏延迟20ms以内。实测对比数据我发你看看？"', tips: '手里准备测速截图' },
  { category: '价格说服', q: '太贵了，移动才29', a: '"移动29只有20G超了就限速，我们39有80G还送宿舍宽带。多10块换3倍流量+WiFi，你自己算。"', tips: '拿出套餐对比表' },
  { category: '校园场景', q: '图书馆地下室有信号吗？', a: '"有！去年刚装室内分布，地下满格。现在下去实测给你看？"', tips: '实测最有说服力' },
  { category: '竞品对比', q: '室友用联通也挺好', a: '"你室友什么套餐？我帮你对比——联通基站远下雨天容易断。电信在你们校区3个基站全覆盖，问他打游戏有没有突然卡过？"', tips: '不贬低，引导发现差异' },
]

const ALL = [...SALES_GOLD_QUOTES.map(s => ({ ...s, gold: true })), ...BASIC.map(s => ({ ...s, gold: false }))]

export default function SalesPage() {
  const [activeCat, setActiveCat] = useState('全部')
  const [activeSchool, setActiveSchool] = useState('swpu')
  const [copied, setCopied] = useState('')
  const campus = salesHubDatabase[activeSchool]

  const filtered = activeCat === '全部' ? ALL : ALL.filter(s => s.category.includes(activeCat.replace('⭐ ', '')))

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">⚡ 销售金句库</h1>
        <p className="text-sm text-zinc-500 mt-0.5">团队内部 · 一键复制 · 按学校分类 · 新人秒变老兵</p>
      </div>

      {/* 学校切换 */}
      <div className="flex gap-2">
        {Object.values(salesHubDatabase).map(s => (
          <button key={s.key} onClick={() => setActiveSchool(s.key)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              activeSchool === s.key
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
            }`}>
            {s.short}
          </button>
        ))}
      </div>

      {/* 绝杀金句 Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border-2 border-amber-500/30 rounded-2xl p-5">
        <div className="text-[10px] text-amber-500 uppercase tracking-widest mb-1">🎯 {campus.short} 战时绝杀话术</div>
        <p className="text-sm text-zinc-200 leading-relaxed mb-3">{campus.killerPitch}</p>
        <button onClick={() => { navigator.clipboard.writeText(campus.killerPitch); setCopied(campus.killerPitch); setTimeout(() => setCopied(''), 2000) }}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
            copied === campus.killerPitch ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-amber-500 hover:bg-amber-400 text-black'
          }`}>
          {copied === campus.killerPitch ? '✓ 已复制' : '📋 一键复制绝杀话术'}
        </button>
      </div>

      {/* 分类 */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setActiveCat(c)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
              c === activeCat ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
            }`}>{c}</button>
        ))}
      </div>

      {/* 话术卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((s, i) => (
          <div key={i} className={`rounded-xl p-4 transition-all ${s.gold ? 'bg-amber-500/5 border-2 border-amber-500/20' : 'bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] px-2 py-0.5 rounded ${s.gold ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-500'}`}>
                {s.gold ? '⭐ ' : ''}{s.category}
              </span>
              <button onClick={() => { navigator.clipboard.writeText(s.text || s.a!); setCopied(s.text || s.a!); setTimeout(() => setCopied(''), 2000) }}
                className={`text-xs px-2.5 py-1 rounded-lg ${copied === (s.text || s.a) ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'text-zinc-600 hover:text-zinc-400'}`}>
                {copied === (s.text || s.a) ? '✓ 已复制' : '📋 复制'}
              </button>
            </div>
            {(s as any).q && <div className="text-xs text-amber-400 font-medium mb-1.5">{(s as any).q}</div>}
            <div className="text-sm text-zinc-300 leading-relaxed">{s.text || (s as any).a}</div>
            {(s as any).tips && <div className="mt-2 pt-2 border-t border-zinc-800 text-[10px] text-zinc-600">💡 {(s as any).tips}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
