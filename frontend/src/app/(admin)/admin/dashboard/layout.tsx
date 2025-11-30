import React from 'react'

import { getServerSession } from 'next-auth/next'

import { adminAuthOptions } from '@/lib/auth/admin'

import DashboardAside from './DashboardAside'
import style from './layout.module.scss'

export default async function AdminLayout({
  children,
}: Readonly<{
    children: React.ReactNode;
}>) {
  const session = await getServerSession(adminAuthOptions)

  const username: string | undefined = session?.user?.username ?? undefined

  return (
    <div className={style.wrapper}>
      <DashboardAside username={username} />
      {children}
    </div>
  )
}
