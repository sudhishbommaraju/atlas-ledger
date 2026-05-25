import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    const cookie = request.cookies.get('atlas_demo_password');
    if (!cookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/password';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
