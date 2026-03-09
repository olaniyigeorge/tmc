"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface Props {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Thin "use client" wrapper so the root layout (server component)
 * can provide the NextAuth SessionProvider without being forced to
 * become a client component itself.
 */
export default function NextAuthSessionProvider({ children, session }: Props) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}