import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  // Define route groups
  const authRoutes = ['/auth/login', '/auth/register', '/auth/reset-password']
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/projects',
    '/tasks',
    '/teams',
    '/messages'
  ]
  
  const apiRoutes = ['/api']
  // const publicRoutes = ['/', '/about', '/contact', '/features']
  
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isApiRoute = apiRoutes.some(route => pathname.startsWith(route))
  // const isPublicRoute = publicRoutes.includes(pathname)

  // Skip middleware for API routes
  if (isApiRoute) {
    return response
  }

  // Handle root path
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(isAuthenticated ? '/dashboard' : '/auth/login', request.url)
    )
  }

  // Redirect authenticated users from auth routes
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect dashboard routes
  if (!isAuthenticated && (isProtectedRoute || pathname.startsWith('/dashboard'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)']
}