import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('dev_password_123', 10);
  
  const devUser = await prisma.user.upsert({
    where: { username: 'developer_admin' },
    update: {},
    create: {
      name: 'Developer', // <---------- IT GOES RIGHT HERE
      username: 'developer_admin',
      email: 'dev@collytex.com',
      passwordHash: hashedPassword,
      role: 'DEVELOPER', 
    },
  });
  console.log('Developer account created:', devUser.username);
}

main().catch(console.error).finally(() => prisma.$disconnect());