import CredentialsProvider from 'next-auth/providers/credentials'

import { prisma } from '@/lib/prisma'

import type { NextAuthOptions, Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

interface AuthorizedUser {
  id: string;
  email: string;
  name: string;
}

interface ExtendedJwt extends JWT {
  id?: string;
  email?: string;
  name?: string;
}

export const clientAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'otp',
      name: 'Email OTP',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) return null

        const otpRecord = await prisma.otpCode.findUnique({
          where: { email: credentials.email },
        })

        if (!otpRecord) return null

        const currentTime = new Date()

        if (otpRecord.expiresAt < currentTime) return null
        if (otpRecord.code !== credentials.code) return null

        await prisma.otpCode.delete({
          where: { email: credentials.email },
        })

        let existingUser = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: { email: credentials.email, data: { name: '' } },
          })
        }

        let userName = ''

        if (existingUser.data && typeof existingUser.data === 'object' && !Array.isArray(existingUser.data)) {
          const profileData = existingUser.data

          if (typeof profileData.name === 'string') userName = profileData.name
        }

        return { id: existingUser.id.toString(), email: existingUser.email, name: userName } as AuthorizedUser
      },
    }),
  ],

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 дней
  jwt: { maxAge: 30 * 24 * 60 * 60 },

  cookies: {
    sessionToken: {
      name: 'next-auth.client.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const extendedToken = token as ExtendedJwt

      if (user) {
        const authorizedUser = user as AuthorizedUser

        extendedToken.id = authorizedUser.id
        extendedToken.email = authorizedUser.email
        extendedToken.name = authorizedUser.name
      }

      // Поддержка обновления сессии 
      if (trigger === 'update' && session?.name) {
        extendedToken.name = session.name
      }

      return extendedToken
    },

    async session({ session, token }) {
      const extendedToken = token as ExtendedJwt

      const userEmail =
        typeof extendedToken.email === 'string'
          ? extendedToken.email
          : typeof session.user?.email === 'string'
            ? session.user.email
            : undefined

      const userName =
        typeof extendedToken.name === 'string'
          ? extendedToken.name
          : typeof session.user?.name === 'string'
            ? session.user.name
            : ''

      const updatedUser: Session['user'] = {
        ...session.user,
        id: extendedToken.id,
        email: userEmail,
        name: userName,
      }

      session.user = updatedUser

      return session
    },
  },
}