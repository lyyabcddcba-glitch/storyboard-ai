'use client'

import { useState, useEffect } from 'react'

interface Material {
  id: string
  school: string
  type: string
  title: string
  desc: string
  url: string
  year: string
}

const STORAGE_KEY = 'storyboard-materials'
const SCHOOLS = ['全部', '西油', '西华', '川医']
const TYPES = ['全部', '实景照片', '宣传海报', '视频素材', '截图']

function loadMaterials(): Material[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function saveMaterials(items: Material[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [school, setSchool] = useState('全部')
  const [type, setType] = useState('全部')
  const [showAdd, setShowAdd] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newSchool, setNewSchool] = useState('西油')
  const [newType, setNewType] = useState('实景照片')
  const [addError, setAddError] = useState('')

  useEffect(() => { setMaterials(loadMaterials()) }, [])

  const filtered = materials.filter(m => {
    const schoolOk = school === '全部' || m.school === school
    const typeOk = type === '全部' || m.type === type
    return schoolOk && typeOk
  })

  const addMaterial = () => {
    if (!newUrl || !newUrl.startsWith('http')) { setAddError('请输入有效图片URL'); return }
    if (!newTitle) { setAddError('请输入素材名称'); return }
    setAddError('')
    const item: Material = {
      id: Date.now().toString(),
      school: newSchool, type: newType, title: newTitle,
      desc: newDesc || newTitle, url: newUrl, year: '2025'
    }
    const updated = [item, ...materials]
    setMaterials(updated)
    saveMaterials(updated)
    setNewUrl(''); setNewTitle(''); setNewDesc('')
    setShowAdd(false)
  }

  const deleteMaterial = (id: string) => {
    const updated = materials.filter(m => m.id !== id)
    setMaterials(updated)
    saveMaterials(updated)
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">📁 三校素材库</h1>
          <p className="text-sm text-zinc-500 mt-0.5">图片URL入库 · 按学校分类 · 地推随时取用</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors">
          {showAdd ? '× 取消' : '+ 添加素材'}
        </button>
      </div>

      {/* 添加素材面板 */}
      {showAdd && (
        <div className="bg-zinc-900/50 border border-indigo-500/30 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-zinc-200">📥 粘贴图片URL入库</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
              placeholder="粘贴图片直链URL (https://...jpg)"
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none"/>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
              placeholder="素材名称（如：西油图书馆夕阳）"
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none"/>
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)}
              placeholder="简短描述（选填）"
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none"/>
            <div className="flex gap-2">
              <select value={newSchool} onChange={e => setNewSchool(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none">
                {SCHOOLS.filter(s => s !== '全部').map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={newType} onChange={e => setNewType(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none">
                {TYPES.filter(t => t !== '全部').map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          {addError && <p className="text-xs text-red-400">{addError}</p>}
          <button onClick={addMaterial}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg">
            确认入库
          </button>
        </div>
      )}

      {/* 筛选 */}
      <div className="flex flex-wrap gap-3">
        <select value={school} onChange={e => setSchool(e.target.value)}
          className="text-xs bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300 outline-none">
          {SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex gap-2">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${t === type ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
              {t}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-600 self-center ml-auto">{filtered.length} 个素材</span>
      </div>

      {/* 素材网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(m => (
          <div key={m.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden group">
            {/* 图片区 */}
            <div className="aspect-video bg-zinc-800 flex items-center justify-center overflow-hidden">
              <img src={m.url} alt={m.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                loading="lazy"/>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">{m.school}</span>
                <span className="text-[10px] text-zinc-600">{m.type}</span>
              </div>
              <div className="text-sm font-medium text-zinc-200 truncate">{m.title}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5 truncate">{m.desc}</div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => navigator.clipboard.writeText(m.url)}
                  className="flex-1 py-1.5 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors">
                  📋 复制URL
                </button>
                <button onClick={() => deleteMaterial(m.id)}
                  className="px-2 py-1.5 text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-zinc-600 py-10">
          该分类暂无素材，点右上角「+ 添加素材」粘贴图片URL入库
        </p>
      )}
    </div>
  )
}
