'use client'

import React from 'react'

import { SessionProvider } from 'next-auth/react'

import type { Session } from 'next-auth'

export default function AdminProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider basePath="/api/auth-admin" session={session}>
      {children}
    </SessionProvider>
  )
}
