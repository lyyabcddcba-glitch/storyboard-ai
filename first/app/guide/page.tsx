'use client'

import { useState } from 'react'
import Link from 'next/link'
import { salesHubDatabase, CHECKLIST_ITEMS } from '@/lib/campus-data'

const SCHOOLS = Object.values(salesHubDatabase)
const TYPE_COLORS: Record<string, string> = {
  danger: 'border-red-500/30 bg-red-500/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
  info: 'border-blue-500/30 bg-blue-500/5',
  success: 'border-green-500/30 bg-green-500/5',
  primary: 'border-indigo-500/30 bg-indigo-500/5',
}

const TAG_COLORS: Record<string, string> = {
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
}

export default function GuidePage() {
  const [activeSchool, setActiveSchool] = useState('swpu')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState('')
  const [showPitchTip, setShowPitchTip] = useState(false)
  const campus = salesHubDatabase[activeSchool]

  const toggleCheck = (id: string) => {
    setChecklist(prev => {
      const next = { ...prev, [id]: !prev[id] }
      // 如果勾选了带 triggerPitch 的项，弹出扫楼话术
      const item = CHECKLIST_ITEMS.find(i => i.id === id)
      if (next[id] && (item as any)?.triggerPitch) {
        setShowPitchTip(true)
        setTimeout(() => setShowPitchTip(false), 8000)
      }
      return next
    })
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(''), 2000)
  }

  const checkedCount = Object.values(checklist).filter(Boolean).length

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">📚 三校战时知识库</h1>
          <p className="text-sm text-zinc-500 mt-0.5">团队内部工具 · 极速检索 · 痛点高亮 · 扫楼军师</p>
        </div>
        <Link href="/sales" className="text-xs text-indigo-400 hover:text-indigo-300 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
          💬 打开销售金句库 →
        </Link>
      </div>

      {/* 学校切换 Tab */}
      <div className="flex gap-2">
        {SCHOOLS.map(s => (
          <button key={s.key} onClick={() => { setActiveSchool(s.key); setShowPitchTip(false) }}
            className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all border ${
              activeSchool === s.key
                ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
            }`}>
            {s.short}
            <span className="block text-[10px] font-normal text-zinc-600 mt-0.5">{s.targetAudience.slice(0, 12)}...</span>
          </button>
        ))}
      </div>

      {/* 🎯 绝杀话术卡片（霓虹边框） */}
      <div className="relative bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-2 border-amber-500/30 rounded-2xl p-6 shadow-xl shadow-amber-500/5">
        <div className="absolute -top-3 left-6 text-[10px] font-bold text-amber-500 bg-zinc-950 px-3 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-widest">
          🎯 {campus.short} 绝杀话术
        </div>
        <div className="flex items-center gap-2 mb-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-500">面向：{campus.targetAudience}</span>
        </div>
        <p className="text-sm text-zinc-200 leading-relaxed">{campus.killerPitch}</p>
        <button
          onClick={() => handleCopy(campus.killerPitch)}
          className={`mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
            copied === campus.killerPitch
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-amber-500 hover:bg-amber-400 text-black'
          }`}>
          {copied === campus.killerPitch ? '✓ 已复制到剪贴板' : '📋 一键复制绝杀话术'}
        </button>
      </div>

      {/* 五维核心知识格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {campus.gridData.map((item, i) => (
          <div key={i} className={`rounded-xl border p-5 ${TYPE_COLORS[item.type]} transition-all hover:scale-[1.01]`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-zinc-200">{item.title}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${TAG_COLORS[item.type]}`}>{item.tag}</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">{item.content}</p>
          </div>
        ))}
      </div>

      {/* 📋 入学物资清单 + 动态扫楼提示 */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-200">📋 入学物资清单</h3>
          <span className="text-xs text-zinc-500">{checkedCount}/{CHECKLIST_ITEMS.length} 项</span>
        </div>

        {/* 动态扫楼话术弹出 */}
        {showPitchTip && (
          <div className="mb-4 bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/30 rounded-xl p-4 animate-pulse">
            <div className="text-[10px] text-amber-500 uppercase tracking-widest mb-1">💡 队员扫楼话术提示</div>
            <div className="space-y-1">
              {campus.checklistHighlights.map((hint, i) => (
                <p key={i} className="text-xs text-zinc-300">• {hint}</p>
              ))}
            </div>
            <Link href="/booking"
              className="inline-flex items-center gap-1 mt-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 hover:bg-amber-500/20">
              📱 打开选号预约页备用 →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {CHECKLIST_ITEMS.map(item => (
            <label key={item.id}
              className={`flex items-center gap-2.5 p-3 rounded-lg cursor-pointer transition-all border ${
                checklist[item.id]
                  ? 'bg-green-500/5 border-green-500/20'
                  : (item as any).triggerPitch
                    ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}>
              <input type="checkbox" checked={!!checklist[item.id]} onChange={() => toggleCheck(item.id)}
                className="w-4 h-4 rounded accent-indigo-500"/>
              <span className={`text-xs ${checklist[item.id] ? 'text-zinc-500 line-through' : 'text-zinc-400'}`}>
                {item.label}
                {(item as any).triggerPitch && <span className="text-amber-500 ml-0.5">⚡</span>}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 三校对比速览 */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-zinc-200 mb-4">📊 三校痛点对比速览</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-left">
                <th className="py-2 pr-4 font-medium">学校</th>
                <th className="py-2 pr-4 font-medium">断电时间</th>
                <th className="py-2 pr-4 font-medium">宿舍规格</th>
                <th className="py-2 pr-4 font-medium">核心痛点</th>
                <th className="py-2 font-medium">绝杀锚点</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400 text-xs">
              {SCHOOLS.map(s => (
                <tr key={s.key} className={`border-b border-zinc-800/50 ${activeSchool === s.key ? 'bg-indigo-500/5' : ''}`}>
                  <td className="py-3 pr-4 text-zinc-200 font-medium">{s.short}</td>
                  <td className="py-3 pr-4">{s.gridData[0]?.content.slice(0, 25)}...</td>
                  <td className="py-3 pr-4">{s.gridData[1]?.tag || '-'}</td>
                  <td className="py-3 pr-4"><span className="text-red-400">{s.gridData[0]?.tag}</span></td>
                  <td className="py-3"><span className="text-amber-400">{s.gridData.find(g => g.type === 'danger')?.tag || s.gridData[0]?.tag}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
