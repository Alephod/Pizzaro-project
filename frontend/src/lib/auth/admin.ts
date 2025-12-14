import bcrypt from 'bcrypt'
import CredentialsProvider from 'next-auth/providers/credentials'

import { prisma } from '@/lib/prisma'

import type { NextAuthOptions, Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

type UserFromAuthorize = {
  id: string;
  username: string;
};

type AdminJWT = JWT & {
  id?: string;
  username?: string;
};

export const adminAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const user = await prisma.adminUser.findUnique({
          where: { username: credentials.username },
        })

        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!valid) return null

        return { id: user.id.toString(), username: user.username } as UserFromAuthorize
      },
    }),
  ],

  session: { strategy: 'jwt', maxAge: 30 * 60 },
  jwt: { maxAge: 30 * 60 },

  pages: { signIn: '/admin/login' },

  cookies: {
    sessionToken: {
      name: 'next-auth.admin.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      const t = token as AdminJWT

      if (user) {
        const u = user as UserFromAuthorize

        t.id = u.id
        t.username = u.username
      }

      return t
    },

    async session({ session, token }) {
      const t = token as AdminJWT

      const normalizedUsername =
        typeof t.username === 'string'
          ? t.username
          : typeof session.user?.name === 'string'
            ? session.user.name
            : undefined

      const newUser: Session['user'] = {
        ...session.user,
        id: t.id,
        username: normalizedUsername,
      }

      session.user = newUser

      return session
    },
  },
}
