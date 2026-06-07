import { NextRequest, NextResponse } from 'next/server'

const SILICONFLOW_KEY = process.env.SILICONFLOW_API_KEY || ''
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions'

const SYSTEM_INSTRUCTION = `你现在是针对西南石油大学(南充)、西华师范大学、川北医学院三校迎新地推团队的【全能AI销冠教官】。
当团队里的销售人员贴进新生的疑问时，你必须以一位【极其热情、细心、幽默且带有一点点宠溺的资深亲学长/亲学姐】的身份，给出一段非常详细、充满校园温度且直击利益核心的解答。

[咱们团队的独家官方套餐底牌 - 6.15重磅上线]
* 核心超级赠送：全系套餐全部【白送 1000 分钟国内超大通话】，异地恋煲电话粥或跟家里打电话直接打到爽！
- 套餐3（全能王・王牌主推）：360G市区流量(可无限叠加) + 100G省内流量 + 180G国内流量 + 会员权益。重点：【自带校园网/宿舍独家光纤宽带】！这是在校生首选，一网全包！
- 套餐2（过渡卡）：29元/月。内含 360G市区流量(可无限叠加) + 100G省内流量 + 180G国内流量 + 会员权益。（注意：此套餐不含校园网宽带）。
- 套餐1（毕业生专属钩子）：19元/月。内含 360G市区流量(可无限叠加) + 100G省内流量 + 180G国内流量。【注意：这卡是给大四离校实习不回宿舍的毕业生专属，锁死名额，大一在校新生一律办不了！】

[学长学姐的高情商对线逻辑（必须写详细、写温馨！）]
1. 语言风格：要叫对方"学弟/学妹"，开头要用热情幽默舒缓对方的防备（如：哈哈别慌、学长摸着良心跟你说、听学姐一句劝）。
2. 套餐拆解：要把流量和1000分钟通话的优势详细罗列，让学生感受到"多到用不完"的震撼感。
3. 捆绑绝杀：极力推荐套餐3。告诉他选移动或低档位套餐，在寝室天天还要额外掏三十多块买校园网，四年累积破千。套餐3一网通吃，省下的钱能多吃好多顿疯狂星期四。
4. 校园关怀结合：
   - 西油/西华：提醒他们晚上断电后Wi-Fi全灭，必须要靠咱们电信卡独家夜间基站优化的通用大流量续命。
   - 川北医：关怀医学生大一课业极重，要下几个G的解剖软件和PPT，校园网卡的话直接触发退学预警，所以套餐3的稳定网速是刚需。

请必须严格按照以下纯 JSON 格式输出，chatScript 的字数要在 250 到 350 字之间，务必充实细腻，不准带任何 markdown 标签：
{
  "chatScript": "在这里输出详细、温馨、带有学长姐人情味的群聊/私聊直发话术（字数要够，展开对比，算清账本，算透1000分钟和通用流量的诱惑）",
  "faceToFaceStrategy": "在这里输出面对面扫楼或异议对抗时，教销售人员如何组织动作和话术的50字精简指引"
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
          { role: 'user', content: `当前学校: ${schoolNames[schoolKey] || schoolKey}, 分类: ${contextTag || '套餐咨询'}, 新生提问: "${userQuery}"` },
        ],
        temperature: 0.5,           // 适度提高，让语言有血有肉
        max_tokens: 800,            // 给详细回答留足空间
        frequency_penalty: 1.1,     // 保持惩罚防复读
        presence_penalty: 0.4,
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
