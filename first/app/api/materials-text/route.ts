import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'text_materials.json')

function ensureFile() {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([{
      id: 'txt_1', school: '西南石油大学', academy: '机电工程学院', major: '机械电子工程',
      tag: '专业解密',
      content: '学弟学妹，咱们西油的机电可不是单纯的修机器！它背靠四川省重点学科和教育部重点实验室，有博士点的。毕业去向很广，机械、电子、自动化通吃。考研可以冲微机电或智能制造，大一进来基础课要稳住！',
    }], null, 2), 'utf-8')
  }
}

export async function GET() {
  try {
    ensureFile()
    return NextResponse.json({ success: true, data: JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) })
  } catch (e: any) { return NextResponse.json({ success: false, error: e.message }) }
}

export async function POST(request: Request) {
  try {
    ensureFile()
    const { school, academy, major, tag, content } = await request.json()
    if (!major || !content) return NextResponse.json({ success: false, error: '专业名称和话术内容不能为空' }, { status: 400 })
    const texts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    texts.unshift({ id: `txt_${Date.now()}`, school: school || '西南石油大学', academy: academy || '通用', major, tag: tag || '专业解读', content })
    fs.writeFileSync(DATA_FILE, JSON.stringify(texts, null, 2), 'utf-8')
    return NextResponse.json({ success: true, message: '入库成功' })
  } catch (e: any) { return NextResponse.json({ success: false, error: e.message }, { status: 500 }) }
}
