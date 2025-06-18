import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const pathname = request.nextUrl.pathname

  // Auth pages (login/register) - redirect if already authenticated
  const isAuthPage =
    pathname.startsWith('/login') || pathname.startsWith('/register')

  // Protected routes under /auth/* path
  const isProtectedRoute = pathname.startsWith('/auth/')

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from login/register pages only
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/auth/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
