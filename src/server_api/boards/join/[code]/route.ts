import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code } = await params;
  const cleanCode = code.trim().toUpperCase();

  try {
    const board = await prisma.board.findFirst({
      where: {
        OR: [{ inviteCode: cleanCode }, { id: code }],
      },
    });

    if (!board) {
      return NextResponse.json({ error: 'Project not found with this invite code' }, { status: 404 });
    }

    // Check if already a member
    const existingMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: board.id,
          userId: user.id,
        },
      },
    });

    if (!existingMember) {
      await prisma.boardMember.create({
        data: {
          boardId: board.id,
          userId: user.id,
          role: 'MEMBER',
        },
      });
    }

    return NextResponse.json({ success: true, boardId: board.id });
  } catch (error) {
    console.error('Join board error:', error);
    return NextResponse.json({ error: 'Failed to join project' }, { status: 500 });
  }
}
