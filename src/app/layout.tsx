import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '智能时间管家',
  description: '基于Next.js + Tailwind CSS的时间管理工具',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
