'use client'

import { useState, useEffect, useMemo } from 'react'

/* ── 类型 ── */
interface Material { id: string; school: string; type?: string; title: string; url: string; desc?: string }
interface TextMat { id: string; school: string; academy: string; major: string; tag: string; content: string }

const SCHOOLS = ['全部', '西油', '西华师大', '川北医', '西南石油大学']

/* ── 智能检索组件 ── */
function SmartSearch({ textCount }: { textCount: number }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const search = async () => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const r = await fetch('/api/materials-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) })
      const j = await r.json()
      if (j.success) setResults(j.results)
    } catch {} finally { setLoading(false) }
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">🔍</span>
        <h3 className="text-sm font-bold text-indigo-400">智能知识检索</h3>
        <span className="text-[10px] text-zinc-600">输入任意关键词，从 {textCount} 条库存中秒级匹配</span>
      </div>
      <div className="flex gap-2">
        <input value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="输入你想查的专业、学院、或任何关键词..."
          className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none focus:border-indigo-500"/>
        <button onClick={search} disabled={loading}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg disabled:opacity-50">
          {loading ? '检索中...' : '搜索'}
        </button>
      </div>
      {results.length > 0 && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {results.map((r: any, i: number) => (
            <div key={r.id || i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded">{r.school}</span>
                <span className="text-xs text-zinc-300 font-bold">{r.major}</span>
                <span className="text-[10px] text-zinc-500">{r.tag}</span>
                <span className="text-[10px] text-zinc-600 ml-auto">相关度: {r.score}</span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-3 mb-2">{r.content}</p>
              <button onClick={() => navigator.clipboard.writeText(r.content)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300">📋 复制整段</button>
            </div>
          ))}
        </div>
      )}
      {results.length === 0 && q && !loading && (
        <p className="text-xs text-zinc-600">没有匹配结果，尝试其他关键词或先录入相关知识</p>
      )}
    </div>
  )
}
const IMG_TYPES = ['全部', '实景照片', '宣传海报', '视频素材', '截图']
const TAG_OPTIONS = ['专业引流对线', '官方核心主旨', '考研深造去向', '扫楼破冰金句']
const SCHOOL_OPTS = ['西南石油大学', '西华师大', '川北医']

export default function MaterialsPage() {
  const [activeTab, setActiveTab] = useState<'img' | 'text'>('text')

  /* ── 图片 ── */
  const [materials, setMaterials] = useState<Material[]>([])
  const [school, setSchool] = useState('全部'); const [type, setType] = useState('全部')
  const [showAdd, setShowAdd] = useState(false)
  const [imgForm, setImgForm] = useState({ url: '', title: '', school: '西油', type: '实景照片', desc: '' })
  const [imgLoading, setImgLoading] = useState(false); const [imgError, setImgError] = useState('')

  const fetchImg = async () => {
    try { const r = await fetch('/api/materials'); const j = await r.json(); if (j.success) setMaterials(j.data) } catch {}
  }
  useEffect(() => { fetchImg() }, [])

  const filteredImg = useMemo(() => materials.filter(m =>
    (school === '全部' || m.school === school) && (type === '全部' || (m as any).type === type)
  ), [materials, school, type])

  const submitImg = async () => {
    if (!imgForm.url.trim() || !imgForm.title.trim()) { setImgError('请填写完整'); return }
    setImgError(''); setImgLoading(true)
    try {
      const r = await fetch('/api/materials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(imgForm) })
      const j = await r.json()
      if (j.success) { setImgForm({ url: '', title: '', school: '西油', type: '实景照片', desc: '' }); setShowAdd(false); fetchImg() }
      else setImgError(j.error)
    } catch { setImgError('通信失败') }
    finally { setImgLoading(false) }
  }

  /* ── 文字 ── */
  const [texts, setTexts] = useState<TextMat[]>([])
  const [textForm, setTextForm] = useState({ school: '西南石油大学', academy: '', major: '', tag: '专业引流对线', content: '' })
  const [textLoading, setTextLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchTexts = async () => {
    try { const r = await fetch('/api/materials-text'); const j = await r.json(); if (j.success) setTexts(j.data) } catch {}
  }
  useEffect(() => { fetchTexts() }, [])

  const filteredTexts = useMemo(() => {
    if (!searchQuery.trim()) return texts
    const q = searchQuery.toLowerCase()
    return texts.filter(t => t.major.includes(q) || t.content.includes(q) || t.academy.includes(q) || t.school.includes(q))
  }, [texts, searchQuery])

  const submitText = async () => {
    if (!textForm.major.trim() || !textForm.content.trim()) return
    setTextLoading(true)
    try {
      const r = await fetch('/api/materials-text', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(textForm) })
      const j = await r.json()
      if (j.success) { setTextForm({ school: '西南石油大学', academy: '', major: '', tag: '专业引流对线', content: '' }); fetchTexts() }
    } catch {}
    finally { setTextLoading(false) }
  }

  /* ── 公共 ── */
  const copy = (t: string) => { navigator.clipboard.writeText(t) }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">⚙️ 三校一体化战时素材库</h1>
          <p className="text-sm text-zinc-500 mt-0.5">自主录入网络素材，赋能地推团队，告别改代码时代</p>
        </div>
        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button onClick={() => setActiveTab('img')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'img' ? 'bg-amber-500 text-black' : 'text-zinc-400'}`}>
            📸 图片素材
          </button>
          <button onClick={() => setActiveTab('text')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'text' ? 'bg-cyan-500 text-black' : 'text-zinc-400'}`}>
            📝 话术/文字库
          </button>
        </div>
      </div>

      {/* ========== 图片 Tab ========== */}
      {activeTab === 'img' && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">库存：{materials.length} 个素材</span>
            <button onClick={() => setShowAdd(!showAdd)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-lg">
              {showAdd ? '× 取消' : '+ 添加图片'}
            </button>
          </div>
          {showAdd && (
            <div className="bg-zinc-900/50 border border-amber-500/30 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-zinc-200">📥 粘贴图片URL入库</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={imgForm.url} onChange={e => setImgForm(p => ({ ...p, url: e.target.value }))}
                  placeholder="图片直链URL (https://...jpg)"
                  className="w-full px-3 py-2.5 bg-zinc-900 border rounded-lg text-sm outline-none"/>
                <input value={imgForm.title} onChange={e => setImgForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="素材名称"
                  className="w-full px-3 py-2.5 bg-zinc-900 border rounded-lg text-sm outline-none"/>
                <div className="flex gap-2">
                  <select value={imgForm.school} onChange={e => setImgForm(p => ({ ...p, school: e.target.value }))}
                    className="flex-1 px-3 py-2.5 bg-zinc-900 border rounded-lg text-sm outline-none">
                    {SCHOOLS.filter(s => s !== '全部').map(s => <option key={s}>{s}</option>)}
                  </select>
                  <select value={imgForm.type} onChange={e => setImgForm(p => ({ ...p, type: e.target.value }))}
                    className="flex-1 px-3 py-2.5 bg-zinc-900 border rounded-lg text-sm outline-none">
                    {IMG_TYPES.filter(t => t !== '全部').map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <input value={imgForm.desc} onChange={e => setImgForm(p => ({ ...p, desc: e.target.value }))}
                  placeholder="简短描述（选填）"
                  className="w-full px-3 py-2.5 bg-zinc-900 border rounded-lg text-sm outline-none"/>
              </div>
              {imgError && <p className="text-xs text-red-400">{imgError}</p>}
              <button onClick={submitImg} disabled={imgLoading}
                className="w-full py-2.5 bg-amber-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">
                {imgLoading ? '入库中...' : '确认入库'}
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <select value={school} onChange={e => setSchool(e.target.value)}
              className="text-xs bg-zinc-900 border rounded-lg px-3 py-2 text-zinc-300 outline-none">
              {SCHOOLS.map(s => <option key={s}>{s}</option>)}
            </select>
            {IMG_TYPES.map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`px-3 py-1.5 text-xs rounded-lg ${t === type ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>{t}</button>
            ))}
            <span className="text-xs text-zinc-600 self-center ml-auto">{filteredImg.length} 个</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredImg.map(m => (
              <div key={m.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden">
                <div className="h-36 bg-zinc-950 flex items-center justify-center border-b border-zinc-800/60 overflow-hidden">
                  {m.url ? <img src={m.url} alt={m.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}/> : <span className="text-xs text-zinc-600">待上传</span>}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">{m.school}</span>
                    <span className="text-[10px] text-zinc-600">{(m as any).type || '图片'}</span>
                  </div>
                  <h3 className="text-xs font-bold text-zinc-200 truncate">{m.title}</h3>
                  <button onClick={() => copy(m.url)} className="mt-2 w-full py-1.5 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg">📋 复制直链</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ========== 文字 Tab ========== */}
      {activeTab === 'text' && (
        <>
          {/* 🔍 智能检索 — 输入问题立刻匹配库存知识 */}
          <SmartSearch textCount={texts.length} />

          <div className="bg-zinc-900/50 border border-cyan-500/20 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-cyan-400">📥 专业/聊天文字素材录入</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select value={textForm.school} onChange={e => setTextForm(p => ({ ...p, school: e.target.value }))}
                className="w-full px-3 py-2.5 bg-zinc-900 border rounded-lg text-sm outline-none">
                {SCHOOL_OPTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <input value={textForm.academy} onChange={e => setTextForm(p => ({ ...p, academy: e.target.value }))}
                placeholder="学院（如：计算机学院）"
                className="w-full px-3 py-2.5 bg-zinc-900 border rounded-lg text-sm outline-none"/>
              <input value={textForm.major} onChange={e => setTextForm(p => ({ ...p, major: e.target.value }))}
                placeholder="专业名称（如：数字媒体技术）"
                className="w-full px-3 py-2.5 bg-zinc-900 border rounded-lg text-sm outline-none"/>
              <select value={textForm.tag} onChange={e => setTextForm(p => ({ ...p, tag: e.target.value }))}
                className="w-full px-3 py-2.5 bg-zinc-900 border rounded-lg text-sm outline-none">
                {TAG_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <textarea value={textForm.content} onChange={e => setTextForm(p => ({ ...p, content: e.target.value }))}
              rows={5} placeholder="在此输入销售可以直接复制发给新生的长文..."
              className="w-full px-3 py-3 bg-zinc-900 border rounded-lg text-sm text-zinc-200 outline-none resize-none"/>
            <div className="flex justify-end">
              <button onClick={submitText} disabled={textLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-500 text-white text-sm font-bold rounded-lg disabled:opacity-50">
                {textLoading ? '入库中...' : '确认存入文字库'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-zinc-300">🗄️ 文字卡片流 · 一键复制去对线</span>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="🔍 搜索专业、核心词..."
              className="bg-zinc-900 border border-zinc-800 text-xs px-3 py-1.5 rounded-lg w-48 outline-none"/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTexts.map(txt => (
              <div key={txt.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs bg-cyan-950 border border-cyan-800 text-cyan-400 px-2 py-0.5 rounded font-bold mr-2">{txt.school}</span>
                    <span className="text-xs text-zinc-300 font-bold">{txt.major}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">{txt.tag}</span>
                </div>
                <div className="text-[11px] text-zinc-500 mb-2 italic">{txt.academy}</div>
                <p className="text-sm text-zinc-200 bg-zinc-950 p-3 rounded border border-zinc-800 whitespace-pre-line leading-relaxed">{txt.content}</p>
                <button onClick={() => copy(txt.content)}
                  className="mt-3 w-full py-2 text-xs bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-black rounded-lg font-bold transition-all">
                  📋 复制整段话术直发
                </button>
              </div>
            ))}
          </div>
          {filteredTexts.length === 0 && <p className="text-center text-zinc-600 py-10 border border-dashed border-zinc-800 rounded-xl">暂无文字素材，上方录入第一条</p>}
        </>
      )}
    </div>
  )
}
