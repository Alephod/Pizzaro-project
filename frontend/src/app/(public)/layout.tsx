import { ModalProvider } from '@my-app/ui-library'
import { Open_Sans } from 'next/font/google'
import { getServerSession } from 'next-auth'

import { Header } from '@/components/header/Header'
import { clientAuthOptions } from '@/lib/auth/client'
import { getMenuSections } from '@/lib/fetchMenu'
import { CartProvider } from '@/providers/CartProvider'
import ClientProvider from '@/providers/ClientProvider'

import type { Metadata } from 'next'

import '@/app/globals.scss'

const openSans = Open_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-open-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Pizzaro',
  description: 'Pizzaro App',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sections = await getMenuSections()
  const session = await getServerSession(clientAuthOptions)

  return (
    <html lang="ru" className={openSans.variable}>
      <body>
        <ClientProvider>
          <CartProvider>
            <ModalProvider>
              <Header sections={sections} session={session} />
              {children}
            </ModalProvider>
          </CartProvider>
        </ClientProvider>
      </body>
    </html>
  )
}
