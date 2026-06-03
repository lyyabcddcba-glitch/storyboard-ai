'use client'

import { useState } from 'react'
import type { GeneratorConfig } from '@/lib/types'
import GeneratorCard from './GeneratorCard'

const GENERATORS: GeneratorConfig[] = [
  {
    type: 'sales-script',
    title: '销售成交助手',
    description: '应对家长异议，每一句都能促成成交',
    placeholder: '描述沟通场景或客户异议...\n\n例如：家长说太贵了 / 已读不回怎么跟进 / 对比竞品怎么应答',
    icon: '🎯',
  },
  {
    type: 'event-plan',
    title: '活动策划助手',
    description: '完整招生活动方案，拿来就能执行',
    placeholder: '输入活动目标和基本信息...\n\n例如：驾校暑期开放日，目标到场150组家庭，现场转化率30%',
    icon: '📋',
  },
  {
    type: 'video-script',
    title: '短视频脚本助手',
    description: '爆款招生视频分镜脚本，拍了就能发',
    placeholder: '输入招生主题或卖点...\n\n例如：暑假学车立减500，45天拿证，面向高考生和大学生',
    icon: '🎬',
  },
  {
    type: 'moments-post',
    title: '朋友圈文案助手',
    description: '三版文案 + 配图 + 发圈策略，一键复制',
    placeholder: '输入推广内容或活动信息...\n\n例如：暑期班早鸟价最后3天，发圈促单',
    icon: '💬',
  },
]

export default function GeneratorGrid() {
  const [activeTab, setActiveTab] = useState(0)
  const activeConfig = GENERATORS[activeTab]

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Tab 切换栏 */}
      <div className="flex gap-1.5 p-1.5 bg-gray-100 rounded-2xl mb-6">
        {GENERATORS.map((g, i) => (
          <button
            key={g.type}
            onClick={() => setActiveTab(i)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
              i === activeTab
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
            }`}
          >
            <span className="text-base">{g.icon}</span>
            <span className="hidden sm:inline">{g.title.replace('助手', '')}</span>
            {i === 0 && i === activeTab && (
              <span className="text-[10px] font-medium bg-primary-500 text-white px-1.5 py-0.5 rounded-full">核心</span>
            )}
          </button>
        ))}
      </div>

      {/* 当前激活的模块 */}
      <div className="animate-fade-in" key={activeConfig.type}>
        <GeneratorCard config={activeConfig} featured={activeTab === 0} expanded hideTemplates />
      </div>

      <p className="text-center text-xs text-gray-350 mt-4">
        输入你的个性化场景，AI 深度定制方案 · 所有功能免费使用，无需登录
      </p>
    </section>
  )
}
