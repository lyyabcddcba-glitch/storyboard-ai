import { NextRequest, NextResponse } from 'next/server'

const SILICONFLOW_KEY = process.env.SILICONFLOW_API_KEY || ''
const API_URL = 'https://api.siliconflow.cn/v1/images/generations'

// Kolors 原生支持中文，无需翻译，直接拼装专业电影工业 Prompt
function buildKolorsPrompt(
  visualArt: string,
  contentDesc: string,
  shotSize: string,
  cameraSetup: string,
  cameraMovement: string,
  propsCostumes: string,
): string {
  // 景别强化词
  const isCloseUp = shotSize.includes('特写') || shotSize.includes('ECU') || shotSize.includes('CU')
  const isWide = shotSize.includes('全景') || shotSize.includes('远景') || shotSize.includes('LS') || shotSize.includes('ELS')

  const parts: string[] = ['高精度电影分镜']

  // 景别前置强化
  if (isCloseUp) {
    parts.push('正面大特写，面部细节清晰，眼神光')
  } else if (isWide) {
    parts.push('大场景广角，环境氛围')
  }

  parts.push('故事板参考图')

  if (cameraSetup) parts.push(cameraSetup)
  if (shotSize) parts.push(`景别：${shotSize}`)
  if (cameraMovement) parts.push(`运镜：${cameraMovement}`)
  if (contentDesc) parts.push(contentDesc)
  if (visualArt) parts.push(visualArt)
  if (propsCostumes) parts.push(`道具服装：${propsCostumes}`)

  parts.push(
    isCloseUp
      ? '影视级细腻布光，大师构图参考，虚化背景，浅景深'
      : '影视级灯光，画面干净，细节清晰，电影色调',
  )
  return parts.join('，')
}

export async function POST(request: NextRequest) {
  try {
    const { visual_art, content_description, shot_size, camera_setup, camera_movement, props_costumes } = await request.json()

    if (!visual_art && !content_description) {
      return NextResponse.json({ error: '缺少画面描述' }, { status: 400 })
    }

    if (!SILICONFLOW_KEY) {
      return NextResponse.json({ error: '未配置 SILICONFLOW_API_KEY' }, { status: 400 })
    }

    // 1. 拼装纯中文 Prompt
    const prompt = buildKolorsPrompt(
      visual_art || '', content_description || '',
      shot_size || '', camera_setup || '', camera_movement || '',
      props_costumes || '',
    )
    console.log('[Kolors] Prompt:', prompt.slice(0, 120))

    // 2. 调用 Kolors API
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SILICONFLOW_KEY}`,
      },
      body: JSON.stringify({
        model: 'Kwai-Kolors/Kolors',
        prompt,
        size: '1024x1024',
        n: 1,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[Kolors] Error:', res.status, errText)
      return NextResponse.json({ error: `生图失败 (${res.status})`, detail: errText.slice(0, 200) }, { status: 500 })
    }

    const data = await res.json()
    console.log('[Kolors] Response keys:', Object.keys(data))

    // SiliconFlow 返回格式：data.images[0].url 或 data.data[0].url
    const imageUrl = data.images?.[0]?.url || data.data?.[0]?.url || data.results?.[0]?.url || ''

    if (!imageUrl) {
      console.error('[Kolors] Unexpected response:', JSON.stringify(data).slice(0, 500))
      return NextResponse.json({ error: '未获取到图片URL', raw: JSON.stringify(data).slice(0, 300) }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      url: imageUrl,
      images: [{ url: imageUrl, author: 'Kolors via SiliconFlow', keywords: prompt.slice(0, 80) }],
      prompt,
    })

  } catch (e) {
    console.error('[Kolors] Exception:', e)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
