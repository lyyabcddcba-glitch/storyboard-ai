import { NextRequest, NextResponse } from 'next/server'
import type { GenerateRequest, GenerateResponse, StrategyItem } from '@/lib/types'

// ============================================================
// DeepSeek API 配置
// 注册地址: https://platform.deepseek.com
// API Key 价格: 100万字 ≈ 2元，单次调用 ≈ 0.001分
// ============================================================
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

const SYSTEM_PROMPT = `你是一位世界顶级的教培/驾校行业"招生成交专家"。

你的任务：用户会输入一段家长/学员的刁钻提问或沟通场景，你必须给出 3 套不同策略的回复方案。

3 套方案分别走不同路线：
- 方案一：温和共情路线（理解+共情+算账+邀约试学）
- 方案二：专业权威路线（数据+对比+差异化+价值塑造）
- 方案三：促进行动路线（优惠+稀缺+零风险+逼单）

要求：
1. 每套方案的 content 是完整的、可直接复制粘贴发送给家长的话术文案
2. 话术要口语化、有感染力、像真人销售说的话，不要像AI写的
3. 每套话术 150-300 字，结构清晰，适当换行
4. 如果用户输入包含具体信息（机构名、课程名、价格等），在回复中巧妙引用

严格按以下 JSON 格式返回，不要有任何多余文字：
[
  {"title": "方案一：温和共情 · XXX法", "content": "话术文案..."},
  {"title": "方案二：专业权威 · XXX法", "content": "话术文案..."},
  {"title": "方案三：促进行动 · XXX法", "content": "话术文案..."}
]`

// ── 本地降级策略（无 API Key 时使用）──
const MOCK_RESULTS: Record<string, string> = {
  'sales-script': '销售话术mock数据已移至策略生成引擎',
  'video-script': `🎬 短视频脚本\n\n📌 爆款标题：\n"高考完第一件事：考驾照！暑假立省500🔥"\n\n⚡ 黄金3秒开头：\n🎥 高考考场铃声 → 考生冲出校门\n🗣 "恭喜你解放了！但等等——先把这件事办了。"\n\n📹 分镜（42秒）：\n0-5s 开场 | 5-12s 痛点 | 12-28s 卖点 | 28-38s 信任 | 38-42s 行动\n\n💬 评论区引导 ×3 | 🎵 BGM ×2 | 🏷 话题 ×5`,
  'moments-post': `💬 朋友圈文案\n\n📸 版本一｜情感共鸣版（周一发）\n"儿子考完最后一科跟我说：妈，我终于可以学车了！！"\n\n📸 版本二｜信任背书版（周三发）\n"📊 今年暑假183个家庭选了XX驾校，通过率94.8%"\n\n📸 版本三｜紧迫成交版（周五发）\n"🔥 早鸟价今晚截止！立省500，仅剩17个名额！"\n\n📅 发圈策略：连续3周循环`,
  'event-plan': `📋 活动策划方案\n\n「暑假出行自由计划」45天拿证挑战赛\n\n⏰ 09:00-09:30 签到+领取挑战卡\n⏰ 09:30-10:00 校长分享\n⏰ 10:00-10:40 分组试学\n⏰ 10:40-11:10 学员分享\n⏰ 11:10-11:30 优惠揭晓\n⏰ 11:30-12:00 咨询+砸金蛋\n\n💰 预算：7,840元 → ROI 12倍`,
}

// 本地降级策略生成（无 API Key 时自动启用）
function generateLocalStrategies(input: string): StrategyItem[] {
  const brief = input.slice(0, 30)
  const text = input.toLowerCase()

  const hasPrice = text.includes('贵') || text.includes('价格') || text.includes('便宜') || text.includes('钱')
  const hasRival = text.includes('别家') || text.includes('竞品') || text.includes('隔壁') || text.includes('对比')
  const hasGhost = text.includes('不回') || text.includes('不回复') || text.includes('消失')
  const hasHesitate = text.includes('考虑') || text.includes('犹豫') || text.includes('商量')
  const hasTime = text.includes('没时间') || text.includes('忙') || text.includes('没空')

  let a = '', b = '', c = ''
  if (hasPrice || hasRival) {
    a = `"完全理解，${brief}确实需要慎重。不过您换个角度——便宜的驾校，科二科三挂一次补考500+、还要请假3天，算下来反而更贵。我们全包：含补考费、含模拟费、不过免费重学。一次性通过，反而最省钱。您先不急着决定，周末来试学感受一下？不收费的～"`
    b = `"给您看组真实数据：去年327个暑期学员，310人45天内拿证，通过率94.8%——交管所备案的。一人一车一教练，APP预约不排队。便宜驾校4-5人一车，排队2小时练10分钟。科二挂一次=补考500+请假3天。${hasRival ? '您把别家报价逐项列出来，我帮您对标对比。' : '便宜的最终可能比贵的还贵。'}"`
  } else if (hasGhost) {
    a = `"${brief}——没有催您的意思哈。就是暑期名额每天在少，我怕您等想报的时候没位置了。您先付100定金锁个名额，随时可退。您考虑您的，位置给您留着～"`
    b = `"刚有个跟您同校的学员报了名。对了，我发您一份《学车体检流程和注意事项》，不管在哪学都能用上～（核心：不催成交，先给价值。发了资料后对方回复率提升3倍。）"`
  } else if (hasHesitate) {
    a = `"完全理解，${brief}很正常。不过我可以问一下——您具体顾虑的是哪方面？是价格、时间、还是效果？您直接告诉我，我给您针对性解答，比您自己纠结省时间。"`
    b = `"这样，您先不用急着决定。周末来试学：① 教练带您开一圈感受风格 ② 看看场地和车辆 ③ 跟学员聊聊。试学免费，合适就报，不合适也没关系。这样您心里有底。"`
  } else if (hasTime) {
    a = `"理解，${brief}确实忙。不过我们每天早上8-10点是专属练车时段，一人一车到了就练不用排队。每天抽1小时，45天就拿证。关键是不用等——APP自己约时段，跟您的日程完美匹配。"`
    b = `"我们暑期特训班专门为学生党设计：45天快速拿证，每天专属时段不跟上班族抢。教练车接车送。去年327个学员310个45天拿证。您看哪天方便来试学？"`
  } else {
    a = `"完全理解您的情况。${brief}确实需要认真对待。我帮您分析一下——很多类似情况的客户其实最核心的问题就一个：信息不对称。您方便多说说具体情况吗？我针对性地帮您出方案～"`
    b = `"给您看组数据：我们去年327个学员，310人45天拿证，通过率94.8%。一人一车一教练，APP预约不排队。教练每月评分，低于4.5星停训。不过免费重学——写在合同里的。您看哪天方便来试学感受一下？"`
  }
  c = `"这样，我先帮您锁定现在的优惠——付100定金锁名额，随时可退。您考虑您的，位置给您留着。暑期特训班只剩17个名额，满了恢复原价。现在定省500还能抢到心仪时段。扫码付定金我帮您录入👇"`

  return [
    { label: '方案一：温和共情 · 算总账法', icon: '🤝', content: a, category: '价格异议', style: '温和 · 心理策略：认知重构' },
    { label: '方案二：专业权威 · 数据对比法', icon: '💼', content: b, category: '信任异议', style: '专业 · 心理策略：权威背书' },
    { label: '方案三：促进行动 · 限时锁位法', icon: '🎁', content: c, category: '促单', style: '直接 · 心理策略：稀缺效应' },
  ]
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()

    if (!body.type || !body.input?.trim()) {
      return NextResponse.json(
        { success: false, result: '', error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // ── 有 API Key → 调用真 AI ──
    if (DEEPSEEK_API_KEY && body.multiStrategy && body.type === 'sales-script') {
      try {
        const response = await fetch(DEEPSEEK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: body.input },
            ],
            temperature: 0.8,
            max_tokens: 2000,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const rawText = data.choices?.[0]?.message?.content || ''

          // 解析 AI 返回的 JSON
          let strategies: StrategyItem[] = []
          try {
            // 尝试提取 JSON（AI 可能在 JSON 前后加文字）
            const jsonMatch = rawText.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0])
              strategies = parsed.map((item: any, i: number) => ({
                label: item.title || `方案${i + 1}`,
                icon: ['🤝', '💼', '🎁'][i] || '💡',
                content: item.content || '',
                category: 'AI定制',
                style: item.title?.includes('温和') ? '温和 · 心理策略：共情共鸣' :
                       item.title?.includes('专业') ? '专业 · 心理策略：权威说服' :
                       '直接 · 心理策略：行动驱动',
              }))
            }
          } catch {
            // JSON 解析失败，把原始文本作为单个结果返回
            strategies = [{
              label: 'AI 定制方案',
              icon: '🤖',
              content: rawText,
              category: 'AI深度生成',
              style: 'AI · 实时推演',
            }]
          }

          const result: GenerateResponse = {
            success: true,
            result: rawText,
            strategies,
          }
          return NextResponse.json(result)
        }
        // API 调用失败 → 降级到本地生成
        console.error('DeepSeek API error:', response.status)
      } catch (err) {
        console.error('DeepSeek API exception:', err)
      }
      // 降级继续往下走，返回本地生成结果
    }

    // ── 无 API Key 或非销售多策略 → 本地降级生成 ──
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 500))

    const result = MOCK_RESULTS[body.type] || '生成结果'
    let strategies: StrategyItem[] | undefined

    // 销售多策略请求 → 本地引擎生成
    if (body.multiStrategy && body.type === 'sales-script') {
      strategies = generateLocalStrategies(body.input)
    }

    return NextResponse.json({
      success: true,
      result,
      ...(strategies && { strategies }),
    })

  } catch (error) {
    console.error('生成失败:', error)
    return NextResponse.json(
      { success: false, result: '', error: '生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
