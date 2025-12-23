import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Verificar acceso al panel de administración
    if (path.startsWith('/admin')) {
      if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Rutas públicas
        const publicRoutes = [
          '/',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/verify-request',
          '/blog',
          '/contact',
          '/pricing',
          '/features',
          '/terms',
          '/privacy',
          '/cookies',
        ]

        // API routes públicas
        if (path.startsWith('/api/auth')) return true
        if (path.startsWith('/api/stripe/webhook')) return true

        // Rutas públicas
        const isPublicRoute = publicRoutes.some(
          (route) => path === route || path.startsWith(route + '/')
        )
        if (isPublicRoute) return true

        // Rutas protegidas requieren autenticación
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

