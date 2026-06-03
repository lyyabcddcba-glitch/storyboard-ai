import { NextRequest, NextResponse } from 'next/server'

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || ''
const API_URL = 'https://api.deepseek.com/v1/chat/completions'

const SYSTEM_PROMPT = `你是一位拥有20年从业经验的顶级电影导演与分镜师。请根据用户给出的主题，生成一套多维度的极细致分镜脚本。

必须严格输出 JSON 数组。每一项（每一镜）必须包含以下 13 个字段，严禁任何字段为空字符串或null：

1. id (int): 镜号，从1递增。
2. camera_setup (string): 机位镜头。写明几号机、焦段、机身高度（低机位/平视/高机位俯拍）、角度。必须写全。
3. shot_size (string): 景别，附带英文（如"大特写 ECU""中景 MS""大远景 ELS"）。
4. camera_movement (string): 运镜，若为固定写"固定"不可留空。
5. visual_art (string): 美术视觉。必须包含画面主色调、光影方向与质感（侧光/逆光/顶光/柔光/硬光）、构图法则、环境氛围。前后镜次的光影方向和色调必须保持连贯，不可跳变。
6. content_description (string): 必须写明演员的具体肢体动作、面部微表情变化、视线方向、走位路径。
7. dialogue (string): 台词。若无必须写"无"。全片台词需首尾呼应——第一镜抛出的意象或问题，在最后一镜中回收或回答。
8. voiceover (string): 旁白/内心独白。必须注明音频处理方式（如带大空间混响/电话滤波效果）。若无写"无"。
9. sound_effects (string): 必须包含【环境音】【Foley】【音乐情绪】三要素。音效设计在拍摄前规划，不可事后补录。
10. transition (string): 转场方式，写明具体方式不可只写"切"。
11. duration (int): 参考时长(秒)，2-12之间。
12. props_costumes (string): 写明此镜必须出现的具体道具和服装材质/颜色。
13. remarks (string): 多工种联合备注。必须包含【摄影】【灯光】【剪辑】三个工种的指令。三者缺一不可。

返回格式必须是纯净的 JSON 数组，不要有任何额外的说明文字。`

interface StoryboardInput {
  theme: string
  style?: string
  equipment?: string
  shotCount?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: StoryboardInput = await request.json()

    if (!body.theme?.trim()) {
      return NextResponse.json({ error: '请输入拍摄主题' }, { status: 400 })
    }

    const userMessage = [
      `拍摄主题：${body.theme}`,
      body.style && `风格参考：${body.style}`,
      body.equipment && `使用设备：${body.equipment}`,
      body.shotCount && `需要约${body.shotCount}个镜头`,
    ].filter(Boolean).join('\n')

    // 真实 API 调用
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
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const rawText = data.choices?.[0]?.message?.content || ''

          // 提取 JSON 数组
          const jsonMatch = rawText.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            const shots = JSON.parse(jsonMatch[0])
            // 校验每个镜头包含 13 个字段
            const validated = shots.map((s: any, i: number) => ({
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
              duration: s.duration || 5,
              props_costumes: s.props_costumes || '',
              remarks: s.remarks || '',
            }))
            return NextResponse.json({ success: true, shots: validated, raw: rawText })
          }
          return NextResponse.json({ success: true, shots: [], raw: rawText, error: 'JSON 解析失败，请重试' })
        }
      } catch (e) {
        console.error('DeepSeek API error:', e)
      }
    }

    // 降级：返回示例数据
    return NextResponse.json({
      success: true,
      shots: generateDemoShots(body.theme, body.shotCount || 6),
      demo: true,
    })
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 示例分镜数据（API Key 未配置时使用）
function generateDemoShots(theme: string, count: number) {
  const shots = []
  for (let i = 1; i <= count; i++) {
    shots.push({
      id: i,
      camera_setup: i === 1 ? '1号机 | 35mm广角 | 低机位仰角' : i === count ? '1号机 | 85mm人像 | 平视机位' : '2号机 | 50mm标准 | 肩扛跟拍',
      shot_size: i === 1 ? '大远景 ELS' : i === 2 ? '中景 MS' : i === 3 ? '特写 CU' : i === 4 ? '全景 LS' : i === 5 ? '大特写 ECU' : '中近景 MCU',
      camera_movement: i === 1 ? '摇镜（从左至右）' : i === 2 ? '固定' : i === 3 ? '推镜（缓推）' : i === 4 ? '跟拍（平行跟随）' : i === 5 ? '固定' : '拉镜（缓拉）',
      visual_art: `色调：${i % 2 === 0 ? '暖橙金' : '冷蓝灰'}调\n光影：${i % 3 === 0 ? '逆光剪影' : '侧光立体'}\n构图：${i % 2 === 0 ? '三分法' : '中心对称'}构图\n氛围：${theme}主题下的${i === 1 ? '宏大开场' : i === count ? '余韵收尾' : '叙事推进'}`,
      content_description: `演员${i === 1 ? '背对镜头缓步走向远方，风吹动衣角' : i === count ? '转头微笑，目光直视镜头，表情释然' : `进行第${i}个关键动作，眼神专注，微表情变化丰富`}`,
      dialogue: i === 3 ? '"这一切值得吗？"' : '无',
      voiceover: i === 1 ? `（内心独白，带空间混响）"${theme}——这是我从未想过的旅程。"` : '无',
      sound_effects: `【环境音】${i % 2 === 0 ? '城市街道背景声' : '自然白噪音'}\n【Foley】${i === 3 ? '心跳声增强' : '脚步声'}\n【音乐】${i === 1 ? '钢琴渐入，情绪铺垫' : i === count ? '管弦乐收束，余韵悠长' : '电子氛围音，中低强度'}`,
      transition: i === count ? '淡出至黑' : i === 3 ? '匹配剪辑' : '切',
      duration: i === 1 || i === count ? 8 : 5,
      props_costumes: `${i % 2 === 0 ? '深色风衣、皮质手套' : '浅色衬衫、简约腕表'}，环境道具：${i === 3 ? '关键信物（戒指/照片）' : '日常陈设'}`,
      remarks: i === 1 ? '注意地平线放在画面上1/3处，留足天空空间' : i === 3 ? '务必使用浅景深，背景完全虚化' : i === count ? '给剪辑师：此镜为全片收尾镜，请在调色时做暖化处理' : '常规拍摄，注意焦点跟踪',
    })
  }
  return shots
}
