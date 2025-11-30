import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

import type { NextRequest } from 'next/server'

function normalize(path: string) {
  if (!path) return '/'
  const n = path.replace(/\/+$/, '')

  return n === '' ? '/' : n
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const rawPath = url.pathname
  const pathname = normalize(rawPath)

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.admin.session-token',
  })

  // Запретить любые вложенные /admin/login/*
  if (pathname.startsWith('/admin/login') && pathname !== '/admin/login') {
    const redirectUrl = new URL('/admin/login', url.origin)

    redirectUrl.search = url.search

    return NextResponse.redirect(redirectUrl)
  }

  // Если пользователь на странице логина
  if (pathname === '/admin/login') {
    if (token) {
      const redirectUrl = new URL('/admin/dashboard', url.origin)

      return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.next()
  }

  // Для остальных /admin/* страниц
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/admin/login', url.origin)

      loginUrl.searchParams.set('from', url.pathname + url.search)

      return NextResponse.redirect(loginUrl)
    }

    if (pathname === '/admin') {
      const redirectUrl = new URL('/admin/dashboard', url.origin)

      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
