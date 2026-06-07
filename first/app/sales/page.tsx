'use client'

import { useState } from 'react'
import { CAMPUS_DATA, SALES_GOLD_QUOTES } from '@/lib/campus-data'

const CATEGORIES = ['全部', '群聊破冰', '扫楼破门', '解决抗拒', '网络优势', '价格说服', '校园场景', '竞品对比']

const BASIC_SCRIPTS = [
  { category: '网络优势', q: '你们学校网络到底卡不卡？', a: '"同学你放心，我们电信在你们学校有专属基站，宿舍打游戏延迟稳定在20ms以内。你现在用的那家晚上高峰期能卡到200多，我们这边实测对比数据我发你看看？"', tips: '手里准备一张测速截图，边说边亮数据' },
  { category: '网络优势', q: '打王者会不会460？', a: '"绝对不会！你们这栋宿舍楼一楼就是我们的微基站，晚上8点开黑实测延迟18-25ms。可以你现在打开游戏我让你感受一下——跟你现在用的卡切换一下试试？"', tips: '随身带个测试机，现场切换对比' },
  { category: '价格说服', q: '你们套餐太贵了，移动才29', a: '"同学你仔细看，移动29只有20G流量超了就限速，我们39有80G还送你宿舍宽带。你一个月光刷抖音就30G了，20G根本不够用啊。多10块钱换三倍的流量和宿舍WiFi，划算不？"', tips: '拿出两家套餐对比表，用荧光笔圈出差价' },
  { category: '校园场景', q: '图书馆地下室有信号吗？', a: '"有！我们去年刚在图书馆加装了室内分布系统，地下自习室满格。你要不要现在跟我下去测一下？顺便给你看看我们实测的下载速度。"', tips: '实测比口说有说服力100倍' },
  { category: '竞品对比', q: '我室友用联通也挺好的', a: '"你室友用的什么套餐？我帮你对一下——联通的基站离你们宿舍远，下雨天信号容易断。我们电信在你们校区有3个基站，覆盖无死角。你问室友他打游戏有没有突然卡一下的时候？"', tips: '不贬低竞品，引导用户自己发现差异' },
]

export default function SalesPage() {
  const [activeCat, setActiveCat] = useState('全部')
  const [activeSchool, setActiveSchool] = useState('swpu')
  const [copied, setCopied] = useState('')
  const campus = CAMPUS_DATA[activeSchool]

  const allScripts = [...SALES_GOLD_QUOTES, ...BASIC_SCRIPTS]
  const filtered = activeCat === '全部' ? allScripts : allScripts.filter(s => s.category === activeCat)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">⚡ 销售金句库</h1>
        <p className="text-sm text-zinc-500 mt-0.5">三校实战话术 · 一键复制 · 新人秒变老兵</p>
      </div>

      {/* 学校上下文 */}
      <div className="flex gap-2">
        {Object.values(CAMPUS_DATA).map(s => (
          <button key={s.key} onClick={() => setActiveSchool(s.key)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
              activeSchool === s.key
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
            }`}>
            {s.key === 'swpu' ? '🛢️ 西油' : s.key === 'cwnu' ? '📚 西华师大' : '🏥 川北医'}
          </button>
        ))}
      </div>

      {/* 学校金句 Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-5">
        <div className="text-[10px] text-amber-500 uppercase tracking-widest mb-1">🎯 {campus.name} 专属引流金句</div>
        <p className="text-sm text-zinc-300 leading-relaxed mb-3">{campus.pitch}</p>
        <button onClick={() => handleCopy(campus.pitch)}
          className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
            copied === campus.pitch ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
          {copied === campus.pitch ? '✓ 已复制' : '📋 复制此金句'}
        </button>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setActiveCat(c)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              c === activeCat ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
            }`}>{c}</button>
        ))}
      </div>

      {/* 金句卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((s, i) => {
          const isGold = SALES_GOLD_QUOTES.includes(s as any)
          return (
            <div key={i}
              className={`rounded-xl p-4 transition-all hover:border-zinc-700 ${
                isGold
                  ? 'bg-amber-500/5 border border-amber-500/20'
                  : 'bg-zinc-900/50 border border-zinc-800'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    isGold ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {isGold ? '⭐ ' : ''}{s.category}
                  </span>
                  {s.q && <span className="text-xs text-zinc-600">客户问：{s.q}</span>}
                </div>
                <button onClick={() => handleCopy(s.a || (s as any).text)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                    copied === (s.a || (s as any).text) ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'text-zinc-600 hover:text-zinc-400'
                  }`}>
                  {copied === (s.a || (s as any).text) ? '✓ 已复制' : '📋 复制'}
                </button>
              </div>
              {s.q && <div className="text-xs text-amber-400 font-medium mb-1.5">{s.q}</div>}
              <div className="text-sm text-zinc-300 leading-relaxed">{s.a || (s as any).text}</div>
              {s.tips && (
                <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center gap-2">
                  <span className="text-[10px] text-zinc-600">💡 {s.tips}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
