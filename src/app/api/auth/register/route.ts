import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';
import { USER_COLORS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, color } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email or username already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    
    // Pick random user color if not provided
    const userColor = color || USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];

    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        color: userColor,
      },
      select: {
        id: true,
        username: true,
        email: true,
        color: true,
        avatar: true,
        createdAt: true,
      },
    });

    const token = await createToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const response = NextResponse.json({ success: true, user }, { status: 201 });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account.' },
      { status: 500 }
    );
  }
}
