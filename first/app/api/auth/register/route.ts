import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: '该邮箱已注册' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name || email.split('@')[0],
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true, message: '注册成功，请等待管理员审核' })
  } catch (e) {
    console.error('Register error:', e)
    return NextResponse.json({ error: '注册失败' }, { status: 500 })
  }
}
