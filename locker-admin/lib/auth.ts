// Конфигурация NextAuth с Google OAuth и вайтлистом email-адресов

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Список разрешённых email-адресов администраторов
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // Проверяем, что пользователь есть в вайтлисте при входе
    async signIn({ user }) {
      if (!user.email) return false;
      return ALLOWED_EMAILS.includes(user.email.toLowerCase());
    },
    // Добавляем email в JWT токен для последующих проверок
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/access-denied",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
};
