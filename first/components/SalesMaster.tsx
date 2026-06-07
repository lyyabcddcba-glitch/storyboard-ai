'use client'

import { useState } from 'react'

const QUICK_TAGS = ['嫌套餐贵', '信号质疑', '已有老家卡', '咨询教务挂科', '宿舍断网问题']

const QUICK_FILL: Record<string, string> = {
  '嫌套餐贵': '怎么比移动贵了30元？感觉有点贵，我用校园网不行吗？',
  '信号质疑': '学长，听说新宿舍墙壁特别厚，你们电信卡在寝室厕所或者床帘里真的有信号吗？',
  '已有老家卡': '我自己带了老家的无限流量卡，不需要再办本地卡了吧？',
  '咨询教务挂科': '学长，如果期末挂科了后果真的很严重吗？会影响拿毕业证吗？',
  '宿舍断网问题': '晚上断电了之后，你们是怎么在宿舍里熬过去的啊？',
}

interface Props {
  schoolKey: string
}

export default function SalesMaster({ schoolKey }: Props) {
  const [userQuery, setUserQuery] = useState('')
  const [chatScript, setChatScript] = useState('')
  const [strategy, setStrategy] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const askSalesMaster = async () => {
    if (!userQuery.trim() || loading) return
    setLoading(true); setChatScript(''); setStrategy(''); setError('')
    try {
      const res = await fetch('/api/sales-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolKey, userQuery: userQuery.trim(), contextTag: '战时对线' }),
      })
      const data = await res.json()
      if (data.success) {
        setChatScript(data.chatScript || '')
        setStrategy(data.faceToFaceStrategy || '')
        if (!data.chatScript && !data.faceToFaceStrategy) {
          setError('AI返回为空，请重试')
        }
      } else {
        setError(data.error || 'AI响应失败')
      }
    } catch {
      setError('网络错误，请检查后端服务')
    } finally {
      setLoading(false)
    }
  }

  const copyAll = () => {
    const text = `【群聊/微信直发】\n${chatScript}\n\n【扫楼面对面攻坚】\n${strategy}`
    navigator.clipboard.writeText(text)
  }

  const fillQuick = (tag: string) => {
    setUserQuery(QUICK_FILL[tag] || '')
    setChatScript(''); setStrategy(''); setError('')
  }

  const hasResult = chatScript || strategy

  return (
    <div className="bg-zinc-900 border-2 border-amber-500/30 rounded-xl p-5 shadow-xl shadow-amber-500/5">
      {/* 头部 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🤖</span>
        <h3 className="text-base font-bold text-amber-400">AI 销售大师 · 实时对线端口</h3>
        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">实时赋能</span>
      </div>

      {/* 快捷标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_TAGS.map(tag => (
          <button key={tag} onClick={() => fillQuick(tag)}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg transition border border-zinc-700 hover:border-amber-500/30">
            # {tag}
          </button>
        ))}
      </div>

      {/* 输入区 */}
      <div className="relative">
        <textarea value={userQuery} onChange={e => setUserQuery(e.target.value)}
          rows={3}
          placeholder="把群聊里新生的原话，或者地推时新生怼你的话贴在这里..."
          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg p-3.5 focus:outline-none focus:border-amber-500 transition resize-none placeholder:text-zinc-600"
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) askSalesMaster() }}
        />
        <button onClick={askSalesMaster} disabled={loading || !userQuery.trim()}
          className="absolute bottom-3 right-3 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black text-xs font-bold px-4 py-2 rounded-lg transition shadow-md">
          {loading ? '⏳ 思考中...' : '⚡ 生成绝杀回复'}
        </button>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-xs text-red-400">{error}</div>
      )}

      {/* 结果区 — 结构化双卡片 */}
      {hasResult && (
        <div className="mt-4 space-y-3">
          {chatScript && (
            <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-amber-500 font-bold">💬 【群聊/微信直发模板】</span>
                <button onClick={() => navigator.clipboard.writeText(chatScript)}
                  className="text-xs text-zinc-500 hover:text-amber-400 transition px-2 py-0.5 rounded border border-zinc-800">
                  📋 复制
                </button>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{chatScript}</p>
            </div>
          )}
          {strategy && (
            <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-blue-400 font-bold">⚡ 【线下扫楼攻坚切入点】</span>
                <button onClick={() => navigator.clipboard.writeText(strategy)}
                  className="text-xs text-zinc-500 hover:text-blue-400 transition px-2 py-0.5 rounded border border-zinc-800">
                  📋 复制
                </button>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{strategy}</p>
            </div>
          )}
          <button onClick={copyAll}
            className="w-full py-2 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition">
            📋 一键复制全部（话术+策略）
          </button>
        </div>
      )}
    </div>
  )
}
