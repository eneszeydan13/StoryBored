import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get boards where user is owner or member
    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      include: {
        _count: {
          select: {
            tickets: true,
            members: true,
          },
        },
        members: {
          where: { userId: user.id },
          select: { role: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formatted = boards.map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      inviteCode: b.inviteCode,
      ownerId: b.ownerId,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      _count: b._count,
      role: b.ownerId === user.id ? 'OWNER' : b.members[0]?.role || 'MEMBER',
    }));

    return NextResponse.json({ boards: formatted });
  } catch (error) {
    console.error('List boards error:', error);
    return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description } = await req.json();
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Project title is required' }, { status: 400 });
    }

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const board = await prisma.board.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        inviteCode,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
      include: {
        owner: {
          select: { id: true, username: true, email: true, color: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ success: true, board }, { status: 201 });
  } catch (error) {
    console.error('Create board error:', error);
    return NextResponse.json({ error: 'Failed to create board' }, { status: 500 });
  }
}
