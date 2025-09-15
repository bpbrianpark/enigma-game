import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from "./prisma";
import { compare } from "bcrypt";
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 1 * 24 * 60 * 60
    },
    pages: {
        signIn: '/sign-in',
    },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
            return null;
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: credentials.email }
        });

        if(!existingUser) {
            return null;
        }

        const passwordMatch = await compare(credentials.password, existingUser.password);

        if (!passwordMatch) return null;

        return {
            id: `${existingUser.id}`,
            username: existingUser.username,
            email: existingUser.email
        }
      },
    }),
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
        if(user) {
            return {
                ...token,
                username: user.username,
                email: user.email
            }
        }
        return token
    },
    async session({ session, token }) {
        return {
            ...session,
            user: {
                ...session.user,
                username: token.username,
                email: token.email
            }
        }
    }
}
  }
