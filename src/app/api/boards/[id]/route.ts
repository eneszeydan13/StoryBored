import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, username: true, email: true, color: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, email: true, color: true, avatar: true },
            },
          },
        },
        tickets: {
          include: {
            assignee: {
              select: { id: true, username: true, email: true, color: true, avatar: true },
            },
            creator: {
              select: { id: true, username: true, email: true, color: true, avatar: true },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    // Check if user is member or owner. If not yet a member, automatically add them if they have access or return board
    const isMember = board.members.some((m) => m.userId === user.id) || board.ownerId === user.id;

    if (!isMember) {
      // Auto-join board if visiting directly
      await prisma.boardMember.create({
        data: {
          boardId: board.id,
          userId: user.id,
          role: 'MEMBER',
        },
      });

      // Refetch with new member
      const updatedBoard = await prisma.board.findUnique({
        where: { id },
        include: {
          owner: {
            select: { id: true, username: true, email: true, color: true, avatar: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, username: true, email: true, color: true, avatar: true },
              },
            },
          },
          tickets: {
            include: {
              assignee: {
                select: { id: true, username: true, email: true, color: true, avatar: true },
              },
              creator: {
                select: { id: true, username: true, email: true, color: true, avatar: true },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      });

      return NextResponse.json({ board: updatedBoard });
    }

    return NextResponse.json({ board });
  } catch (error) {
    console.error('Fetch board error:', error);
    return NextResponse.json({ error: 'Failed to fetch board' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { title, description } = await req.json();

    const board = await prisma.board.findUnique({ where: { id } });
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const updated = await prisma.board.update({
      where: { id },
      data: {
        ...(title ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
      },
    });

    return NextResponse.json({ success: true, board: updated });
  } catch (error) {
    console.error('Update board error:', error);
    return NextResponse.json({ error: 'Failed to update board' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const board = await prisma.board.findUnique({ where: { id } });
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    if (board.ownerId !== user.id) {
      return NextResponse.json({ error: 'Only the board owner can delete this project' }, { status: 403 });
    }

    await prisma.board.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete board error:', error);
    return NextResponse.json({ error: 'Failed to delete board' }, { status: 500 });
  }
}
