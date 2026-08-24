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

  const { id: boardId } = await params;

  try {
    const tickets = await prisma.ticket.findMany({
      where: { boardId },
      include: {
        assignee: {
          select: { id: true, username: true, email: true, color: true, avatar: true },
        },
        creator: {
          select: { id: true, username: true, email: true, color: true, avatar: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Fetch tickets error:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: boardId } = await params;

  try {
    const {
      title,
      description,
      state = 'STORY',
      priority = 'MEDIUM',
      color = 'yellow',
      tags = '',
      storyPoints,
      assigneeId,
    } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Ticket title is required' }, { status: 400 });
    }

    // Determine order
    const maxOrder = await prisma.ticket.aggregate({
      where: { boardId, state },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const ticket = await prisma.ticket.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        state,
        priority,
        color,
        tags: Array.isArray(tags) ? tags.join(',') : tags || '',
        storyPoints: storyPoints ? Number(storyPoints) : null,
        order: nextOrder,
        boardId,
        creatorId: user.id,
        assigneeId: assigneeId || null,
      },
      include: {
        assignee: {
          select: { id: true, username: true, email: true, color: true, avatar: true },
        },
        creator: {
          select: { id: true, username: true, email: true, color: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
