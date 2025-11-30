'use client'

import React from 'react'

import { SessionProvider } from 'next-auth/react'

import type { Session } from 'next-auth'

export default function ClientProvider({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  return (
    <SessionProvider basePath="/api/auth-client" session={session}>
      {children}
    </SessionProvider>
  )
}
