"use client";

// SessionProvider нужен клиентской части для доступа к сессии NextAuth
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
