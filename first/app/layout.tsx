import type { Metadata } from 'next'
import './globals.css'
import Providers from './Providers'
import MainLayout from './MainLayout'

export const metadata: Metadata = {
  title: 'AI 分镜脚本 & 迎新实战全能枢纽',
  description: 'AI驱动的校园迎新全链路平台：从短视频分镜脚本、销售话术到选号预约，一站式解决创作与转化。',
  keywords: ['分镜脚本', 'AI分镜', '迎新', '校园卡', '销售话术', '选号预约'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased">
        <Providers><MainLayout>{children}</MainLayout></Providers>
      </body>
    </html>
  )
}
