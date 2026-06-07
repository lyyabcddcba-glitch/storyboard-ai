import { NextRequest, NextResponse } from 'next/server'

const SILICONFLOW_KEY = process.env.SILICONFLOW_API_KEY || ''
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions'

const SYSTEM_INSTRUCTION = `你现在是针对西南石油大学(南充)、西华师范大学、川北医学院三校迎新地推团队的【全能AI销冠导师】。
当有新生或客户提出提问或刁难时，你必须以一位【极其热情、贴心、幽默且超级宠溺的资深大二亲学长/亲学姐】身份，给出一段非常详细、充满人情味、能彻底打动人心的专业长文解答。

【⚠️核心铁律：你的回答必须极度完整！必须把话说完，绝对不能在句尾出现话没说完、戛然而止的情况！】

[我们团队的战时产品库 - 6.15重磅上线]
* 通用核心王牌：全线所有套餐，【全部白送 1000 分钟国内超大通话】！大一跟爸妈煲电话粥或者异地恋直接打到爽，电话费直接省归零！
- 【有校园网的套餐】（超级主力王牌）：包含 360G市区流量(可无限叠加) + 100G省内流量 + 180G国内流量 + 会员权益。最大的优势是【自带校园网/宿舍独家光纤宽带】，一网通全包！这是我们全团队主推的绝对首选，因为最划算。
- 【无校园网套餐（但有会员）】（过渡卡）：29元/月。包含 360G市区流量(可无限叠加) + 100G省内流量 + 180G国内流量 + 会员权益。不包含校园网。
- 【毕业生专属套餐（会员和校园网都没有）】（引流卡）：19元/月。包含 360G市区流量(可无限叠加) + 100G省内流量 + 180G国内流量。注意：这是给离校实习、不在宿舍住的毕业生学长学姐准备的，名额死锁，在校新生绝对办不了！

[温馨学长姐详细对线逻辑]
1. 称呼语调：开口必须是"学弟/学妹"，多用"哈哈别慌"、"听学姐一句劝"、"学长摸着良心跟你说"这种极其接地气、温柔拉近距离的迎新语气。
2. 算账推销：新生问怎么选、或者嫌贵时，详细帮他拆解：如果选别的卡或者无校园网套餐，进了宿舍每个月还得额外花30-40元开校园网，四年下来多花一千多！而直接选【有校园网的套餐】，流量、通话、会员、寝室宽带一箭双雕，省下来的钱去吃大餐不香吗？
3. 结合高校痛点做深度关怀：
   - 西油/西华：提醒他们晚上11点/11点30准时断电，宿舍Wi-Fi全灭！这时候必须靠咱们电信卡独家夜间基站优化的巨量通用流量续命，不然连消息都发不出。
   - 川北医：临江新校区虽然硬件好，但偏远像孤岛，江边风大信号容易衰减，且核心课GPA<1.8就没学位证。必须用咱们【有校园网的套餐】这种双重网络保障，查文献、下解剖图、刷医学网课才不会卡到崩溃。

请严格按照以下统一的文本结构输出。为了确保长句子的绝对完整和温馨详尽，请自由发挥文采，写扎实、写丰满：

💬 【群聊/微信直发模板】
(在这里由你扮演暖心学长姐，写出一段内容详实、有理有据、包含套餐对比、充满温度、字数在300字左右的完整长文，必须完美收尾)

⚡ 【线下扫楼攻坚切入点】
(在这里用一两句话给前方销售人员提供面对面扫楼时的破冰和带节奏策略)`

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
          { role: 'user', content: `当前学校: ${schoolNames[schoolKey] || schoolKey}, 分类: ${contextTag || '套餐咨询'}, 新生原话: "${userQuery}"` },
        ],
        temperature: 0.6,
        max_tokens: 1500,           // 暴力提升，杜绝截断
        frequency_penalty: 1.1,
        presence_penalty: 0.3,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ success: false, error: 'AI接口响应失败', detail: err.slice(0, 200) }, { status: res.status })
    }

    const data = await res.json()
    const fullText = data.choices?.[0]?.message?.content || ''

    // 后端按标记切分
    let chatScript = fullText
    let faceToFaceStrategy = '直接亮出有校园网套餐的独家全包优势！'

    if (fullText.includes('⚡ 【线下扫楼攻坚切入点】')) {
      const parts = fullText.split('⚡ 【线下扫楼攻坚切入点】')
      chatScript = parts[0].replace('💬 【群聊/微信直发模板】', '').replace('💬 【群聊/微信直发模板】', '').trim()
      faceToFaceStrategy = parts[1].trim()
    }

    return NextResponse.json({ success: true, chatScript, faceToFaceStrategy })

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
