import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const TEXT_FILE = path.join(process.cwd(), 'data', 'text_materials.json')

export async function POST(request: Request) {
  try {
    const { query } = await request.json()
    console.log('[search] query:', query, '| file exists:', fs.existsSync(TEXT_FILE), '| cwd:', process.cwd())
    if (!query?.trim()) return NextResponse.json({ success: true, results: [] })

    if (!fs.existsSync(TEXT_FILE)) return NextResponse.json({ success: true, results: [], debug: { file: TEXT_FILE, cwd: process.cwd() } })

    const texts = JSON.parse(fs.readFileSync(TEXT_FILE, 'utf-8'))
    const q = query.toLowerCase()

    // 关键词匹配 + 相关度打分
    const scored = texts.map((t: any) => {
      let score = 0
      const fields = [t.major, t.content, t.academy, t.school, t.tag].filter(Boolean).map((f: string) => f.toLowerCase())
      for (const f of fields) {
        // 精确匹配加分
        if (f.includes(q)) score += 10
        // 分词匹配
        const words = q.split(/[\s,，。！？、]/).filter((w: string) => w.length > 1)
        for (const w of words) {
          if (f.includes(w)) score += 3
        }
      }
      return { ...t, score }
    }).filter((t: any) => t.score > 0)

    scored.sort((a: any, b: any) => b.score - a.score)
    const results = scored.slice(0, 5)

    return NextResponse.json({ success: true, results })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
