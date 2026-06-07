'use client'

import { useState } from 'react'

const STAGES = [
  {
    id: '01', title: '选择引流战场', color: 'amber',
    subtitle: '立稳大二暖心学长姐人设，混入新生流量池',
    platforms: [
      { icon: '🟢', name: '微信群 / QQ群', desc: '混新生群发避坑指南', hover: 'hover:border-green-500/40' },
      { icon: '📕', name: '小红书', desc: '发高颜值宿舍食堂实景', hover: 'hover:border-red-500/40' },
      { icon: '⚫', name: '抖音', desc: '配欢快BGM发校园vlog', hover: 'hover:border-white/30' },
      { icon: '🔵', name: '贴吧 / 知乎', desc: '专业回答选号和网速细节', hover: 'hover:border-blue-500/40' },
    ],
  },
]

const HOOKS_TEXT = '学弟学妹注意啦！咱们学校宿舍周内晚上断电后Wi-Fi全断。我们几位大二学长亲测整理了今年网络最稳、打游戏看网课延迟最低的选号避坑攻略。需要的在评论区扣个"1"，学长私发给你详细避坑指南，顺便带你了解咱们新宿舍和食堂哪个档口打菜不手抖！'

const ICE_BREAKER_TEXT = `哈哈学弟/学妹别慌！作为你的亲学长姐，今天摸着良心给你一次性盘得明明白白，保证让你开学不踩一丁点坑！

咱们团队这次6.15重磅上线的电信迎新官方卡，全线套餐都有一个绝杀福利：【全部白送1000分钟国内超大通话】！开学后想家了给爸妈打电话、或者跟异地恋对象煲电话粥直接打到爽，电话费直接省下。

至于怎么选，听学长姐一句劝，直接一步到位选【有校园网的套餐】。这卡里包含360G市区流量（还可以无限叠加），在学校追剧、刷网课、打游戏闭着眼睛造都用不完。最硬核的是它【直接自带咱们寝室的高速光纤宽带校园网】！你要是图便宜选了外面不带网的卡，进了新宿舍每个月还得自己额外花30多块拉网线，四年下来多花一千多，那才是真冤枉。

咱们学校周内晚上11点可是准时拉闸断电的，到时候宿舍Wi-Fi路由器瞬间全灭，普通的卡在寝室死角直接变信号孤岛。而咱们这款有校园网的套餐自带电信夜间5G基站增压，一网通全包，最省心也最省钱。选它绝对不踩坑，开学学长姐带你吃食堂不手抖的档口！`

const VERSUS_TEXT = '哈哈学弟，移动送2个会员都是定向流量圈套，在宿舍根本用不了！咱们【有校园网的套餐】自带360G市区流量可无限叠加，还白送1000分钟通话跟宿舍宽带。办移动你每个月还得额外花几十块拉宽带，四年多花一千多！我们一网通全包，省下的钱能买几百个月的会员，听学长的直接上全能卡！'

const GRAD_CARD_TEXT = '学妹，19元那个是给大四出去实习、不回宿舍住的【毕业生专属卡】，不带校园网宽带，而且名额是锁死的，咱们在校大一新生系统不让通过。听话，咱们天天在宿舍里，黄金首选绝对是【有校园网的套餐】，网速最顶还免了四年宽带费，这才是真省钱！'

export default function GuidePage() {
  const [copied, setCopied] = useState('')

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="mb-2 border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
          🚀 跨平台地推引流与对线全流程流水线
        </h1>
        <p className="text-xs text-zinc-400 mt-1">面向地推团队：从各大平台爆款引流到微信/QQ私聊合围，一键复制销冠子弹。</p>
      </div>

      {/* Stage 01: 选择战场 */}
      <div className="relative pl-8 border-l-2 border-amber-500/30 pb-4">
        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 border-4 border-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold rounded border border-amber-500/20">STAGE 01</span>
          <h2 className="text-base font-bold text-zinc-200">选择引流战场</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STAGES[0].platforms.map(p => (
            <div key={p.name} className={`p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-center ${p.hover} transition-all cursor-pointer`}>
              <div className="text-xl mb-1">{p.icon}</div>
              <div className="text-xs font-bold text-zinc-300">{p.name}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage 02: 丢下钩子 */}
      <div className="relative pl-8 border-l-2 border-amber-500/30 pb-4">
        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 border-4 border-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold rounded border border-amber-500/20">STAGE 02</span>
          <h2 className="text-base font-bold text-zinc-200">丢下引流钩子（文案 + 素材配合）</h2>
        </div>
        <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
          <div className="text-xs text-zinc-400 mb-2 flex justify-between items-center flex-wrap gap-2">
            <span>📸 配合素材：建议配上宿舍实景、高颜值食堂、校区标志建筑照片。</span>
            <button onClick={() => copyText(HOOKS_TEXT, 'hook')}
              className={`text-xs px-3 py-1 rounded transition-all font-bold ${
                copied === 'hook' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black'
              }`}>
              {copied === 'hook' ? '✓ 已复制' : '📋 一键复制钩子文案'}
            </button>
          </div>
          <div className="p-3 bg-zinc-950 rounded border border-zinc-800 text-sm text-zinc-300 leading-relaxed">
            {HOOKS_TEXT}
          </div>
        </div>
      </div>

      {/* Stage 03: 私聊长文轰炸 */}
      <div className="relative pl-8 border-l-2 border-amber-500/30 pb-4">
        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 border-4 border-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold rounded border border-amber-500/20">STAGE 03</span>
          <h2 className="text-base font-bold text-zinc-200">客户上钩，后台私聊长文轰炸</h2>
        </div>
        <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
          <div className="text-xs text-zinc-400 mb-2 flex justify-between items-center flex-wrap gap-2">
            <span>💬 新生在评论区扣"1"或私信"怎么选套餐"时，直接甩出。</span>
            <button onClick={() => copyText(ICE_BREAKER_TEXT, 'ice')}
              className={`text-xs px-3 py-1 rounded transition-all font-bold ${
                copied === 'ice' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black'
              }`}>
              {copied === 'ice' ? '✓ 已复制' : '📋 一键复制暖心长文'}
            </button>
          </div>
          <div className="p-3 bg-zinc-950 rounded border border-zinc-800 text-sm text-zinc-300 whitespace-pre-line leading-relaxed">
            {ICE_BREAKER_TEXT}
          </div>
        </div>
      </div>

      {/* Stage 04: 异议绝杀 */}
      <div className="relative pl-8">
        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-500 border-4 border-zinc-950 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[10px] font-mono font-bold rounded border border-orange-500/20">STAGE 04</span>
          <h2 className="text-base font-bold text-zinc-200">异议对抗绝杀（破解移动套路，锁死主推卡）</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
            <div className="text-xs text-red-400 font-bold mb-2 flex justify-between items-center">
              <span>🛑 当新生嫌贵 / 对比移动两个会员时：</span>
              <button onClick={() => copyText(VERSUS_TEXT, 'vs')}
                className={`text-[10px] px-2 py-0.5 rounded transition-all font-bold ${
                  copied === 'vs' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white'
                }`}>
                {copied === 'vs' ? '✓ 已复制' : '复制绝杀话术'}
              </button>
            </div>
            <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded border border-zinc-800 leading-relaxed">{VERSUS_TEXT}</p>
          </div>

          <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
            <div className="text-xs text-cyan-400 font-bold mb-2 flex justify-between items-center">
              <span>🎓 当新生贪便宜想办19元引流卡时：</span>
              <button onClick={() => copyText(GRAD_CARD_TEXT, 'grad')}
                className={`text-[10px] px-2 py-0.5 rounded transition-all font-bold ${
                  copied === 'grad' ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-white'
                }`}>
                {copied === 'grad' ? '✓ 已复制' : '复制堵死话术'}
              </button>
            </div>
            <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded border border-zinc-800 leading-relaxed">{GRAD_CARD_TEXT}</p>
          </div>
        </div>
      </div>

      {/* 底部快捷跳转 */}
      <div className="flex justify-center gap-4 pt-4 border-t border-zinc-800">
        <a href="/sales" className="text-xs text-indigo-400 hover:text-indigo-300">💬 打开 AI 销售大师 →</a>
        <a href="/booking" className="text-xs text-amber-400 hover:text-amber-300">📱 打开选号预约 →</a>
      </div>
    </div>
  )
}
