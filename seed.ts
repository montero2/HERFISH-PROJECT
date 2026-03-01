import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Default Password for initial setup
  const password = await bcrypt.hash('mosesta2024', 10)

  // 1. Create Administrator (ERP Operator)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mosestalimited.co.ke' },
    update: {},
    create: {
      email: 'admin@mosestalimited.co.ke',
      name: 'System Administrator',
      password,
      role: 'ADMIN',
      phone: process.env.OPERATOR_PHONE || '+254700000000'
    },
  })

  // 2. Create Distributor
  const distributor = await prisma.user.upsert({
    where: { email: 'distributor@mosestalimited.co.ke' },
    update: {},
    create: {
      email: 'distributor@mosestalimited.co.ke',
      name: 'Chief Distributor',
      password,
      role: 'DISTRIBUTOR',
      phone: process.env.DISTRIBUTOR_PHONE || '+254700000001'
    },
  })

  // 3. Create Sample Products
  await prisma.product.createMany({
    data: [
      { name: 'Fresh Tilapia', price: 350.00, stock: 1000, description: 'Freshly caught Lake Victoria Tilapia' },
      { name: 'Nile Perch Fillet', price: 600.00, stock: 500, description: 'Premium quality Nile Perch' },
      { name: 'Omena (Dried)', price: 150.00, stock: 2000, description: 'Sun-dried silver cyprinid' },
    ],
    skipDuplicates: true,
  })

  console.log({ admin, distributor })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })