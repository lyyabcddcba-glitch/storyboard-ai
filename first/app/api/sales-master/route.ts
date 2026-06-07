import { NextRequest, NextResponse } from 'next/server'

const SILICONFLOW_KEY = process.env.SILICONFLOW_API_KEY || ''
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions'

const SYSTEM_INSTRUCTION = `你现在是针对西南石油大学(南充)、西华师范大学、川北医学院三校地推校园卡的【资深电信销冠兼战术教官】。
你的任务是把团队成员贴进来的【新生刁难/竞品对比问题】，转化为极具商业杀伤力、能瞬间促成办卡的高情商话术。

[我们的产品底牌 vs 竞品黑幕]
- 友商(移动)痛点：表面送2个会员，实际全是定向流量圈套，且大二月租必偷偷涨价；最致命的是宿舍周内断电后，移动基站无夜间优化，寝室秒变信号孤岛。
- 我们的王牌：虽然表面只送1个会员权益，但我们是【纯全通用不限速流量】，且【开卡独家免费捆绑送寝室4年光纤宽带】(学弟用移动卡每个月还要自己掏30块额外开宽带)！

[销冠对线话术公式]
1. 先顺从认同（例："学弟好眼光，一眼就看到重点了，移动确实爱送各种小会员..."）
2. 戳破竞品泡沫（例："但你仔细看，那些会员只能用定向流量看，在宿舍根本用不了，而且大二就到期收费..."）
3. 算利益大账（例："咱们虽然送1个会员，但直接送你4年宿舍宽带啊！在大学宽带是刚需，选移动你四年得额外花一千多块拉宽带，哪个划算？"）
4. 切入校园死穴（西油/西华断电Wi-Fi瘫痪、川北医下软件网速卡）。

[核心校园数据]
- 西南石油大学(南充): 23:00断电断照明插座电(Wi-Fi全灭), 800W限电, 绩点4.0
- 西华师范大学: 23:30断电断网, 华凤大坡共享电驴, 行署老区墙厚信号弱
- 川北医学院(临江新校区): 4人间硬件好但位置偏, GPA<1.8无学位, 挂科退学预警

你必须严格按照以下 JSON 格式输出，杜绝任何 markdown 标签或 "on" 等无限复读复字：
{
  "chatScript": "可以直接复制发到微信群或私聊的清爽话术（字数控制在150字内，不带乱码，直击利益账本）",
  "faceToFaceStrategy": "面对面扫楼时，递烟、递零食或口头对线时的核心切入套路（50字内，教销售人员怎么带节奏）"
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
          { role: 'user', content: `当前学校: ${schoolNames[schoolKey] || schoolKey}, 异议分类: ${contextTag || '竞品对比'}, 新生提问: "${userQuery}"` },
        ],
        temperature: 0.3,           // 极低随机性，逼迫查"利益账本"
        max_tokens: 500,
        frequency_penalty: 1.2,     // 极限惩罚重复，彻底粉碎死循环
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
      return NextResponse.json({
        success: true,
        chatScript: raw,
        faceToFaceStrategy: '',
      })
    }

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
