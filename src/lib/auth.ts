import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma/prisma";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "auth_user",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          permissao: user.permissao,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },

  jwt: {
    maxAge: 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.permissao = user.permissao
        token.accessTokenExpires = Date.now() + 60 * 60 * 1000
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      return { ...token, exp: true }
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.permissao = token.permissao
      }

      session.expiresAt = token.accessTokenExpires as number
      session.expired = token.exp === true

      return session
    },
  },

  pages: {
    signIn: "/login",
  },
};
