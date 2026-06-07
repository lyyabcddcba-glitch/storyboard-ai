'use client'

import { useState } from 'react'

const CATEGORIES = ['全部', '网络优势', '价格说服', '校园场景', '竞品对比', '疑难应对']

const SCRIPTS = [
  {
    category: '网络优势',
    q: '你们学校网络到底卡不卡？',
    a: '"同学你放心，我们电信在你们学校有专属基站，宿舍打游戏延迟稳定在20ms以内。你现在用的那家晚上高峰期能卡到200多，我们这边实测对比数据我发你看看？"',
    tips: '手里准备一张西油测速截图，边说边亮数据',
  },
  {
    category: '网络优势',
    q: '打王者会不会460？',
    a: '"绝对不会！你们这栋宿舍楼一楼就是我们的微基站，晚上8点开黑实测延迟18-25ms。可以你现在打开游戏我让你感受一下——跟你现在用的卡切换一下试试？"',
    tips: '随身带个测试机，现场切换对比',
  },
  {
    category: '价格说服',
    q: '你们套餐太贵了，移动才29',
    a: '"同学你仔细看，移动29只有20G流量超了就限速，我们39有80G还送你宿舍宽带。你一个月光刷抖音就30G了，20G根本不够用啊。多10块钱换三倍的流量和宿舍WiFi，划算不？"',
    tips: '拿出两家套餐对比表，用荧光笔圈出差价',
  },
  {
    category: '价格说服',
    q: '我能不能先办一个月试试？',
    a: '"能啊，不过办一年的话前两个月免费，等于送你80块。而且现在办年卡送这张流量卡，放假回家也能用。你算算，10个月实际每个月才35，比月月交39便宜。"',
    tips: '强调前两个月免费=实打实的优惠',
  },
  {
    category: '校园场景',
    q: '图书馆地下室有信号吗？',
    a: '"有！我们去年刚在图书馆加装了室内分布系统，地下自习室满格。你要不要现在跟我下去测一下？顺便给你看看我们实测的下载速度。"',
    tips: '实测比口说有说服力100倍',
  },
  {
    category: '竞品对比',
    q: '我室友用联通也挺好的',
    a: '"你室友用的什么套餐？我帮你对一下——联通的基站离你们宿舍远，下雨天信号容易断。我们电信在你们校区有3个基站，覆盖无死角。你问室友他打游戏有没有突然卡一下的时候？"',
    tips: '不贬低竞品，引导用户自己发现差异',
  },
]

export default function SalesPage() {
  const [activeCat, setActiveCat] = useState('全部')
  const [copied, setCopied] = useState('')

  const filtered = activeCat === '全部' ? SCRIPTS : SCRIPTS.filter(s => s.category === activeCat)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">⚡ 销售金句库</h1>
        <p className="text-sm text-zinc-500 mt-0.5">分类话术 · 一键复制 · 关联素材</p>
      </div>

      {/* 分类 */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setActiveCat(c)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              c === activeCat ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* 话术卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((s, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-500">{s.category}</span>
              <button
                onClick={() => handleCopy(s.a)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                  copied === s.a ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'text-zinc-600 hover:text-zinc-400'
                }`}>
                {copied === s.a ? '✓ 已复制' : '📋 复制'}
              </button>
            </div>
            <div className="text-xs text-amber-400 font-medium mb-1.5">客户问：{s.q}</div>
            <div className="text-sm text-zinc-300 leading-relaxed">{s.a}</div>
            <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center gap-2">
              <span className="text-[10px] text-zinc-600">💡 {s.tips}</span>
              <span className="text-[10px] text-indigo-500 ml-auto cursor-pointer hover:underline">🖼️ 查看关联素材 →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
