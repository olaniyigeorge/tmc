"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminPageLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    if (!session && !pathname.endsWith("/login")) {
      router.push("/admin/login");
    }
  }, [status, session, pathname, router]);

  if (pathname.endsWith("/login")) {
    return <>{children}</>;
  }
  return <AdminLayout>{children}</AdminLayout>;
}
