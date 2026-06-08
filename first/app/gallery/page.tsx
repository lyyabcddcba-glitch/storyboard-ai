'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface GalleryItem {
  id: string
  url: string
  prompt: string
  createdAt: string
}

const STORAGE_KEY = 'storyboard-gallery'

function loadGallery(): GalleryItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function clearGallery(): GalleryItem[] {
  localStorage.setItem(STORAGE_KEY, '[]')
  return []
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => { setItems(loadGallery()) }, [])

  const handleClear = () => {
    if (confirm('确定清空所有作品？')) setItems(clearGallery())
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">🖼️ AI 生图作品集</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            创作中心生成的图片自动同步到这里 ·
            <Link href="/storyboard" className="text-indigo-400 ml-1 hover:underline">去生成新图 →</Link>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleClear}
            className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20">
            清空全部
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600 space-y-3">
          <div className="text-6xl opacity-20">🎨</div>
          <p className="text-sm">还没有作品</p>
          <p className="text-xs">去 <Link href="/storyboard" className="text-indigo-400 underline">创作中心</Link> 用 AI 生成分镜画面，图片会自动同步到这里。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {items.map(item => (
            <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden group">
              <img
                src={item.url}
                alt={item.prompt}
                className="w-full aspect-video object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                onClick={() => setPreview(item.url)}
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <div className="p-3">
                <p className="text-xs text-zinc-400 line-clamp-2">{item.prompt}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-zinc-600">{item.createdAt}</span>
                  <button onClick={() => navigator.clipboard.writeText(item.url)}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300">📋 复制URL</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <button onClick={() => setPreview(null)} className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl">✕</button>
          <img src={preview} alt="全屏预览" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
