import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: 获取用户列表（仅 ADMIN）
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.sub) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const admin = await prisma.user.findUnique({ where: { id: token.sub } })
  console.log('[Admin API] DB status:', admin?.status)
  if (admin?.status !== 'ADMIN') return NextResponse.json({ error: '无权限，当前状态: ' + (admin?.status || 'unknown') }, { status: 403 })

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ users })
}

// PATCH: 修改用户状态（仅 ADMIN）
export async function PATCH(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.sub) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const admin = await prisma.user.findUnique({ where: { id: token.sub } })
  if (admin?.status !== 'ADMIN') return NextResponse.json({ error: '无权限' }, { status: 403 })

  const { userId, status } = await request.json()
  if (!userId || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
    return NextResponse.json({ error: '参数错误' }, { status: 400 })
  }

  // 不允许修改自己的状态
  if (userId === token.sub) {
    return NextResponse.json({ error: '不能修改自己的状态' }, { status: 400 })
  }

  await prisma.user.update({ where: { id: userId }, data: { status } })
  return NextResponse.json({ message: `用户状态已更新为 ${status}` })
}
