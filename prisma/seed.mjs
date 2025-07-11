import { PrismaClient } from '../src/generated/prisma/index.js'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'user@test.com',
      password: await hash('password123', 10),
      firstName: 'User',
      lastName: 'Test',
      accounts: {
        create: {
          balance: 1000,
        }
      }
    },
    include: {
      accounts: true,
    }
  })

  console.log('Usuário criado com sucesso:', user)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Erro no seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })