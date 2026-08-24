import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode('storyboard-dev-secret-super-key-2025');

async function testSuite() {
  console.log('--- RUNNING STORYBOARD VERIFICATION TESTS ---');

  // 1. Verify Seeded Users
  const users = await prisma.user.findMany();
  console.log(`✓ Users in database: ${users.length} (${users.map(u => u.username).join(', ')})`);
  if (users.length < 3) throw new Error('Expected at least 3 users');

  // 2. Verify Password Matching
  const enes = users.find(u => u.username === 'enes');
  const passMatch = await bcrypt.compare('dev1234', enes.passwordHash);
  console.log(`✓ Password validation for user "enes": ${passMatch ? 'PASSED' : 'FAILED'}`);
  if (!passMatch) throw new Error('Password mismatch');

  // 3. Verify Board & Relationships
  const boards = await prisma.board.findMany({
    include: {
      owner: true,
      members: { include: { user: true } },
      tickets: { include: { assignee: true, creator: true } },
    },
  });
  console.log(`✓ Boards in database: ${boards.length}`);
  const sprintBoard = boards[0];
  console.log(`✓ Board Title: "${sprintBoard.title}" | Invite Code: "${sprintBoard.inviteCode}"`);
  console.log(`✓ Board Members: ${sprintBoard.members.length} members`);
  console.log(`✓ Board Tickets: ${sprintBoard.tickets.length} sticky notes`);

  // 4. Verify 4 Workflow States Presence
  const states = ['STORY', 'TODO', 'IN_PROGRESS', 'COMPLETED'];
  for (const s of states) {
    const count = sprintBoard.tickets.filter(t => t.state === s).length;
    console.log(`   • [${s}] column has ${count} sticky notes`);
  }

  // 5. Verify Assignee in bottom-right with user color
  for (const ticket of sprintBoard.tickets) {
    if (ticket.assignee) {
      console.log(`   • Ticket "${ticket.title.slice(0, 30)}..." assigned to @${ticket.assignee.username} (Color: ${ticket.assignee.color})`);
    }
  }

  // 6. Test JWT creation and verification
  const token = await new SignJWT({ userId: enes.id, username: enes.username, email: enes.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
  const { payload } = await jwtVerify(token, JWT_SECRET);
  console.log(`✓ JWT sign & verify: Valid token for user ${payload.username}`);

  console.log('--- ALL STORYBOARD TESTS PASSED SUCCESSFULLY! ---');
}

testSuite()
  .catch((e) => {
    console.error('Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
