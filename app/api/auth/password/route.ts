import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    const expected =
      process.env.DEMO_PASSWORD ||
      process.env.NEXT_PUBLIC_DEMO_PASSWORD ||
      'Atlas2016!';

    if (
      typeof password === 'string' &&
      password.trim().toLowerCase() === expected.toLowerCase()
    ) {
      const res = NextResponse.json({ success: true });
      res.cookies.set('atlas_demo_password', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 h
        path: '/',
      });
      return res;
    }

    return NextResponse.json(
      { success: false, error: 'Incorrect password' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
