import { NextRequest, NextResponse } from 'next/server'

const SILICONFLOW_KEY = process.env.SILICONFLOW_API_KEY || ''
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions'

const SYSTEM_INSTRUCTION = `你是一位精通高校规则的校园卡推销骨干。请针对销售人员贴出的【客户/新生原话】，给出两段极其精简、高情商的答复。
你必须严格按照以下 JSON 格式输出，不要包含任何多余的解释、markdown标签或引言：
{
  "chatScript": "一句话微信/群聊直发话术，要求简短、接地气、直接针对痛点，不带乱码",
  "faceToFaceStrategy": "面对面扫楼/异议对抗时的核心切入点指引，字数在50字以内"
}

[核心数据库背景]
- 西南石油大学(南充): 23:00准时断照明插座电(Wi-Fi废掉), 平时分占30%卷面70%, 绩点4.0满分。
- 西华师范大学: 23:30断电断网. 华凤校区大坡多, 共享单车刚需; 行署老区墙体厚信号弱. 综测智育占80-90%.
- 川北医学院(临江新校区): 全员全新4人间硬件好, 但新校区偏远像孤岛, 江边信号易衰减, GPA低于1.8无学位证, 挂科直接触发预警.`

export async function POST(request: NextRequest) {
  try {
    const { schoolKey, userQuery, contextTag } = await request.json()

    if (!userQuery?.trim()) {
      return NextResponse.json({ success: false, error: '请输入新生原话' }, { status: 400 })
    }

    if (!SILICONFLOW_KEY) {
      return NextResponse.json({ success: false, error: '未配置 SILICONFLOW_API_KEY' }, { status: 500 })
    }

    const schoolNames: Record<string, string> = {
      swpu: '西南石油大学(南充校区)',
      cwnu: '西华师范大学',
      nsmc: '川北医学院(临江新校区)',
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SILICONFLOW_KEY}`,
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct',
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          { role: 'user', content: `学校: ${schoolNames[schoolKey] || schoolKey}, 分类: ${contextTag || '客户异议'}, 新生原话: "${userQuery}"` },
        ],
        temperature: 0.4,           // 降低随机性，更严谨
        max_tokens: 400,            // 压缩字数，防止长文复读
        frequency_penalty: 0.8,     // 【核心解药】惩罚重复词，杜绝 "on on on"
        presence_penalty: 0.5,      // 促使使用新词，保证流畅
        response_format: { type: 'json_object' }, // 强行锁死 JSON
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ success: false, error: 'AI接口响应失败', detail: err.slice(0, 200) }, { status: res.status })
    }

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content || ''

    // 解析 JSON
    let chatScript = ''
    let faceToFaceStrategy = ''

    try {
      const parsed = JSON.parse(raw)
      chatScript = parsed.chatScript || ''
      faceToFaceStrategy = parsed.faceToFaceStrategy || ''
    } catch {
      // JSON 解析失败，回退为纯文本
      chatScript = raw
    }

    return NextResponse.json({
      success: true,
      chatScript,
      faceToFaceStrategy,
    })

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
