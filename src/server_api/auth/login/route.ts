import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/Username and password are required.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email/username or password.' },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email/username or password.' },
        { status: 401 }
      );
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const userSummary = {
      id: user.id,
      username: user.username,
      email: user.email,
      color: user.color,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({ success: true, user: userSummary }, { status: 200 });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to sign in.' },
      { status: 500 }
    );
  }
}
