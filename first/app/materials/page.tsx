'use client'

import { useState, useEffect } from 'react'

interface Material {
  id: string; school: string; type: string; title: string; url: string; desc: string
}

const SCHOOLS = ['全部', '西油', '西华师大', '川北医']
const TYPES = ['全部', '实景照片', '宣传海报', '视频素材', '截图']

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [school, setSchool] = useState('全部')
  const [type, setType] = useState('全部')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ url: '', title: '', school: '西油', type: '实景照片', desc: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/materials')
      const json = await res.json()
      if (json.success) setMaterials(json.data)
    } catch {}
  }

  useEffect(() => { fetchMaterials() }, [])

  const filtered = materials.filter(m => {
    return (school === '全部' || m.school === school) && (type === '全部' || m.type === type)
  })

  const submitMaterial = async () => {
    if (!form.url.trim() || !form.title.trim()) { setError('请填写完整信息'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        setForm({ url: '', title: '', school: '西油', type: '实景照片', desc: '' })
        setShowAdd(false)
        await fetchMaterials()
      } else { setError(json.error) }
    } catch { setError('通信失败') }
    finally { setLoading(false) }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">📁 三校动态素材库</h1>
          <p className="text-sm text-zinc-500 mt-0.5">小红书/抖音扒图后粘贴URL一键入库 · 实时同步</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded border border-cyan-500/20 font-mono">
            库存：{materials.length} 个
          </span>
          <button onClick={() => setShowAdd(!showAdd)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg">
            {showAdd ? '× 取消' : '+ 添加素材'}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-zinc-900/50 border border-cyan-500/30 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-zinc-200">📥 粘贴图片URL入库</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
              placeholder="粘贴图片直链URL (https://...jpg)"
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none"/>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="素材名称（如：西油图书馆夕阳）"
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none"/>
            <div className="flex gap-2">
              <select value={form.school} onChange={e => setForm({ ...form, school: e.target.value })}
                className="flex-1 px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none">
                {SCHOOLS.filter(s => s !== '全部').map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="flex-1 px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none">
                {TYPES.filter(t => t !== '全部').map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <input value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })}
              placeholder="简短描述（选填）"
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none"/>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button onClick={submitMaterial} disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-lg disabled:opacity-50">
            {loading ? '入库中...' : '确认入库'}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <select value={school} onChange={e => setSchool(e.target.value)}
          className="text-xs bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300 outline-none">
          {SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {TYPES.map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-3 py-1.5 text-xs rounded-lg ${t === type ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
            {t}
          </button>
        ))}
        <span className="text-xs text-zinc-600 ml-auto">{filtered.length} 个结果</span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-zinc-600 py-12 border border-dashed border-zinc-800 rounded-xl">暂无素材，点「+ 添加素材」入库</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(m => (
            <div key={m.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden">
              <div className="h-40 bg-zinc-950 flex items-center justify-center border-b border-zinc-800/60 overflow-hidden">
                {m.url ? (
                  <img src={m.url} alt={m.title} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-all"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="100%25" height="100%25" fill="%23181b24"/><text x="50%25" y="50%25" text-anchor="middle" fill="%23374151" font-size="10">图片加载中</text></svg>' }}/>
                ) : (
                  <span className="text-xs text-zinc-600">待上传图片</span>
                )}
                <span className="absolute top-2 left-2 text-[10px] bg-zinc-950/80 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                  {m.school} · {m.type}
                </span>
              </div>
              <div className="p-3">
                <h3 className="text-xs font-bold text-zinc-200 truncate">{m.title}</h3>
                <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{m.desc || '暂无描述'}</p>
                <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-600 font-mono truncate max-w-[140px]">{m.url || '—'}</span>
                  <button onClick={() => copyUrl(m.url)}
                    className="text-[10px] bg-zinc-800 hover:bg-cyan-500 text-zinc-300 hover:text-black px-2 py-1 rounded font-bold transition-all">
                    📋 复制直链
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
