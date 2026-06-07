'use client'

import { useState } from 'react'

const HOT_NUMBERS = [
  { number: '138****8888', tier: '至尊', price: '0元', desc: '事业发达' },
  { number: '180****6666', tier: '热门', price: '0元', desc: '顺风顺水' },
  { number: '133****9999', tier: '热门', price: '0元', desc: '长长久久' },
  { number: '189****5200', tier: '精选', price: '0元', desc: '我爱你' },
  { number: '177****1314', tier: '精选', price: '0元', desc: '一生一世' },
  { number: '153****0000', tier: '优选', price: '0元', desc: '始于初心' },
]

const PACKAGES = [
  { name: '39元校园卡', data: '80G', wifi: '含宿舍宽带', extra: '送120分钟通话', popular: true },
  { name: '29元轻享卡', data: '50G', wifi: '含宿舍宽带', extra: '送60分钟通话', popular: false },
  { name: '19元体验卡', data: '30G', wifi: '不含宽带', extra: '送30分钟通话', popular: false },
]

export default function BookingPage() {
  const [selected, setSelected] = useState('')
  const [pkg, setPkg] = useState('39元校园卡')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [school, setSchool] = useState('西油')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !selected) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-xl font-bold text-white mb-2">预约成功！</h1>
          <p className="text-sm text-zinc-400 mb-1">靓号 <span className="text-amber-400 font-bold">{selected}</span></p>
          <p className="text-sm text-zinc-400 mb-1">套餐 <span className="text-indigo-400">{pkg}</span></p>
          <p className="text-sm text-zinc-400 mb-4">{school} · {name} · {phone}</p>
          <p className="text-xs text-zinc-600">报到当天凭身份证到校园卡服务中心领取</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white">🎁 靓号预约登记</h1>
        <p className="text-sm text-zinc-500 mt-0.5">新生专属 · 免费选靓号 · 报到当天领卡</p>
      </div>

      {/* 套餐选择 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PACKAGES.map(p => (
          <button key={p.name} onClick={() => setPkg(p.name)}
            className={`relative text-left p-4 rounded-xl border transition-all ${
              pkg === p.name ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
            }`}>
            {p.popular && <span className="absolute -top-2 -right-2 text-[10px] bg-amber-500 text-black font-bold px-2 py-0.5 rounded-full">推荐</span>}
            <div className="text-sm font-bold text-zinc-200">{p.name}</div>
            <div className="text-2xl font-extrabold text-white mt-1">{p.data}</div>
            <div className="text-xs text-zinc-500 mt-1">{p.wifi} · {p.extra}</div>
          </button>
        ))}
      </div>

      {/* 靓号池 */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">🔥 热门靓号池（免费选）</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {HOT_NUMBERS.map(n => (
            <button key={n.number} onClick={() => setSelected(n.number)}
              className={`text-left p-3 rounded-lg border transition-all ${
                selected === n.number ? 'border-amber-500/50 bg-amber-500/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
              }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">{n.tier}</span>
                {selected === n.number && <span className="text-xs text-amber-400">✓</span>}
              </div>
              <div className="text-sm font-mono text-zinc-200">{n.number}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{n.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 登记表单 */}
      <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300">📝 登记信息</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">姓名 *</label>
            <input value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500/30"/>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">手机号 *</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} required className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500/30"/>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">学校</label>
            <select value={school} onChange={e => setSchool(e.target.value)} className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none">
              <option value="西油">西南石油大学</option>
              <option value="西华">西华大学</option>
              <option value="川医">四川医科大学</option>
            </select>
          </div>
        </div>
        <div className="pt-2 flex justify-between items-center">
          <div className="text-xs text-zinc-600">
            已选：<span className="text-amber-400">{selected || '未选靓号'}</span> · <span className="text-indigo-400">{pkg}</span>
          </div>
          <button type="submit" disabled={!name || !phone || !selected}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-sm rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            确认预约
          </button>
        </div>
      </form>
    </div>
  )
}
