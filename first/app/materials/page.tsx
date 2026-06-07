'use client'

import { useState } from 'react'

const SCHOOLS = ['全部', '西油', '西华', '川医']
const TYPES = ['全部', 'AI 生成图', '宣传海报', '视频素材']

const MATERIALS = [
  { id: 1, school: '西油', type: 'AI 生成图', title: '图书馆夕阳', desc: '暖橙金调 · 大远景 · AI Kolors 生成', year: '2025' },
  { id: 2, school: '西油', type: 'AI 生成图', title: '实训中心', desc: '蓝灰调 · 中景 · AI Kolors 生成', year: '2025' },
  { id: 3, school: '西华', type: 'AI 生成图', title: '校门全景', desc: '逆光剪影 · 全景 · AI Kolors 生成', year: '2025' },
  { id: 4, school: '川医', type: 'AI 生成图', title: '图书馆内景', desc: '暖光柔调 · 中近景 · AI Kolors 生成', year: '2025' },
  { id: 5, school: '西油', type: '宣传海报', title: '39元校园卡海报', desc: '80G流量+宿舍宽带', year: '2025' },
  { id: 6, school: '西华', type: '宣传海报', title: '宿舍开黑对比图', desc: '电信 vs 其他卡延迟对比', year: '2025' },
  { id: 7, school: '川医', type: '视频素材', title: '新生报到攻略 vlog', desc: '3分钟教你办完所有手续', year: '2025' },
  { id: 8, school: '全部', type: '视频素材', title: '校园卡套餐介绍', desc: '标准模板 · 可替换校名', year: '2025' },
]

export default function MaterialsPage() {
  const [school, setSchool] = useState('全部')
  const [type, setType] = useState('全部')

  const filtered = MATERIALS.filter(m =>
    (school === '全部' || m.school === school) &&
    (type === '全部' || m.type === type)
  )

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">📁 三校素材库</h1>
        <p className="text-sm text-zinc-500 mt-0.5">按学校分类 · 一键下载 · AI 生成图自动同步</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={school} onChange={e => setSchool(e.target.value)}
          className="text-xs bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300 outline-none">
          {SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex gap-2">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                t === type ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
              }`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(m => (
          <div key={m.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors group">
            <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <span className="text-5xl opacity-20 group-hover:opacity-40 transition-opacity">
                {m.type.includes('图') ? '🖼️' : m.type.includes('海报') ? '📊' : '🎬'}
              </span>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">{m.school}</span>
                <span className="text-[10px] text-zinc-600">{m.type}</span>
              </div>
              <div className="text-sm font-medium text-zinc-200">{m.title}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{m.desc}</div>
              <button className="mt-3 w-full py-2 text-xs bg-zinc-800 hover:bg-indigo-500/20 text-zinc-400 hover:text-indigo-400 rounded-lg transition-all">
                📥 下载素材
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-zinc-600 py-10">该分类暂无素材，去 <a href="/storyboard" className="text-indigo-500 underline">创作中心</a> 用 AI 生成</p>
      )}
    </div>
  )
}
