import { NextRequest, NextResponse } from 'next/server'

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || ''

// 用 DeepSeek 将中文视觉描述翻译成英文 Stable Diffusion Prompt
async function translateToPrompt(visualArt: string, contentDesc: string, shotSize: string): Promise<string> {
  const chineseDesc = [contentDesc, visualArt].filter(Boolean).join('。')
  if (!chineseDesc) return 'cinematic film still, 8K, masterpiece'

  if (!DEEPSEEK_KEY) {
    // 无 API Key：提取英文关键词
    const english = chineseDesc
      .replace(/冷蓝灰/g, 'cold blue-gray')
      .replace(/暖橙金/g, 'warm orange-gold')
      .replace(/逆光/g, 'backlight')
      .replace(/侧光/g, 'side light')
      .replace(/顶光/g, 'top light')
      .replace(/霓虹/g, 'neon lights')
      .replace(/雨夜/g, 'rainy night')
      .replace(/剪影/g, 'silhouette')
      .replace(/三分法/g, 'rule of thirds')
      .replace(/浅景深/g, 'shallow depth of field')
      .replace(/[一-鿿]+/g, ' ')
      .replace(/\s+/g, ' ').trim()
    return `${english}, cinematic shot, 8K, film grain, masterpiece`.slice(0, 500)
  }

  // 有 Key：用 DeepSeek 翻译
  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_KEY}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{
          role: 'user',
          content: `Translate this Chinese film scene description into a single English Stable Diffusion prompt (max 400 chars). Include: shot type (${shotSize}), lighting, color, composition, atmosphere. Output ONLY the English prompt, nothing else:\n\n${chineseDesc}`,
        }],
        max_tokens: 200,
        temperature: 0.3,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      const prompt = data.choices?.[0]?.message?.content?.trim() || ''
      if (prompt) return (prompt + ', 8K, cinematic, masterpiece').slice(0, 500)
    }
  } catch (e) {
    console.error('[Draw] DeepSeek translate error:', e)
  }

  return 'cinematic film still, 8K, masterpiece'
}

function extractGradient(prompt: string): string {
  const lower = prompt.toLowerCase()
  if (lower.includes('blue') || lower.includes('cold') || lower.includes('night')) return 'from-slate-900 to-blue-900'
  if (lower.includes('orange') || lower.includes('gold') || lower.includes('warm')) return 'from-amber-950 to-orange-900'
  if (lower.includes('green') || lower.includes('forest') || lower.includes('nature')) return 'from-emerald-950 to-green-900'
  if (lower.includes('purple') || lower.includes('violet')) return 'from-purple-950 to-violet-900'
  if (lower.includes('red') || lower.includes('crimson')) return 'from-red-950 to-rose-900'
  if (lower.includes('neon') || lower.includes('cyberpunk')) return 'from-cyan-950 to-cyan-900'
  return 'from-zinc-900 to-indigo-900'
}

export async function POST(request: NextRequest) {
  try {
    const { visual_art, content_description, shot_size } = await request.json()

    if (!visual_art && !content_description) {
      return NextResponse.json({ error: '缺少画面描述' }, { status: 400 })
    }

    const prompt = await translateToPrompt(visual_art || '', content_description || '', shot_size || '')
    console.log('[Draw] Prompt:', prompt.slice(0, 120))

    // AI 生图 URL（后台异步加载）
    const encodedPrompt = encodeURIComponent(prompt.slice(0, 300))
    const aiImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=576&nologo=true&seed=${Date.now() % 100000}`

    // 返回 CSS gradient class + AI URL + prompt 文本，前端自行渲染
    return NextResponse.json({
      success: true,
      gradient: extractGradient(prompt),  // CSS gradient class
      prompt: prompt,                      // 英文描述文字
      aiUrl: aiImageUrl,                   // AI 生图 URL
    })

  } catch {
    return NextResponse.json({ error: '生成失败' }, { status: 500 })
  }
}
