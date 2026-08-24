import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    const body = await req.json();
    const {
      title,
      description,
      state,
      priority,
      color,
      tags,
      storyPoints,
      assigneeId,
      order,
    } = body;

    const existing = await prisma.ticket.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(state !== undefined ? { state } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(color !== undefined ? { color } : {}),
        ...(tags !== undefined ? { tags: Array.isArray(tags) ? tags.join(',') : tags } : {}),
        ...(storyPoints !== undefined ? { storyPoints: storyPoints ? Number(storyPoints) : null } : {}),
        ...(assigneeId !== undefined ? { assigneeId: assigneeId || null } : {}),
        ...(order !== undefined ? { order: Number(order) } : {}),
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

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error('Update ticket error:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
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
    const existing = await prisma.ticket.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    await prisma.ticket.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete ticket error:', error);
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
}
