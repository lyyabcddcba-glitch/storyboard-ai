import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'materials.json')

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) {
    const initial = [
      { id: 'mat_1', school: '川北医', type: '实景照片', title: '高颜值现代化公寓新宿舍', url: '', desc: '上床下桌、独立卫浴，大一新生看到直接走不动路' },
      { id: 'mat_2', school: '西华师大', type: '实景照片', title: '行署校区历史感红砖老建筑', url: '', desc: '文艺范拉满，出片率极高，小红书引流绝佳素材' },
    ]
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8')
  }
}

export async function GET() {
  try {
    ensureDataFile()
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return NextResponse.json({ success: true, data: JSON.parse(raw) })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message })
  }
}

export async function POST(request: Request) {
  try {
    ensureDataFile()
    const { school, type, title, url, desc } = await request.json()
    if (!school || !title || !url) {
      return NextResponse.json({ success: false, error: '学校、素材名称和图片URL是必填项' }, { status: 400 })
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const materials = JSON.parse(raw)
    const item = { id: `mat_${Date.now()}`, school, type, title, url, desc: desc || '' }
    materials.unshift(item)
    fs.writeFileSync(DATA_FILE, JSON.stringify(materials, null, 2), 'utf-8')
    return NextResponse.json({ success: true, message: '入库成功', data: item })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
