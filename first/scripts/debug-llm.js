// 诊断脚本：直接调用 DeepSeek，打印原始返回内容
// 用法：node scripts/debug-llm.js

// 从环境变量读取，或从 .env.local 读取
const API_KEY = process.env.DEEPSEEK_API_KEY || ''
if (!API_KEY) {
  console.error('请设置 DEEPSEEK_API_KEY 环境变量')
  process.exit(1)
}
const API_URL = 'https://api.deepseek.com/v1/chat/completions'

const SYSTEM_PROMPT = `你是一位拥有20年从业经验的顶级电影导演与分镜师。请根据用户给出的主题，生成一套多维度的极细致脚本。

必须严格输出 JSON 数组，数组中的每一项必须包含以下 13 个字段：
1. id, 2. camera_setup, 3. shot_size, 4. camera_movement, 5. visual_art,
6. content_description, 7. dialogue, 8. voiceover, 9. sound_effects,
10. transition, 11. duration, 12. props_costumes, 13. remarks

返回格式必须是纯净的 JSON 数组，不要有任何额外的说明文字，不要用 \`\`\`json 包裹。`

const USER_MESSAGE = '拍摄主题：雨夜老上海街头追忆爱情\n视频类型：剧情短片\n风格参考：王家卫\n目标设备：ARRI Alexa LF 35mm\n需要约3个镜头'

async function main() {
  console.log('=== 发送请求到 DeepSeek ===\n')
  console.log('System Prompt 长度:', SYSTEM_PROMPT.length)
  console.log('User Message:', USER_MESSAGE)
  console.log('\n--- 原始返回 ---\n')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_MESSAGE },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  })

  const data = await res.json()
  const rawText = data.choices?.[0]?.message?.content || ''

  console.log(rawText)
  console.log('\n--- 诊断信息 ---')
  console.log('状态码:', res.status)
  console.log('返回长度:', rawText.length, '字符')
  console.log('以 [ 开头:', rawText.trim().startsWith('['))
  console.log('以 ] 结尾:', rawText.trim().endsWith(']'))
  console.log('包含 ```json:', rawText.includes('```json'))
  console.log('包含 ```:', rawText.includes('```'))

  // 尝试解析
  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '')
  const start = cleaned.indexOf('[')
  const end = cleaned.lastIndexOf(']')
  console.log('\nJSON 提取: start=', start, 'end=', end)

  if (start >= 0 && end > start) {
    const candidate = cleaned.slice(start, end + 1)
    try {
      const parsed = JSON.parse(candidate)
      console.log('✅ JSON 解析成功！', parsed.length, '个镜头')
      parsed.forEach((s, i) => {
        const keys = Object.keys(s).length
        console.log(`  镜${i + 1}: ${keys}/13 字段 | 首字段:`, s.id || s[Object.keys(s)[0]])
      })
    } catch (e) {
      console.log('❌ JSON 解析失败:', e.message)
      console.log('候选文本前200字:', candidate.slice(0, 200))
    }
  } else {
    console.log('❌ 未找到 JSON 数组标记 [...]')
  }
}

main().catch(e => console.error('Fatal:', e))
