// src/app/(admin)/admin/layout.tsx
// SERVER component — guards the entire /admin/* subtree.
// We call auth() here instead of useSession so this file
// never needs "use client" and there is no SessionProvider error.

import { redirect } from "next/navigation";
import { auth } from "@/auth";                         // ← Auth.js v5
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Not authenticated → send to login
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}