import { ModalProvider } from '@my-app/ui-library'
import { Open_Sans } from 'next/font/google'
import { getServerSession } from 'next-auth'

import { adminAuthOptions } from '@/lib/auth/admin'
import AdminProvider from '@/providers/AdminProvider'

import type { Metadata } from 'next'

import '@/app/globals.scss'

const openSans = Open_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-open-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Pizzaro Admin',
  description: 'Pizzaro App',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(adminAuthOptions)

  return (
    <html lang="ru" className={openSans.variable}>
      <body>
        <AdminProvider session={session}>
          <ModalProvider>
            {children}
          </ModalProvider>
        </AdminProvider>
      </body>
    </html>
  )
}
