"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

interface Props {
  children: React.ReactNode;
  session: Session;
}

const NAV_ITEMS = [
  { label: "Dashboard",  href: "/admin/dashboard",  icon: "🏠" },
  { label: "Students",   href: "/admin/students",   icon: "👤" },
  { label: "Results",    href: "/admin/results",    icon: "📋" },
];

export default function AdminShell({ children, session }: Props) {
  const pathname  = usePathname();
  const router    = useRouter();

  const role      = (session.user as any)?.role  as string;
  const schoolId  = (session.user as any)?.schoolId as string | null;
  const name      = session.user?.name ?? session.user?.email ?? "Admin";

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/admin/login");
  }

  return (
    <div className="admin-shell">
      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-emblem-sm">
            <svg viewBox="0 0 24 24"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 12.46L4.28 11 12 6.54 19.72 11 12 15.46zM5 13.18V17l7 4 7-4v-3.82l-7 3.82-7-3.82z"/></svg>
          </div>
          <div>
            <p className="sidebar-brand">Results Portal</p>
            <p className="sidebar-subbrand">Admin Panel</p>
          </div>
        </div>

        {/* Role badge */}
        <div className="sidebar-role-badge">
          <span className={`role-pill ${role === "SUPER_ADMIN" ? "super" : "school"}`}>
            {role?.replace("_", " ")}
          </span>
          <span className="sidebar-username">{name}</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname.startsWith(item.href) ? "active" : ""}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <button className="sidebar-signout" onClick={handleSignOut}>
          <span>🚪</span> Sign Out
        </button>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}