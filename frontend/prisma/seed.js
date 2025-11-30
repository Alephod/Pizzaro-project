import bcrypt from 'bcrypt'

import { PrismaClient } from '../src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('supersecret', 10)

  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hash,
    },
  })

  console.log('Admin user created / updated')  
}

main()
  .catch(e => {
    console.error('Seed error:', e)  
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
