import type { Metadata } from 'next'
import './globals.css'
import Providers from './Providers'

export const metadata: Metadata = {
  title: 'AI 分镜脚本生成系统 — 13维工业级影视分镜',
  description: '输入拍摄主题，AI 深度推理生成包含机位、景别、运镜、美术视觉、音效等13个维度的专业分镜脚本，一键导出 Excel。',
  keywords: ['分镜脚本', 'AI分镜', '影视分镜', '故事板', '电影分镜', '导演工具'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
