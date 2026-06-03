// ==========================================
// 终极 JSON 容错解析器 — 五层防御
// 处理：```json 包裹、截断、非法字符、括号不平衡
// ==========================================

interface RawShot {
  id?: number
  camera_setup?: string
  shot_size?: string
  camera_movement?: string
  visual_art?: string
  content_description?: string
  dialogue?: string
  voiceover?: string
  sound_effects?: string
  transition?: string
  duration?: number
  props_costumes?: string
  remarks?: string
  [key: string]: any
}

interface CleanShot {
  id: number
  camera_setup: string
  shot_size: string
  camera_movement: string
  visual_art: string
  content_description: string
  dialogue: string
  voiceover: string
  sound_effects: string
  transition: string
  duration: number
  props_costumes: string
  remarks: string
}

function mapFields(s: RawShot, i: number): CleanShot {
  return {
    id: s.id || i + 1,
    camera_setup: s.camera_setup || '',
    shot_size: s.shot_size || '',
    camera_movement: s.camera_movement || '',
    visual_art: s.visual_art || '',
    content_description: s.content_description || '',
    dialogue: s.dialogue || '无',
    voiceover: s.voiceover || '无',
    sound_effects: s.sound_effects || '',
    transition: s.transition || '切',
    duration: Number(s.duration) || 5,
    props_costumes: s.props_costumes || '',
    remarks: s.remarks || '',
  }
}

export function parseShotsJSON(rawText: string): CleanShot[] {
  const originalLen = rawText.length

  // ── 第1层：暴力剥离 Markdown 标记 ──
  let text = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\w*\s*/g, '')
    .replace(/```/g, '')
    .trim()
  if (!text) return []

  // ── 第2层：精准定位 JSON 边界 ──
  let start = text.indexOf('[')
  let end = text.lastIndexOf(']')
  if (start === -1 || start >= end) {
    start = text.indexOf('{')
    end = text.lastIndexOf('}')
    if (start === -1 || start >= end) return []
    text = '[' + text.slice(start, end + 1) + ']'
    start = 0; end = text.length - 1
  }
  let candidate = text.slice(start, end + 1)

  // ── 第3层：修复结构缺陷 ──
  candidate = candidate.replace(/,\s*\]/g, ']').replace(/,\s*\}/g, '}')
  candidate = candidate.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // 非法控制字符
  // 括号平衡：自动补全
  const openBraces = (candidate.match(/\{/g) || []).length
  const closeBraces = (candidate.match(/\}/g) || []).length
  const openBrackets = (candidate.match(/\[/g) || []).length
  const closeBrackets = (candidate.match(/\]/g) || []).length
  for (let i = 0; i < openBraces - closeBraces; i++) candidate += '}'
  for (let i = 0; i < openBrackets - closeBrackets; i++) candidate += ']'

  // ── 第4层：标准解析 + 修复重试 ──
  try { const shots = JSON.parse(candidate); if (Array.isArray(shots)) return shots.map(mapFields) } catch {}
  try {
    const fixed = candidate.replace(/,\s*\]/g, ']').replace(/,\s*\}/g, '}').replace(/"\s+"/g, '","')
    const shots = JSON.parse(fixed); if (Array.isArray(shots)) return shots.map(mapFields)
  } catch {}

  // ── 第5层：逐对象正则切出（终极兜底）──
  try {
    const raw = rawText.replace(/```json|```/g, '').trim()
    const objPattern = /\{((?:[^{}]|\{[^{}]*\})*)\}/g
    const items: CleanShot[] = []
    let m
    while ((m = objPattern.exec(raw)) !== null) {
      try { const obj = JSON.parse(m[0]); items.push(mapFields(obj, items.length)) } catch {}
    }
    if (items.length > 0) {
      console.log('[parseJSON] ✅ L5兜底:', items.length, '镜 (原始', originalLen, '字节)')
      return items
    }
  } catch {}

  console.log('[parseJSON] ❌ 五层均失败，原始长度:', originalLen)
  return []
}
