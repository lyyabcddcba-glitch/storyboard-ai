import { NextRequest } from 'next/server'
import { parseShotsJSON } from '@/app/lib/json-parser'

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || ''
const API_URL = 'https://api.deepseek.com/v1/chat/completions'

const SYSTEM_PROMPT = `你是一位拥有20年从业经验的顶级电影导演与分镜师。请根据用户给出的主题，生成一套多维度的极细致分镜脚本。

必须严格输出 JSON 数组。每一项（每一镜）必须包含以下 13 个字段，严禁任何字段为空字符串或null：

1. id (int): 镜号，从1递增。
2. camera_setup (string): 机位镜头。写明几号机、焦段（35mm广角/50mm标准/85mm人像）、机身高度（低机位/平视/高机位俯拍）、角度。必须写全，不可只写"1号机"。
3. shot_size (string): 景别，附带英文（如"大特写 ECU""中景 MS""大远景 ELS"）。
4. camera_movement (string): 运镜（固定/推/拉/摇/移/升降/跟/手持呼吸感），若为固定写"固定"不可留空。
5. visual_art (string): 美术视觉。必须包含：①画面主色调（冷暖/具体色系）②光影方向与质感（侧光/逆光/顶光/柔光/硬光）③构图法则（三分法/中心对称/引导线/框架构图）④环境氛围（压抑/温暖/空旷/拥挤等）。前后镜次的光影方向和色调必须保持连贯，不可跳变。
6. content_description (string): 内容描述/动作。必须写明演员的具体肢体动作、面部微表情变化、视线方向、走位路径。不可只写"演员在思考"这类空泛描述。
7. dialogue (string): 台词。若此镜无台词必须写"无"，不可留空。全片台词需首尾呼应——第一镜的台词/旁白中抛出的意象或问题，必须在最后一镜的台词/旁白中得到回收或回答。
8. voiceover (string): 旁白/内心独白。必须注明音频处理方式（如：带大空间混响/电话滤波效果/低声耳语/加轻微延迟）。若无必须写"无"。
9. sound_effects (string): 音效/音乐。必须包含三要素：①【环境音】背景氛围声 ②【Foley】拟音特效 ③【音乐】情绪方向与参考风格。音效设计必须在拍摄前就规划好，不可事后补录。
10. transition (string): 转场方式（切/淡入淡出/叠化/划像/匹配剪辑/闪白/模糊过渡），写明具体方式不可只写"切"。
11. duration (int): 参考时长(秒)，2-12之间。
12. props_costumes (string): 道具/服装。写明此镜必须出现的具体道具和服装材质/颜色，不可笼统。
13. remarks (string): 多工种联合备注。必须包含：①【摄影】焦点/景深/防抖/滤镜等指令 ②【灯光】灯位/色温/亮度/柔光箱等指令 ③【剪辑】此镜与前后镜的衔接注意事项。三者缺一不可，用换行分隔。

【输出铁律】你必须且只能输出一个纯净的 JSON 数组。严禁使用 \`\`\`json 或任何 Markdown 标记。严禁在 JSON 前后添加任何解释文字。JSON 内部所有字符串必须正确转义双引号（使用 \\\"）。数组必须以 [ 开头、以 ] 结尾。每个对象必须包含全部 13 个字段，字段值不可为空字符串。如果某个字段确实无内容，写"无"或0。`

export async function POST(request: NextRequest) {
  const { theme, style, equipment, videoType, shotCount } = await request.json()

  if (!theme?.trim()) {
    return new Response(JSON.stringify({ error: '请输入拍摄主题' }), { status: 400 })
  }

  const userMessage = [
    `拍摄主题：${theme}`,
    videoType && `视频类型：${videoType}`,
    style && `风格参考：${style}`,
    equipment && `目标设备/焦段：${equipment}`,
    shotCount && `需要约${shotCount}个镜头`,
  ].filter(Boolean).join('\n')

  const encoder = new TextEncoder()
  let buffer = ''

  const stream = new ReadableStream({
    async start(controller) {
      // ── 有 API Key → 真 AI 流式 ──
      if (DEEPSEEK_KEY) {
        try {
          const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${DEEPSEEK_KEY}`,
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userMessage },
              ],
              temperature: 0.7,
              max_tokens: 4000,
              stream: true,
            }),
          })

          const reader = res.body?.getReader()
          if (!reader) throw new Error('No reader')

          const decoder = new TextDecoder()
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

            for (const line of lines) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content || ''
                if (content) {
                  buffer += content
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: content, buffer })}\n\n`))
                }
              } catch {}
            }
          }

          // 流结束，发送完成信号
          console.log('[后端] DeepSeek流结束，buffer长度:', buffer.length)
          console.log('[后端] buffer前100字:', buffer.slice(0, 100))
          console.log('[后端] buffer后100字:', buffer.slice(-100))
          console.log('[后端] 包含```:', buffer.includes('```'))
          const shots = parseShotsJSON(buffer)
          console.log('[后端] parseShotsJSON 结果:', shots.length, '镜')
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, shots })}\n\n`))
          controller.close()
          return
        } catch (e) {
          console.error('DeepSeek stream error:', e)
        }
      }

      // ── 降级：模拟流式输出示例数据 ──
      const demoShots = generateDemoShots(theme, shotCount || 6)
      const demoJson = JSON.stringify(demoShots)
      const chars = demoJson.split('')

      for (let i = 0; i < chars.length; i += 3) {
        const chunk = chars.slice(i, i + 3).join('')
        buffer += chunk
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: chunk, buffer })}\n\n`))
        await new Promise(r => setTimeout(r, 15))
      }

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, shots: demoShots })}\n\n`))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// parseShotsFromBuffer 已迁移到 @/app/lib/json-parser.ts (parseShotsJSON)
function parseShotsFromBuffer_deprecated(buffer: string) {
  console.log('[parseJSON] 输入长度:', buffer.length,
    '| 开头:', buffer.slice(0, 30),
    '| 结尾:', buffer.slice(-20))
  let cleaned = buffer.replace(/```json\s*/gi, '').replace(/```\s*/g, '')
  console.log('[parseJSON] 清理后长度:', cleaned.length)
  const start = cleaned.indexOf('[')
  const end = cleaned.lastIndexOf(']')
  console.log('[parseJSON] start:', start, 'end:', end)
  if (start === -1 || end === -1 || start >= end) {
    console.log('[parseJSON] 未找到有效的 [...] 边界')
    return []
  }
  const candidate = cleaned.slice(start, end + 1)
  console.log('[parseJSON] candidate长度:', candidate.length,
    '| 开头:', candidate.slice(0, 30),
    '| 结尾:', candidate.slice(-20))
  try {
    const shots = JSON.parse(candidate)
    console.log('[parseJSON] ✅ 解析成功，', shots.length, '个镜头')
    if (!Array.isArray(shots)) { console.log('[parseJSON] 不是数组'); return [] }
    return shots.map((s: any, i: number) => ({
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
    }))
  } catch (e: any) {
    console.log('[parseJSON] ❌ 首次解析失败:', e.message)
    // 修复常见错误后重试
    try {
      const fixed = candidate.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}')
      const shots = JSON.parse(fixed)
      console.log('[parseJSON] ✅ 修复后解析成功，', shots.length, '个镜头')
      if (!Array.isArray(shots)) return []
      return shots.map((s: any, i: number) => ({
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
      }))
    } catch {
      return []
    }
  }
}

function generateDemoShots(theme: string, count: number) {
  const data = []
  for (let i = 1; i <= count; i++) {
    data.push({
      id: i,
      camera_setup: i === 1 ? '1号机 | 35mm广角 | 低机位仰角' : i === count ? '1号机 | 85mm人像 | 平视' : '2号机 | 50mm标准 | 肩扛',
      shot_size: ['大远景 ELS', '中景 MS', '特写 CU', '全景 LS', '大特写 ECU', '中近景 MCU'][i % 6],
      camera_movement: ['摇镜', '固定', '推镜', '跟拍', '固定', '拉镜'][i % 6],
      visual_art: `色调：${i % 2 === 0 ? '暖橙金' : '冷蓝灰'}调 | 光影：${i % 3 === 0 ? '逆光剪影' : '侧光立体'} | 构图：${i % 2 === 0 ? '三分法' : '中心对称'} | 氛围：${theme}主题${i === 1 ? '宏大开场' : i === count ? '余韵收尾' : '叙事推进'}`,
      content_description: `演员${i === 1 ? '背对镜头缓步走向远方，风吹动衣角，背影渐小' : i === count ? '转头微笑，目光直视镜头，表情释然，定格2秒' : `进行关键动作，眼神专注，面部微表情自然流露，肢体语言${i % 2 === 0 ? '紧张克制' : '舒展放松'}`}`,
      dialogue: i === 3 ? '"这一切真的值得吗？"' : '无',
      voiceover: i === 1 ? `（内心独白·空间混响）"${theme}——这是我从未想过的旅程。"` : '无',
      sound_effects: `【环境音】${i % 2 === 0 ? '城市街道背景声' : '自然白噪音'} | 【Foley】${i === 3 ? '心跳声增强' : '脚步声·衣物摩擦声'} | 【音乐】${i === 1 ? '钢琴渐入·情绪铺垫' : i === count ? '管弦乐收束·余韵悠长' : '电子氛围·中低强度'}`,
      transition: i === count ? '淡出至黑' : i === 3 ? '匹配剪辑' : '切',
      duration: i === 1 || i === count ? 8 : [3, 4, 5, 5, 6, 4][i % 6],
      props_costumes: `${i % 2 === 0 ? '深色风衣·皮质手套' : '浅色衬衫·简约腕表'} | 环境：${i === 3 ? '关键信物特写(戒指/照片)' : '日常陈设'}`,
      remarks: i === 1 ? '※ 地平线放画面上1/3处，留足天空空间' : i === 3 ? '※ 浅景深·背景完全虚化·焦点跟踪眼部' : i === count ? '※ 收尾镜·调色暖化处理·给剪辑师' : '',
    })
  }
  return data
}
