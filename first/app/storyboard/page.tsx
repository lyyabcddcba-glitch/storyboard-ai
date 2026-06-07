'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { salesHubDatabase } from '@/lib/campus-data'

const VIDEO_TYPES = ['商业广告', '剧情短片', '知识科普', '音乐MV', 'Vlog日常', '宣传片', '微电影', '纪录片']

interface DeviceOption { icon: string; title: string; subtitle: string; value: string; promptHint: string }
const DEVICES: DeviceOption[] = [
  { icon: '🛸', title: '大疆 Pocket 3', subtitle: '一英寸 / 20mm 等效广角 · Vlog、街拍', value: 'DJI Pocket 3, 20mm等效广角, 一英寸传感器', promptHint: '运镜多用智能跟随、第一人称POV、三轴防抖推进。景别以中近景为主。' },
  { icon: '📱', title: '手机竖屏 (9:16)', subtitle: '主摄 24mm · 抖音、小红书短视频', value: '手机竖屏 9:16画幅, 主摄等效24mm', promptHint: '前3秒黄金钩子。运镜快节奏。字幕要大，构图中心化。特写和中近景为主。' },
  { icon: '📱', title: '手机横屏 (16:9)', subtitle: '电影模式 26mm · B站、微电影', value: '手机横屏 16:9画幅, 电影模式等效26mm', promptHint: '手机电影模式浅景深。运镜平稳：横移、推轨、摇镜。手持微抖动可转化为风格化摄影。' },
  { icon: '📷', title: '微单/单反 35mm', subtitle: 'Sony Alpha / Canon · 口播、剧情短片', value: '微单 35mm人文焦段, APS-C/全画幅', promptHint: '35mm焦段适合叙事。运镜多用固定镜头和慢推。景深控制好主体与背景关系。' },
  { icon: '🚁', title: '航拍无人机', subtitle: 'DJI Mavic · 大远景、上帝视角', value: 'DJI Mavic 航拍无人机, 等效24mm广角', promptHint: '景别以大远景和全景为主。运镜必用：刷锅绕飞、俯冲拉升、上帝视角俯拍。' },
  { icon: '🎥', title: '电影机 (ARRI/RED)', subtitle: '变形宽银幕 · 商业大片、院线质感', value: 'ARRI Alexa / RED, 电影级变形宽银幕镜头', promptHint: '电影级质感。多用高格慢动作、浅景深大特写、侧光和逆光为主。' },
]

interface Shot { id: number; camera_setup: string; shot_size: string; camera_movement: string; visual_art: string; content_description: string; dialogue: string; voiceover: string; sound_effects: string; transition: string; duration: number; props_costumes: string; remarks: string }

const FIELD_LABELS: [keyof Shot, string, string][] = [
  ['camera_setup', '🎥 机位镜头', 'text-indigo-400'], ['shot_size', '📐 景别', 'text-sky-400'], ['camera_movement', '🎬 运镜', 'text-emerald-400'],
  ['visual_art', '🎨 美术视觉', 'text-amber-400'], ['content_description', '🎭 内容描述', 'text-rose-400'], ['dialogue', '💬 台词', 'text-yellow-400'],
  ['voiceover', '🎙️ 旁白/独白', 'text-violet-400'], ['sound_effects', '🔊 音效/音乐', 'text-cyan-400'], ['props_costumes', '👔 道具/服装', 'text-pink-400'],
  ['remarks', '📝 备注', 'text-zinc-400'],
]

function extractJsonArray(text: string): any[] | null {
  let t = text.replace(/```json\s*/gi, '').replace(/```\w*\s*/g, '').replace(/```/g, '').trim()
  if (!t) return null
  let s = t.indexOf('['), e = t.lastIndexOf(']')
  if (s === -1 || s >= e) { s = t.indexOf('{'); e = t.lastIndexOf('}'); if (s === -1 || s >= e) return null; t = '[' + t.slice(s, e + 1) + ']'; s = 0; e = t.length - 1 }
  let c = t.slice(s, e + 1).replace(/,\s*\]/g, ']').replace(/,\s*\}/g, '}')
  let ob = (c.match(/\{/g)||[]).length, cb = (c.match(/\}/g)||[]).length
  for (let i = 0; i < ob - cb; i++) c += '}'
  try { const p = JSON.parse(c); if (Array.isArray(p)) return p } catch {}
  try { const re = /\{((?:[^{}]|\{[^{}]*\})*)\}/g; const items: any[] = []; let m; while ((m = re.exec(t)) !== null) { try { items.push(JSON.parse(m[0])) } catch {} }; if (items.length) return items } catch {}
  return null
}

export default function StoryboardPage() {
  const [theme, setTheme] = useState('')
  const [style, setStyle] = useState('')
  const [schoolCtx, setSchoolCtx] = useState('')  // 三校上下文注入
  const [videoType, setVideoType] = useState('商业广告')
  const [deviceIdx, setDeviceIdx] = useState(0)
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false)
  const device = DEVICES[deviceIdx]
  const [shotCount, setShotCount] = useState(8)
  const [generating, setGenerating] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [shots, setShots] = useState<Shot[]>([])
  const [selectedShot, setSelectedShot] = useState<Shot | null>(null)
  const [exporting, setExporting] = useState(false)
  const [drawingShotId, setDrawingShotId] = useState<number | null>(null)
  const [shotImages, setShotImages] = useState<Record<number, { url?: string; author?: string; keywords?: string; loading?: boolean }>>({})
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const streamRef = useRef<HTMLDivElement>(null)
  const selectedShotRef = useRef<Shot | null>(null)
  const fullTextRef = useRef('')
  const router = useRouter()

  const isApproved = true  // 简化：在这个页面不强制校验登录

  const handleSearchImage = async (shot: Shot, e: React.MouseEvent) => {
    e.stopPropagation()
    if (drawingShotId) return
    setDrawingShotId(shot.id)
    setShotImages(prev => ({ ...prev, [shot.id]: { loading: true } }))
    try {
      const res = await fetch('/api/search-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visual_art: shot.visual_art, content_description: shot.content_description, shot_size: shot.shot_size, camera_setup: shot.camera_setup, camera_movement: shot.camera_movement, props_costumes: shot.props_costumes }),
      })
      const data = await res.json()
      if (data.success && data.url) {
        setShotImages(prev => ({ ...prev, [shot.id]: { url: data.url, author: data.author, keywords: data.prompt?.slice(0, 50), loading: false } }))
      } else {
        setShotImages(prev => ({ ...prev, [shot.id]: { loading: false } }))
      }
    } catch { setShotImages(prev => ({ ...prev, [shot.id]: { loading: false } })) }
    finally { setDrawingShotId(null) }
  }

  const handleGenerate = useCallback(async () => {
    if (!theme.trim() || generating) return
    setGenerating(true); setStreamingText(''); setShots([]); setSelectedShot(null); selectedShotRef.current = null; fullTextRef.current = ''
    let finalShots: Shot[] = []
    try {
      const res = await fetch('/api/storyboard/stream', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: theme.trim(), style: style.trim(), videoType, equipment: device.value, promptHint: device.promptHint + (schoolCtx ? ' ' + schoolCtx : ''), shotCount }),
      })
      const reader = res.body?.getReader(); if (!reader) throw new Error('No reader')
      const decoder = new TextDecoder(); let partial = ''
      while (true) {
        const { done, value } = await reader.read()
        if (value) partial += decoder.decode(value, { stream: true })
        if (done) {
          if (partial.trim()) {
            const lines = partial.split('\n').filter((l: string) => l.startsWith('data: '))
            for (const line of lines) {
              try { const d = JSON.parse(line.slice(6)); if (d.done && Array.isArray(d.shots) && d.shots.length > 0) finalShots = d.shots } catch {}
            }
          }
          break
        }
        const events = partial.split('\n\n'); partial = events.pop() || ''
        for (const event of events) {
          const lines = event.split('\n').filter((l: string) => l.startsWith('data: '))
          for (const line of lines) {
            try {
              const d = JSON.parse(line.slice(6))
              if (d.token) { fullTextRef.current += d.token; setStreamingText(prev => prev + d.token) }
              if (d.buffer) { const m = extractJsonArray(d.buffer); if (m && m.length > 0 && m[0].id) { setShots(m); if (!selectedShotRef.current) { setSelectedShot(m[0]); selectedShotRef.current = m[0] } } }
              if (d.done && Array.isArray(d.shots) && d.shots.length > 0) finalShots = d.shots
            } catch {}
          }
        }
        if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight
      }
      if (finalShots.length > 0) { setShots(finalShots); setSelectedShot(finalShots[0]); selectedShotRef.current = finalShots[0] }
      else if (fullTextRef.current.length > 0) { const fb = extractJsonArray(fullTextRef.current); if (fb && fb.length > 0) { setShots(fb); setSelectedShot(fb[0]) } }
    } catch (e) { console.error('Stream error:', e) } finally { setGenerating(false) }
  }, [theme, style, videoType, device, shotCount, generating])

  const handleExport = async () => {
    if (shots.length === 0 || exporting) return; setExporting(true)
    try {
      const res = await fetch('/api/excel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shots }) })
      if (res.ok) { const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `storyboard.xlsx`; a.click(); URL.revokeObjectURL(url) }
    } catch {} finally { setExporting(false) }
  }

  const totalDuration = shots.reduce((s, shot) => s + (shot.duration || 0), 0)

  return (
    <div className="flex flex-col h-full">
      {/* 顶部工具栏 */}
      <header className="flex-shrink-0 h-12 border-b border-zinc-800 bg-zinc-950/90 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500"/>
          <h1 className="text-sm font-bold">创作中心</h1>
        </div>
        <div className="flex items-center gap-3">
          {shots.length > 0 && <span className="text-xs text-zinc-500">{shots.length} 镜 · {totalDuration}s</span>}
          <button onClick={handleExport} disabled={shots.length === 0 || exporting}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs rounded-lg disabled:opacity-30">
            📥 导出 Excel
          </button>
        </div>
      </header>

      {/* 左右分栏 */}
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-950/50 overflow-y-auto p-4 space-y-4">
          <textarea value={theme} onChange={e => setTheme(e.target.value)} placeholder="描述你的拍摄创意..." rows={4}
            className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"/>

          <select value={videoType} onChange={e => setVideoType(e.target.value)}
            className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none">
            {VIDEO_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>

          {/* 三校上下文注入 */}
          <select value={schoolCtx} onChange={e => { setSchoolCtx(e.target.value); if (e.target.value && !theme) { const s = salesHubDatabase[e.target.value]; if (s) setTheme(`${s.name}校园宣传片`) } }}
            className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none">
            <option value="">🎓 关联学校（可选·注入场景关键词）</option>
            {Object.values(salesHubDatabase).map(s => <option key={s.key} value={s.key}>{s.short} — {s.targetAudience.slice(0, 15)}...</option>)}
          </select>

          <div className="relative">
            <button onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-left">
              <span>{device.icon}</span><span className="text-zinc-200 truncate">{device.title}</span>
            </button>
            {showDeviceDropdown && <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDeviceDropdown(false)}/>
              <div className="absolute z-50 top-full mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                {DEVICES.map((d, i) => (
                  <button key={d.value} onClick={() => { setDeviceIdx(i); setShowDeviceDropdown(false) }}
                    className={`w-full text-left px-3 py-2.5 text-sm hover:bg-zinc-800 ${i === deviceIdx ? 'border-l-2 border-l-amber-500' : ''}`}>
                    <div className="text-zinc-200">{d.icon} {d.title}</div><div className="text-[10px] text-zinc-500">{d.subtitle}</div>
                  </button>
                ))}
              </div>
            </>}
          </div>

          <input value={style} onChange={e => setStyle(e.target.value)} placeholder="风格：王家卫/诺兰..."
            className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"/>

          <select value={shotCount} onChange={e => setShotCount(Number(e.target.value))}
            className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none">
            {[4,6,8,10,12,16].map(n => <option key={n} value={n}>{n} 镜</option>)}
          </select>

          <button onClick={handleGenerate} disabled={!theme.trim() || generating}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-30">
            {generating ? '⏳ 生成中...' : '⚡ 生成分镜脚本'}
          </button>

          {shots.length > 0 && (
            <div className="pt-2 border-t border-zinc-800 space-y-1">
              <div className="text-[10px] text-zinc-600">镜头列表</div>
              {shots.map(s => (
                <button key={s.id} onClick={() => setSelectedShot(s)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between ${selectedShot?.id === s.id ? 'bg-indigo-500/15 text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  <span>镜 {s.id}</span><span>{s.duration}s</span><span className="text-zinc-600">{s.shot_size?.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="flex-1 overflow-y-auto" ref={streamRef}>
          {!generating && !shots.length && (
            <div className="h-full flex items-center justify-center text-zinc-600 text-sm">输入主题，AI 生成分镜</div>
          )}
          <div className="p-4 space-y-3">
            {shots.map((shot, i) => (
              <div key={shot.id} onClick={() => setSelectedShot(shot)}
                className={`rounded-xl border transition-all ${selectedShot?.id === shot.id ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'}`}>
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-amber-500">镜 {shot.id}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{shot.shot_size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600">{shot.transition}</span>
                    <span className="text-xs font-mono text-zinc-400">{shot.duration}s</span>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FIELD_LABELS.map(([key, label, color]) => {
                    const val = shot[key]; if (!val || val === '无' || key === 'duration') return null
                    return <div key={key} className={['visual_art','content_description','sound_effects','remarks'].includes(key) ? 'sm:col-span-2' : ''}>
                      <div className={`text-[10px] font-medium uppercase mb-0.5 ${color}`}>{label}</div>
                      <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{val}</div>
                    </div>
                  })}
                </div>
                <div className="px-4 pb-3 border-t border-zinc-800/30 pt-2">
                  {shotImages[shot.id]?.url ? (
                    <div>
                      <div className="text-[10px] text-zinc-500 mb-1.5">📷 画面参考 {shotImages[shot.id].keywords && <span className="text-zinc-600">· {shotImages[shot.id].keywords}</span>}</div>
                      <img src={shotImages[shot.id].url} alt="参考图" className="w-full rounded-lg cursor-zoom-in aspect-[16/9] object-cover border border-zinc-700" onClick={(e) => { e.stopPropagation(); setPreviewImage(shotImages[shot.id].url!) }}/>
                    </div>
                  ) : (
                    <button onClick={(e) => handleSearchImage(shot, e)} disabled={drawingShotId === shot.id}
                      className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg disabled:opacity-50">
                      {drawingShotId === shot.id ? '搜图中...' : '📷 查看参考图'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {previewImage && previewImage.startsWith('http') && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl">✕</button>
          <img src={previewImage} alt="全屏预览" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}/>
        </div>
      )}
    </div>
  )
}
