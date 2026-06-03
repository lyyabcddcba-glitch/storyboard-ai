const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@storyboard.ai'
  const adminPassword = 'admin123456'

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existing) {
    console.log('管理员已存在:', existing.email, '| 状态:', existing.status)
    return
  }

  const hashed = await bcrypt.hash(adminPassword, 12)
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashed,
      name: 'Admin',
      status: 'ADMIN',
    },
  })
  console.log('管理员创建成功:', admin.email)
  console.log('邮箱:', adminEmail)
  console.log('密码:', adminPassword)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
