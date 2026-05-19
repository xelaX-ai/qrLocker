import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const email = user.email.toLowerCase().trim();

      console.log("[auth] signIn attempt:", email);

      // Перевіряємо ALLOWED_EMAILS з env
      const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      console.log("[auth] ALLOWED_EMAILS:", allowedEmails);

      if (allowedEmails.includes(email)) {
        console.log("[auth] allowed via env");
        return true;
      }

      // Перевіряємо в таблиці admins
      const { data, error } = await supabase
        .from("admins")
        .select("email")
        .eq("email", email)
        .single();

      console.log("[auth] supabase result:", { data, error: error?.message });

      if (data) {
        console.log("[auth] allowed via supabase");
        return true;
      }

      console.log("[auth] denied");
      return false;
    },
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
    maxAge: 30 * 24 * 60 * 60,
  },
};
