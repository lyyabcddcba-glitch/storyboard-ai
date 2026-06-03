'use client'

import { useState, useRef, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const VIDEO_TYPES = ['商业广告', '剧情短片', '知识科普', '音乐MV', 'Vlog日常', '宣传片', '微电影', '纪录片']

interface DeviceOption {
  icon: string; title: string; subtitle: string; value: string; promptHint: string
}
const DEVICES: DeviceOption[] = [
  { icon: '🛸', title: '大疆 Pocket 3', subtitle: '一英寸 / 20mm 等效广角 · Vlog、街拍', value: 'DJI Pocket 3, 20mm等效广角, 一英寸传感器, 三轴防抖', promptHint: '运镜多用智能跟随、第一人称POV、三轴防抖推进、小空间穿梭。景别以中近景为主，强调手持呼吸感。' },
  { icon: '📱', title: '手机竖屏 (9:16)', subtitle: '主摄 24mm · 抖音、小红书短视频', value: '手机竖屏 9:16画幅, 主摄等效24mm', promptHint: '前3秒必须是黄金钩子。运镜快节奏：甩镜、遮罩转场、跳切。字幕要大，构图中心化。景别以特写和中近景为主。' },
  { icon: '📱', title: '手机横屏 (16:9)', subtitle: '电影模式 26mm · B站、微电影', value: '手机横屏 16:9画幅, 电影模式等效26mm', promptHint: '用手机电影模式的浅景深模拟大片感。运镜平稳：横移、推轨、摇镜。注意手机手持的微抖动感可转化为风格化手持摄影。' },
  { icon: '📷', title: '微单/单反 35mm', subtitle: 'Sony Alpha / Canon · 口播、剧情短片', value: '微单 Sony Alpha / Canon, 35mm人文焦段, APS-C/全画幅', promptHint: '35mm焦段适合叙事。运镜多用固定镜头和慢推，强调演员表演和构图。景深控制好主体与背景关系。' },
  { icon: '📷', title: '微单/单反 85mm', subtitle: '人像镜皇 · 高质感广告、采访', value: '微单 85mm f/1.4 人像镜头, 全画幅', promptHint: '85mm大光圈营造极致虚化。多用特写和大特写捕捉表情细节。运镜以固定和缓推为主，光影质感优先。' },
  { icon: '🚁', title: '航拍无人机', subtitle: 'DJI Mavic · 大远景、上帝视角', value: 'DJI Mavic 航拍无人机, 等效24mm广角, 4K/60fps', promptHint: '景别以大远景和全景为主。运镜必用：刷锅绕飞、俯冲拉升、上帝视角俯拍、水平横移、跟踪跟随。开头多用航拍建立空间感。' },
  { icon: '🎥', title: '电影机 (ARRI/RED)', subtitle: '变形宽银幕 · 商业大片、院线质感', value: 'ARRI Alexa / RED, 电影级变形宽银幕镜头, 全画幅', promptHint: '电影级质感。多用高格慢动作、浅景深大特写、变形宽银幕的拉丝光晕效果。光影以侧光和逆光为主，强调美术和色彩层次。' },
]

interface Shot { id: number; camera_setup: string; shot_size: string; camera_movement: string; visual_art: string; content_description: string; dialogue: string; voiceover: string; sound_effects: string; transition: string; duration: number; props_costumes: string; remarks: string }

const FIELD_LABELS: [keyof Shot, string, string][] = [
  ['camera_setup', '🎥 机位镜头', 'text-indigo-400'],
  ['shot_size', '📐 景别', 'text-sky-400'],
  ['camera_movement', '🎬 运镜', 'text-emerald-400'],
  ['visual_art', '🎨 美术视觉', 'text-amber-400'],
  ['content_description', '🎭 内容描述', 'text-rose-400'],
  ['dialogue', '💬 台词', 'text-yellow-400'],
  ['voiceover', '🎙️ 旁白/独白', 'text-violet-400'],
  ['sound_effects', '🔊 音效/音乐', 'text-cyan-400'],
  ['transition', '🎞️ 转场', 'text-orange-400'],
  ['props_costumes', '👔 道具/服装', 'text-pink-400'],
  ['remarks', '📝 备注', 'text-zinc-400'],
]

// 前端 JSON 容错解析 —— 与后端 parseShotsJSON 同逻辑
function extractJsonArray(text: string): any[] | null {
  const result = parseRobustJSON(text)
  return result.length > 0 ? result : null
}

function parseRobustJSON(rawText: string): any[] {
  let text = rawText.replace(/```json\s*/gi, '').replace(/```\w*\s*/g, '').replace(/```/g, '').trim()
  if (!text) return []

  let start = text.indexOf('['), end = text.lastIndexOf(']')
  if (start === -1 || start >= end) {
    start = text.indexOf('{'); end = text.lastIndexOf('}')
    if (start === -1 || start >= end) return []
    text = '[' + text.slice(start, end + 1) + ']'
    start = 0; end = text.length - 1
  }
  let candidate = text.slice(start, end + 1)
  candidate = candidate.replace(/,\s*\]/g, ']').replace(/,\s*\}/g, '}')
  candidate = candidate.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
  // 括号平衡
  let obs = (candidate.match(/\{/g)||[]).length, cbs = (candidate.match(/\}/g)||[]).length
  let obr = (candidate.match(/\[/g)||[]).length, cbr = (candidate.match(/\]/g)||[]).length
  for (let i = 0; i < obs - cbs; i++) candidate += '}'
  for (let i = 0; i < obr - cbr; i++) candidate += ']'

  try { const p = JSON.parse(candidate); if (Array.isArray(p)) return p } catch {}
  try { const p = JSON.parse(candidate.replace(/,\s*\]/g,']').replace(/,\s*\}/g,'}').replace(/"\s+"/g,'","')); if (Array.isArray(p)) return p } catch {}

  // 逐对象兜底
  try {
    const items: any[] = []
    const raw = rawText.replace(/```json|```/g, '').trim()
    const re = /\{((?:[^{}]|\{[^{}]*\})*)\}/g; let m
    while ((m = re.exec(raw)) !== null) { try { items.push(JSON.parse(m[0])) } catch {} }
    if (items.length > 0) return items
  } catch {}
  return []
}

export default function HomePage() {
  const [theme, setTheme] = useState('')
  const [style, setStyle] = useState('')
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

  // Unsplash 搜图
  const handleSearchImage = async (shot: Shot, e: React.MouseEvent) => {
    e.stopPropagation()
    if (drawingShotId) return
    setDrawingShotId(shot.id)
    setShotImages(prev => ({ ...prev, [shot.id]: { loading: true } }))
    try {
      const res = await fetch('/api/search-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visual_art: shot.visual_art,
          content_description: shot.content_description,
        }),
      })
      const data = await res.json()
      if (data.success && data.images?.length > 0) {
        const img = data.images[0]
        setShotImages(prev => ({
          ...prev,
          [shot.id]: { url: img.url, author: img.author, keywords: data.keywords, loading: false }
        }))
      } else {
        setShotImages(prev => ({ ...prev, [shot.id]: { loading: false } }))
      }
    } catch {
      setShotImages(prev => ({ ...prev, [shot.id]: { loading: false } }))
    } finally {
      setDrawingShotId(null)
    }
  }

  const selectedShotRef = useRef<Shot | null>(null)
  const fullTextRef = useRef('')
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const userStatus = (session?.user as any)?.status as string | undefined
  const isApproved = userStatus === 'APPROVED' || userStatus === 'ADMIN'

  const handleGenerate = useCallback(async () => {
    if (!theme.trim() || generating) return
    setGenerating(true)
    setStreamingText('')
    setShots([])
    setSelectedShot(null)
    selectedShotRef.current = null
    fullTextRef.current = ''

    let finalShots: Shot[] = []

    try {
      console.log('[生成] 发起请求...', { theme: theme.trim(), videoType, device, shotCount })
      const res = await fetch('/api/storyboard/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: theme.trim(), style: style.trim(), videoType, equipment: device.value, promptHint: device.promptHint, shotCount }),
      })
      console.log('[生成] 响应状态:', res.status, res.ok)

      const reader = res.body?.getReader()
      if (!reader) { console.error('[生成] 无法获取 Reader'); throw new Error('No reader') }
      const decoder = new TextDecoder()
      let partial = ''
      let eventCount = 0
      let tokenCount = 0

      while (true) {
        const { done, value } = await reader.read()
        // 关键修复：即使流关闭，value 可能还有最后一包数据
        if (value) {
          partial += decoder.decode(value, { stream: true })
        }
        if (done) {
          console.log('[生成] 流读取完毕，共处理', eventCount, '个事件，', tokenCount, '个token',
            '| partial残留:', partial.length, '字符')
          // 处理 partial 中所有残留的 SSE 事件
          const allLines = partial.split('\n').filter(l => l.startsWith('data: '))
          for (const line of allLines) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.done) {
                console.log('[生成] 残留done事件，shots:', data.shots?.length || 0)
                if (Array.isArray(data.shots) && data.shots.length > 0) {
                  finalShots = data.shots
                } else if (data.buffer) {
                  const parsed = extractJsonArray(data.buffer)
                  if (parsed && parsed.length > 0) finalShots = parsed
                }
              }
            } catch {}
          }
          break
        }

        // 处理完整的 SSE 事件
        const events = partial.split('\n\n')
        partial = events.pop() || ''
        eventCount += events.length

        for (const event of events) {
          const lines = event.split('\n').filter(l => l.startsWith('data: '))
          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.token) {
                tokenCount++
                fullTextRef.current += data.token
                setStreamingText(prev => prev + data.token)
              }

              if (data.buffer) {
                const match = extractJsonArray(data.buffer)
                if (match && match.length > 0 && match[0].id) {
                  console.log('[生成] 流中解析到', match.length, '个镜头')
                  setShots(match)
                  if (!selectedShotRef.current) {
                    setSelectedShot(match[0])
                    selectedShotRef.current = match[0]
                  }
                }
              }

              if (data.done) {
                console.log('[生成] 收到 done 事件，shots:', data.shots?.length || 0,
                  '| buffer长度:', data.buffer?.length || 0)
                if (Array.isArray(data.shots) && data.shots.length > 0) {
                  finalShots = data.shots
                }
                // 如果 done 带了 buffer 但没 shots，尝试自己解析
                if ((!data.shots || data.shots.length === 0) && data.buffer) {
                  console.log('[生成] done.shots 为空，尝试从 buffer 解析...')
                  const parsed = extractJsonArray(data.buffer)
                  if (parsed && parsed.length > 0) {
                    console.log('[生成] 手动解析成功，', parsed.length, '个镜头')
                    finalShots = parsed
                  } else {
                    console.error('[生成] 手动解析失败！buffer 前200字:', data.buffer?.slice(0, 200))
                  }
                }
              }
            } catch (e) {
              console.error('[生成] SSE行解析异常:', e, '| 原始行:', line?.slice(0, 100))
            }
          }
        }

        if (streamRef.current) {
          streamRef.current.scrollTop = streamRef.current.scrollHeight
        }
      }

      // 获取 streamingText 的最新值（从 ref 读，避免闭包问题）
      const fullText = fullTextRef.current
      console.log('[生成] 流结束，finalShots:', finalShots.length,
        '| fullText:', fullText.length, '字符')
      if (finalShots.length > 0) {
        console.log('[生成] 写入 state: setShots(', finalShots.length, ')')
        setShots(finalShots)
        setSelectedShot(finalShots[0])
        selectedShotRef.current = finalShots[0]
      } else if (fullText.length > 0) {
        // 终极兜底：从累积的原始文本中提取 JSON
        console.log('[生成] done.shots为空，用 extractJsonArray 兜底...')
        const fallback = extractJsonArray(fullText)
        if (fallback && fallback.length > 0) {
          console.log('[生成] ✅ 兜底成功，', fallback.length, '个镜头')
          setShots(fallback)
          setSelectedShot(fallback[0])
          selectedShotRef.current = fallback[0]
        } else {
          console.error('[生成] ❌ 兜底失败，fullText前200:', fullText.slice(0, 200))
        }
      } else {
        console.error('[生成] ⚠️ finalShots为空且fullText也为空')
      }
    } catch (e) {
      console.error('[生成] 流异常:', e)
    } finally {
      console.log('[生成] 结束，generating=false')
      setGenerating(false)
    }
  }, [theme, style, videoType, device, shotCount, generating])

  const handleExport = async () => {
    if (shots.length === 0 || exporting) return
    setExporting(true)
    try {
      const res = await fetch('/api/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shots }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `storyboard_${new Date().toISOString().slice(0, 10)}.xlsx`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {} finally { setExporting(false) }
  }

  const totalDuration = shots.reduce((s, shot) => s + (shot.duration || 0), 0)

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* ── 顶部工具栏 ── */}
      <header className="flex-shrink-0 h-14 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-white text-sm">🎬</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">
              Storyboard<span className="text-amber-500">AI</span>
            </h1>
          </div>
          <span className="hidden sm:block text-[10px] text-zinc-600 font-mono uppercase tracking-widest ml-2">Director&apos;s Workstation</span>
        </div>

        <div className="flex items-center gap-3">
          {authStatus === 'loading' ? (
            <span className="text-xs text-zinc-600">加载中...</span>
          ) : session ? (
            <div className="flex items-center gap-2">
              <button onClick={() => router.push('/admin')} className="text-xs px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/20">
                👑 管理
              </button>
              <span className="text-xs text-zinc-500 hidden sm:block">{session.user?.email}</span>
              <button onClick={() => signOut()} className="text-xs text-zinc-500 hover:text-zinc-300">退出</button>
            </div>
          ) : (
            <button onClick={() => router.push('/login')} className="text-xs px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20">
              登录
            </button>
          )}
          {shots.length > 0 && (
            <span className="text-xs text-zinc-500 hidden sm:block">
              {shots.length} 镜 · {totalDuration}s
            </span>
          )}
          <button
            onClick={handleExport}
            disabled={shots.length === 0 || exporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-sm rounded-lg transition-all duration-200 active:scale-[0.97] shadow-lg shadow-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            {exporting ? '导出中...' : '导出 Excel'}
          </button>
        </div>
      </header>

      {/* PENDING 审核中提示 */}
      {authStatus === 'authenticated' && !isApproved && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 text-center">
          <p className="text-sm text-amber-400">
            {userStatus === 'PENDING' ? '⏳ 账号审核中，请等待管理员审批后使用' : '🚫 账号已被禁用'}
          </p>
          <p className="text-xs text-amber-500/60 mt-1">
            审核通过后将自动开放 AI 生成功能
          </p>
        </div>
      )}

      {/* ── 主体：左右分栏 ── */}
      <div className={`flex-1 flex overflow-hidden ${!isApproved && authStatus === 'authenticated' ? 'opacity-30 pointer-events-none' : ''}`}>
        {/* ── 左侧控制面板 ── */}
        <aside className="w-72 lg:w-80 flex-shrink-0 border-r border-zinc-800 bg-zinc-950/50 flex flex-col overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">控制面板</h2>
            </div>

            {/* 主题输入 */}
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">拍摄主题 *</label>
              <textarea
                value={theme}
                onChange={e => setTheme(e.target.value)}
                placeholder="描述你的拍摄创意...&#10;&#10;例如：一个女孩在雨夜的老上海街头追忆逝去的爱情，霓虹灯倒映在湿漉漉的街道上，王家卫风格"
                rows={4}
                className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 resize-none transition-all"
              />
            </div>

            {/* 视频类型 */}
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">视频类型</label>
              <select value={videoType} onChange={e => setVideoType(e.target.value)} className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all appearance-none cursor-pointer">
                {VIDEO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* 目标设备 — 自定义下拉 */}
            <div className="relative">
              <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">目标设备 / 焦段</label>
              <button
                onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all text-left cursor-pointer"
              >
                <span className="text-base">{device.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-200 truncate">{device.title}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{device.subtitle}</div>
                </div>
                <svg className={`w-4 h-4 text-zinc-500 transition-transform ${showDeviceDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
              </button>
              {showDeviceDropdown && (
                <div className="absolute z-50 top-full mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl shadow-black/50 overflow-hidden max-h-64 overflow-y-auto">
                  {DEVICES.map((d, i) => (
                    <button
                      key={d.value}
                      onClick={() => { setDeviceIdx(i); setShowDeviceDropdown(false) }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-left transition-colors ${
                        i === deviceIdx ? 'bg-amber-500/10 border-l-2 border-l-amber-500' : 'hover:bg-zinc-800 border-l-2 border-l-transparent'
                      }`}
                    >
                      <span className="text-base flex-shrink-0">{d.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-zinc-200">{d.title}</div>
                        <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">{d.subtitle}</div>
                      </div>
                      {i === deviceIdx && <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>}
                    </button>
                  ))}
                </div>
              )}
              {showDeviceDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDeviceDropdown(false)} />}
            </div>

            {/* 风格 + 镜头数 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">风格参考</label>
                <input value={style} onChange={e => setStyle(e.target.value)} placeholder="王家卫/诺兰..." className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">镜头数量</label>
                <select value={shotCount} onChange={e => setShotCount(Number(e.target.value))} className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all appearance-none cursor-pointer">
                  {[4, 6, 8, 10, 12, 16].map(n => <option key={n} value={n}>{n} 镜</option>)}
                </select>
              </div>
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={!theme.trim() || generating}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-indigo-500/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />AI 推演中...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>生成分镜脚本</>
              )}
            </button>

            {/* 镜头列表（生成后） */}
            {shots.length > 0 && (
              <div className="pt-2 border-t border-zinc-800">
                <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  镜头列表 · {shots.length} 镜 · {totalDuration}s
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {shots.map(shot => (
                    <button
                      key={shot.id}
                      onClick={() => setSelectedShot(shot)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150 flex items-center justify-between ${
                        selectedShot?.id === shot.id
                          ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300'
                          : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="font-mono font-bold">镜{shot.id}</span>
                      <span className="text-zinc-600">{shot.duration}s</span>
                      <span className="text-zinc-600 truncate ml-2 flex-1 text-right">{shot.shot_size?.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── 右侧实时预览 ── */}
        <main className="flex-1 overflow-y-auto bg-zinc-950" ref={streamRef}>
          {!generating && !shots.length && !streamingText && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-700">
              <div className="text-6xl mb-4 opacity-30">🎬</div>
              <p className="text-sm">在左侧输入拍摄主题，AI 将实时生成分镜脚本</p>
              <p className="text-xs text-zinc-800 mt-1">支持流式输出 · 13维度 · 导出Excel</p>
            </div>
          )}
          {!generating && !shots.length && streamingText && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 px-4">
              <div className="text-4xl mb-3 opacity-40">⚠️</div>
              <p className="text-sm font-medium">AI 已返回内容，但自动解析失败</p>
              <p className="text-xs text-zinc-600 mt-1 max-w-md text-center">
                请查看下方原始返回。如果是格式问题（如 ```json 包裹），系统已自动尝试修复。
              </p>
              <button
                onClick={() => {
                  const fallback = extractJsonArray(fullTextRef.current)
                  if (fallback && fallback.length > 0) {
                    setShots(fallback)
                    setSelectedShot(fallback[0])
                    selectedShotRef.current = fallback[0]
                  } else {
                    alert('手动解析仍失败，请检查下方原始返回内容格式')
                  }
                }}
                className="mt-3 px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium hover:bg-amber-500/30 transition-colors"
              >
                🔄 手动重试解析
              </button>
              <details className="mt-4 glass-panel p-3 w-full max-w-2xl max-h-64 overflow-auto">
                <summary className="text-xs text-zinc-500 cursor-pointer">
                  查看原始返回内容（{streamingText.length} 字符）
                </summary>
                <pre className="text-xs text-zinc-400 mt-2 whitespace-pre-wrap break-all">{streamingText.slice(0, 3000)}</pre>
              </details>
            </div>
          )}

          {/* 流式文本预览 + 卡片 */}
          <div className="p-6 space-y-4">
            {streamingText && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">
                    {generating ? 'AI 实时推演中...' : '生成完成'}
                  </span>
                </div>
              </div>
            )}

            {/* 结构化镜头卡片 */}
            {shots.map((shot, i) => (
              <div
                key={shot.id}
                className={`rounded-xl border transition-all duration-300 ${
                  selectedShot?.id === shot.id
                    ? 'border-indigo-500/40 bg-indigo-500/5 shadow-lg shadow-indigo-500/5'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                } ${i === shots.length - 1 && generating ? 'animate-shimmer' : ''}`}
                onClick={() => setSelectedShot(shot)}
              >
                {/* 镜号标题栏 */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-amber-500">镜 {shot.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{shot.shot_size}</span>
                    <span className="text-xs text-zinc-600">{shot.camera_movement}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600">{shot.transition}</span>
                    <span className="text-xs font-mono text-zinc-400">{shot.duration}s</span>
                  </div>
                </div>

                {/* 字段内容 */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FIELD_LABELS.map(([key, label, colorClass]) => {
                    const val = shot[key]
                    if (!val || val === '无' || val === '') return null
                    if (key === 'duration') return null
                    return (
                      <div key={key} className={key === 'visual_art' || key === 'content_description' || key === 'sound_effects' ? 'sm:col-span-2' : ''}>
                        <div className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${colorClass}`}>{label}</div>
                        <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{val}</div>
                      </div>
                    )
                  })}
                </div>

                {/* 📷 画面参考区 — Unsplash 真实照片 */}
                <div className="px-4 pb-4 border-t border-zinc-800/30 pt-3">
                  {shotImages[shot.id]?.url ? (
                    <div>
                      <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
                        📷 画面参考
                        {shotImages[shot.id].keywords && <span className="text-zinc-600 ml-1">· {shotImages[shot.id].keywords}</span>}
                      </div>
                      <img src={shotImages[shot.id].url} alt={`镜 ${shot.id} 参考图`}
                        className="w-full rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity border border-zinc-700 aspect-[16/9] object-cover"
                        onClick={(e) => { e.stopPropagation(); setPreviewImage(shotImages[shot.id].url!) }} loading="lazy"/>
                      {shotImages[shot.id].author && (
                        <p className="text-[10px] text-zinc-600 mt-1">Photo by {shotImages[shot.id].author} / Unsplash</p>
                      )}
                    </div>
                  ) : shotImages[shot.id]?.loading ? (
                    <div className="w-full aspect-video rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-3">
                      <span className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin"/>
                      <span className="text-xs text-zinc-500">Unsplash 搜图中...</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleSearchImage(shot, e)}
                      disabled={drawingShotId === shot.id}
                      className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {drawingShotId === shot.id ? (
                        <><span className="w-3 h-3 border-2 border-zinc-500 border-t-zinc-300 rounded-full animate-spin" /> 搜图中...</>
                      ) : (
                        <>📷 查看参考图</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* 底部占位 */}
            <div className="h-20" />
          </div>
        </main>
      </div>

      {/* 图片全屏预览 Modal */}
      {previewImage && previewImage.startsWith('http') && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl transition-colors">✕</button>
          <img src={previewImage} alt="视觉参考全屏" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
