'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CAMPUS_DATA, CHECKLIST_ITEMS } from '@/lib/campus-data'

const SCHOOLS = Object.values(CAMPUS_DATA)

export default function GuidePage() {
  const [activeSchool, setActiveSchool] = useState('swpu')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const campus = CAMPUS_DATA[activeSchool]

  const toggleCheck = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const checkedCount = Object.values(checklist).filter(Boolean).length

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-white">📚 新生入学完全指南</h1>
        <p className="text-sm text-zinc-500 mt-0.5">三校专属攻略 · 学长老兵亲测 · 扫楼转发神器</p>
      </div>

      {/* 学校切换 */}
      <div className="flex gap-2">
        {SCHOOLS.map(s => (
          <button key={s.key} onClick={() => setActiveSchool(s.key)}
            className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
              activeSchool === s.key
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
            }`}>
            {s.key === 'swpu' ? '🛢️ 西油' : s.key === 'cwnu' ? '📚 西华师大' : '🏥 川北医'}
          </button>
        ))}
      </div>

      {/* 学校标签 */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white">{campus.name}</h2>
        <p className="text-sm text-amber-400 mt-1">{campus.tagline}</p>
      </div>

      {/* 核心信息卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 宿舍 */}
        <InfoCard icon="🏠" title="住宿条件" highlight="断电断网">
          <p className="text-sm text-zinc-300 mb-2">{campus.accommodation.specs}</p>
          <WarningBlock>{campus.accommodation.power_trap}</WarningBlock>
          <DangerBlock>{campus.accommodation.blackout}</DangerBlock>
        </InfoCard>

        {/* 军训 */}
        <InfoCard icon="🪖" title="军训须知">
          <p className="text-sm text-zinc-300 mb-1">
            军训服装费：<strong className="text-white">{campus.clothing.militaryPrice > 0 ? `¥${campus.clothing.militaryPrice}` : '免费！'}</strong>
          </p>
          <WarningBlock>{campus.clothing.tips}</WarningBlock>
        </InfoCard>

        {/* 食堂 */}
        <InfoCard icon="🍔" title="食堂与外卖">
          <p className="text-sm text-zinc-300 mb-2">{campus.food.info}</p>
          <div className="text-xs text-zinc-500 bg-zinc-950 rounded-lg p-2.5">
            🛵 {campus.food.delivery}
          </div>
        </InfoCard>

        {/* 学业 */}
        <InfoCard icon="📖" title="学业成绩">
          <DetailRow label="绩点算法" value={campus.academic.gpa} />
          <DetailRow label="四级/英语" value={campus.academic.cet4} />
          <DetailRow label="综测权重" value={campus.academic.weight} />
        </InfoCard>
      </div>

      {/* 📋 入学清单 */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-zinc-200">📋 入学必带清单</h3>
          <span className="text-xs text-zinc-500">{checkedCount}/{CHECKLIST_ITEMS.length} 项已勾选</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {CHECKLIST_ITEMS.map(item => (
            <label key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                checklist[item.id]
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}>
              <input type="checkbox" checked={!!checklist[item.id]} onChange={() => toggleCheck(item.id)}
                className="w-4 h-4 rounded accent-indigo-500"/>
              <span className={`text-sm ${checklist[item.id] ? 'text-zinc-300 line-through' : 'text-zinc-400'}`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>

        {/* 路由器+电脑下方挂 Pitch Banner */}
        {checklist['router'] && (
          <div className="mt-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 animate-pulse">
            <p className="text-sm text-amber-400 font-medium mb-2">💡 学长提醒：{campus.pitch}</p>
            <Link href="/booking"
              className="inline-flex items-center gap-1.5 text-sm text-white bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded-lg font-bold transition-colors">
              📱 抢个靓号，报到当天领卡 →
            </Link>
          </div>
        )}
      </div>

      {/* 三校对比速览 */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-base font-bold text-zinc-200 mb-4">📊 三校断电断网对比速览</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-left">
                <th className="py-2 pr-4 font-medium">学校</th>
                <th className="py-2 pr-4 font-medium">断电时间</th>
                <th className="py-2 pr-4 font-medium">Wi-Fi状态</th>
                <th className="py-2 pr-4 font-medium">限电功率</th>
                <th className="py-2 font-medium">宿舍规格</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              {SCHOOLS.map(s => (
                <tr key={s.key} className={`border-b border-zinc-800/50 ${activeSchool === s.key ? 'bg-indigo-500/5' : ''}`}>
                  <td className="py-3 pr-4 text-zinc-200 font-medium">{s.key === 'swpu' ? '西油' : s.key === 'cwnu' ? '西华师大' : '川北医'}</td>
                  <td className="py-3 pr-4">{s.accommodation.blackout.slice(0, 20)}...</td>
                  <td className="py-3 pr-4"><span className="text-red-400">断电即断</span></td>
                  <td className="py-3 pr-4">{s.accommodation.power_trap.slice(0, 15)}...</td>
                  <td className="py-3">{s.accommodation.specs.slice(0, 20)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 底部引流 */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-5 text-center">
        <p className="text-sm text-zinc-300 mb-3">
          💡 把这个页面转发到新生群，新生自己查阅攻略。<br/>勾选到「路由器」还会自动弹出选号入口，被动获客！
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/sales" className="text-xs text-indigo-400 hover:text-indigo-300">💬 查看销售金句库 →</Link>
          <Link href="/booking" className="text-xs text-amber-400 hover:text-amber-300">📱 直接去选号预约 →</Link>
        </div>
      </div>
    </div>
  )
}

/* ── 子组件 ── */

function InfoCard({ icon, title, highlight, children }: { icon: string; title: string; highlight?: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="text-sm font-bold text-zinc-200">{title}</h3>
        {highlight && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">{highlight}</span>}
      </div>
      {children}
    </div>
  )
}

function WarningBlock({ children }: { children: string }) {
  return <div className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 mb-2">⚠️ {children}</div>
}

function DangerBlock({ children }: { children: string }) {
  return <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg p-2.5">🔴 {children}</div>
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-xs text-zinc-400 leading-relaxed">{value}</div>
    </div>
  )
}
