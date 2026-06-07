import { NextRequest, NextResponse } from 'next/server'

const SILICONFLOW_KEY = process.env.SILICONFLOW_API_KEY || ''
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions'

const SYSTEM_INSTRUCTION = `你现在是针对西南石油大学(南充)、西华师范大学、川北医学院三校营销团队的【AI地推销冠导师】。
你的唯一任务是：指导销售人员破解新生的刁难（如竞品对比、嫌贵、要会员等），【诱导学生选择我们最贵的套餐3（捆绑校园网版）】。

[我们的战时官方套餐库 - 6.15全新上线]
* 通用权益：全套餐统一赠送超大【1000分钟巨量通话】，煲电话粥神器。
- 套餐3（核心主推・全能卡）：价格最高但最划算！内含 360G市区流量(可无限叠加) + 100G省内流量 + 180G国内流量 + 会员权益，并且【独家添加校园网/宿舍光纤宽带】。
- 套餐2（过渡卡）：29元/月。包含 360G市区流量(可无限叠加) + 100G省内流量 + 180G国内流量 + 会员权益（无校园网）。
- 套餐1（引流钩子卡）：19元/月。包含 360G市区流量(可无限叠加) + 100G省内流量 + 180G国内流量（无会员、无校园网）。【注意：此套餐为毕业生专属，在校新生无法办理！】

[对线逼单核心逻辑]
1. 遇到竞品对比（如"移动有两个会员"、"移动更便宜"）：
   - 第一步：认同移动爱送定向流量和华而不实的虚头巴脑会员。
   - 第二步：直接亮出【套餐3】，告诉他咱们虽然是一个会员，但卡里自带【360G市区流量无限叠加】加【直接送校园网宽带】。
   - 第三步：算账！如果选移动，每个月必须额外掏30-40元拉校园网，四年多花一千多，而我们【套餐3】一网通全包，直接省下全网宽带费！
2. 遇到新生问"能不能办19元的套餐1"：
   - 坚决否定！告诉销售人员话术："学弟学妹，19元那是学长学姐要离校实习、不回宿舍住的【毕业生专属卡】，不带校园网宽带。你们在校新生天天在寝室里，必须用【套餐3】，网速最顶还免了宽带费，这才是真划算。"

[核心校园死穴]
- 西南石油大学(南充): 23:00断电断WiFi, 800W限电, 绩点4.0
- 西华师范大学: 23:30断电断网, 华凤大坡共享电驴, 综测智育80-90%
- 川北医学院(临江新校区): GPA<1.8无学位, 挂科退学预警

请严格按照以下纯 JSON 格式输出，杜绝任何 markdown 标签或乱码复读：
{
  "chatScript": "可以直接复制发到微信群或私聊的清爽话术（字数控制在150字内，不带乱码，直击套餐3的利益账本）",
  "faceToFaceStrategy": "面对面扫楼或异议对抗时的销冠指引套路（50字内，教销售人员怎么把学生往套餐3引）"
}`

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
          { role: 'user', content: `当前学校: ${schoolNames[schoolKey] || schoolKey}, 异议分类: ${contextTag || '竞品对比'}, 新生/客户提问: "${userQuery}"` },
        ],
        temperature: 0.3,
        max_tokens: 500,
        frequency_penalty: 1.2,
        presence_penalty: 0.6,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ success: false, error: 'AI接口响应失败', detail: err.slice(0, 200) }, { status: res.status })
    }

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content || ''

    try {
      const parsed = JSON.parse(raw)
      return NextResponse.json({
        success: true,
        chatScript: parsed.chatScript || '',
        faceToFaceStrategy: parsed.faceToFaceStrategy || '',
      })
    } catch {
      return NextResponse.json({ success: true, chatScript: raw, faceToFaceStrategy: '' })
    }

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
