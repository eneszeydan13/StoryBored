import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial demo data...');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('dev1234', salt);

  // 1. Primary user
  const userEnes = await prisma.user.upsert({
    where: { email: 'enes@storyboard.dev' },
    update: {},
    create: {
      username: 'enes',
      email: 'enes@storyboard.dev',
      passwordHash,
      color: '#3B82F6', // Blue
    },
  });

  // 2. Teammate 1
  const userAlex = await prisma.user.upsert({
    where: { email: 'alex@storyboard.dev' },
    update: {},
    create: {
      username: 'alex_dev',
      email: 'alex@storyboard.dev',
      passwordHash,
      color: '#8B5CF6', // Purple
    },
  });

  // 3. Teammate 2
  const userSara = await prisma.user.upsert({
    where: { email: 'sara@storyboard.dev' },
    update: {},
    create: {
      username: 'sara_ui',
      email: 'sara@storyboard.dev',
      passwordHash,
      color: '#10B981', // Emerald
    },
  });

  // Create demo board
  const board = await prisma.board.upsert({
    where: { inviteCode: 'SPRINT1' },
    update: {},
    create: {
      title: 'Dev Sprint - Mobile & Web App',
      description: 'Core sprint backlog, API integration, auth flow and mobile responsive storyboard.',
      inviteCode: 'SPRINT1',
      ownerId: userEnes.id,
      members: {
        create: [
          { userId: userEnes.id, role: 'OWNER' },
          { userId: userAlex.id, role: 'MEMBER' },
          { userId: userSara.id, role: 'MEMBER' },
        ],
      },
      tickets: {
        create: [
          {
            title: 'Design sticky note color system & masking tape',
            description: 'Use pastel yellow, cyan, pink, green, orange, and purple with tactile shadows and tape overlay.',
            state: 'STORY',
            priority: 'HIGH',
            color: 'yellow',
            tags: 'UI/UX,Design',
            storyPoints: 3,
            order: 0,
            creatorId: userEnes.id,
            assigneeId: userSara.id,
          },
          {
            title: 'Implement Dark Mode & Light Mode themes',
            description: 'Ensure smooth toggle and high contrast on wooden desk backdrop and slate dark mode.',
            state: 'TODO',
            priority: 'MEDIUM',
            color: 'pink',
            tags: 'Theme,Frontend',
            storyPoints: 2,
            order: 0,
            creatorId: userEnes.id,
            assigneeId: userSara.id,
          },
          {
            title: 'Turkish & English bilingual i18n support',
            description: 'Full localized dictionary with instant switcher for all buttons, states, and modals.',
            state: 'TODO',
            priority: 'MEDIUM',
            color: 'cyan',
            tags: 'i18n,Localization',
            storyPoints: 2,
            order: 1,
            creatorId: userEnes.id,
            assigneeId: userAlex.id,
          },
          {
            title: 'Mobile touch drag-and-drop & column swipe tabs',
            description: 'Support seamless finger dragging and quick column tabs on 375px mobile screens.',
            state: 'IN_PROGRESS',
            priority: 'URGENT',
            color: 'orange',
            tags: 'Mobile,Touch',
            storyPoints: 5,
            order: 0,
            creatorId: userEnes.id,
            assigneeId: userAlex.id,
          },
          {
            title: 'QR Code mobile pairing on PC screen',
            description: 'Generate on-screen QR code so developers can point mobile camera and open the board directly.',
            state: 'IN_PROGRESS',
            priority: 'HIGH',
            color: 'purple',
            tags: 'Mobile,QR',
            storyPoints: 3,
            order: 1,
            creatorId: userEnes.id,
            assigneeId: userEnes.id,
          },
          {
            title: 'Database schema & Cross-device sync',
            description: 'SQLite with Prisma ORM and live polling to sync tickets between PC and phone without reload.',
            state: 'COMPLETED',
            priority: 'HIGH',
            color: 'green',
            tags: 'Backend,Database',
            storyPoints: 5,
            order: 0,
            creatorId: userEnes.id,
            assigneeId: userEnes.id,
          },
        ],
      },
    },
  });

  console.log(`Successfully seeded board "${board.title}" with invite code ${board.inviteCode}!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
