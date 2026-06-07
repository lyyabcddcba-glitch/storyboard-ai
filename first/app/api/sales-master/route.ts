import { NextRequest, NextResponse } from 'next/server'

const SILICONFLOW_KEY = process.env.SILICONFLOW_API_KEY || ''
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions'

const SYSTEM_INSTRUCTION = `You are an expert sales mentor and university guide for a student campus network marketing team.
Your goal is to provide response scripts for sales staff based on customer queries.

[Core Database]
- 西南石油大学(南充): 800W限电(严查违禁电器), 周日-周四23:00断插座照明电(Wi-Fi全灭). 4.0绩点制, 综测智育65%. 英语考进A班大一上可考四级, B班等大一下.
- 西华师范大学: 800W限电. 周日-周四23:30断电断网. 5.0绩点制, 奖学金综测期末成绩占比高达80-90%. 大一上全员无门槛考四级. 华凤坡陡纯靠共享电驴, 高峰期外卖点人多信号易瘫痪. 行署老旧宿舍墙厚信号衰减.
- 川北医学院(临江新校区): 全员全新4人间. 现代化宿舍严查违禁电器跳闸直接通报书院. 江边风大偏远, 进城依赖专属公交. 核心课GPA<1.8无学位证, 一学年挂科获分<10分直接退学预警.

[Rules for Response Generation]
1. Reply in Chinese. Keep it highly practical, high-EQ, persuasive, and empathetic.
2. Provide two types of text:
   - 【群聊/微信直发话术】: Concise, user-friendly, ready to copy-paste into WeChat groups.
   - 【扫楼面对面攻坚核心切入点】: Strategic advice for the sales staff during door-to-door visits.
3. Always tie the resolution back to why they need our campus telecom card (stable 5G during power-offs, exclusive base station optimization, free broadband, getting study materials).
4. Never make up false information about school rules. Only use the core database provided above.`

export async function POST(request: NextRequest) {
  try {
    const { schoolKey, userQuery, contextTag } = await request.json()

    if (!userQuery?.trim()) {
      return NextResponse.json({ error: '请输入新生原话或客户问题' }, { status: 400 })
    }

    if (!SILICONFLOW_KEY) {
      return NextResponse.json({ error: '未配置 SILICONFLOW_API_KEY' }, { status: 500 })
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
          {
            role: 'user',
            content: `当前学校: ${schoolNames[schoolKey] || schoolKey}, 场景分类: ${contextTag || '客户异议'}, 新生/客户原话: "${userQuery}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'AI接口响应失败', detail: err.slice(0, 200) }, { status: res.status })
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content || ''

    return NextResponse.json({ success: true, reply })

  } catch (e: any) {
    return NextResponse.json({ error: '服务器错误', message: e.message }, { status: 500 })
  }
}
