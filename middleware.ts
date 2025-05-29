import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/signin'

  // Get the token from the cookies
  const token = request.cookies.get('auth-token')?.value

  // Redirect logic
  if (isPublicPath && token) {
    // If user is on public path and has token, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard/memberships', request.url))
  }

  if (!isPublicPath && !token) {
    // If user is on protected path and has no token, redirect to signin
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/signin'
  ]
} 