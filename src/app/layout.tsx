// src/app/layout.tsx
// Root layout — SERVER component.
// SessionProvider is injected via a thin "use client" wrapper so this
// file stays a server component and can pass the initial session down.

import type { Metadata } from "next";
import { auth } from "@/auth";                         // ← Auth.js v5
import NextAuthSessionProvider from "@/providers/NextAuthSessionProvider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Results Portal - Tinabel & Tinuola Schools",
  description: "Secure academic results portal for Tinabel Model College and Tinuola Children School.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch initial session server-side so the client never flickers
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <NextAuthSessionProvider session={session}>
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}