import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const session = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  const publicPaths = ['/auth/login', '/auth/register'];
  
  if (!publicPaths.includes(path)) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  
  if (publicPaths.includes(path) && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
