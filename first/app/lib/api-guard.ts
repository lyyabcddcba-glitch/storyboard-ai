import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { getUserStatus } from './auth'

// 保护 AI 生成 API：仅 APPROVED 或 ADMIN 用户可调用
export async function guardAIRequest(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.sub) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }
  const status = await getUserStatus(token.sub)
  if (status !== 'APPROVED' && status !== 'ADMIN') {
    return NextResponse.json({
      error: status === 'PENDING' ? '账号审核中，请等待管理员审批' : '账号已被禁用',
    }, { status: 403 })
  }
  return null // 通过
}
