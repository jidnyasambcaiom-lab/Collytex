import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = process.env.DEVELOPER_SEED_PASSWORD;
  
  if (!password) {
    throw new Error('DEVELOPER_SEED_PASSWORD must be set in your .env file');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const devUser = await prisma.user.upsert({
    where: { username: 'jidshivpratu_1234' },
    update: { 
        role: 'DEVELOPER' 
    },
    create: {
      name: 'Developer',
      username: 'jidshivpratu_1234',
      email: 'jidshivpratu_1234@collytex.local',
      passwordHash: passwordHash,
      role: 'DEVELOPER',
    },
  });
  
  console.log('Secure developer account created:', devUser.username);
}

main().catch(console.error).finally(() => prisma.$disconnect());