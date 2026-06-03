'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') { router.push('/login'); return }
    // 延迟检查：等 session 完全加载
    const userStatus = (session?.user as any)?.status
    if (status === 'authenticated' && userStatus && userStatus !== 'ADMIN') {
      router.push('/')
    }
  }, [session, status, router])

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.users) setUsers(data.users)
      else setMessage(data.error || '加载失败')
    } catch (e) {
      setMessage('网络错误')
    }
  }

  useEffect(() => {
    const userStatus = (session?.user as any)?.status
    if (status === 'authenticated' && userStatus === 'ADMIN') loadUsers()
  }, [session, status])

  const updateStatus = async (userId: string, newStatus: string) => {
    setLoading(true)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status: newStatus }),
    })
    const data = await res.json()
    setMessage(data.message || data.error || '')
    if (res.ok) loadUsers()
    setLoading(false)
  }

  if (status === 'loading') return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">加载中...</div>

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">👑 用户管理</h1>
            <p className="text-sm text-zinc-500 mt-1">审批新注册用户</p>
          </div>
          <button onClick={() => router.push('/')} className="text-sm text-zinc-400 hover:text-white">← 回首页</button>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-sm text-indigo-400">{message}</div>
        )}

        <div className="space-y-2">
          {users.map((u: any) => (
            <div key={u.id} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div>
                <div className="text-sm text-zinc-200 font-medium">{u.name || u.email}</div>
                <div className="text-xs text-zinc-500">{u.email}</div>
                <div className="text-[10px] text-zinc-600 mt-0.5">
                  注册于 {new Date(u.createdAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  u.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                  u.status === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                  u.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                  'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>{u.status}</span>
                {u.status !== 'ADMIN' && (
                  <select
                    value={u.status}
                    onChange={e => updateStatus(u.id, e.target.value)}
                    disabled={loading}
                    className="text-xs bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-300 outline-none"
                  >
                    <option value="PENDING">待审核</option>
                    <option value="APPROVED">通过</option>
                    <option value="REJECTED">拒绝</option>
                  </select>
                )}
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-center text-zinc-600 py-8">暂无用户</p>
          )}
        </div>
      </div>
    </div>
  )
}
