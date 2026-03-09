// src/app/(admin)/admin/dashboard/page.tsx
// Pure SERVER component. SchoolSwitcher is a client island dropped in.

import { auth } from "@/auth";               
import Link from "next/link";

import Student from "@/models/Student";
import Result from "@/models/Result";
import SchoolSwitcher from "@/components/admin/SchoolSwitcher";
import { connectToDatabase } from "@/lib/db";

export default async function DashboardPage() {
  const session  = await auth();
  const user     = session!.user as any;
  const schoolId = user.schoolId as string | null;
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  await connectToDatabase();

  const filter = schoolId ? { schoolId } : {};

  const [totalStudents, publishedResults, draftResults, totalResults] =
    await Promise.all([
      Student.countDocuments(filter),
      Result.countDocuments({ ...filter, status: "PUBLISHED" }),
      Result.countDocuments({ ...filter, status: "DRAFT" }),
      Result.countDocuments(filter),
    ]);

  const greeting = getGreeting();
  const firstName = (user.name ?? user.email ?? "Admin").split(" ")[0];

  return (
    <div className="admin-page">

      {/* ── TOP BAR ── */}
      <div className="dash-topbar">
        <div className="dash-greeting">
          <p className="dash-greeting-time">{greeting}</p>
          <h1 className="dash-greeting-name">
            {firstName}
            {isSuperAdmin && <span className="role-chip super">Super Admin</span>}
          </h1>
        </div>

        <div className="dash-topbar-right">
          {isSuperAdmin && <SchoolSwitcher />}
          <Link href="/admin/results/new" className="btn btn-primary">
            + New Result
          </Link>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="stat-cards">
        <StatCard
          href="/admin/students"
          icon="👤"
          value={totalStudents}
          label="Total Students"
          accent="pink"
        />
        <StatCard
          href="/admin/results?status=PUBLISHED"
          icon="✅"
          value={publishedResults}
          label="Published Results"
          accent="green"
        />
        <StatCard
          href="/admin/results?status=DRAFT"
          icon="📝"
          value={draftResults}
          label="Drafts Pending"
          accent="amber"
        />
        <StatCard
          href="/admin/results"
          icon="📋"
          value={totalResults}
          label="Total Results"
          accent="blue"
        />
      </div>

      {/* ── QUICK ACTIONS ── */}
      <section className="dash-section">
        <h2 className="dash-section-title">Quick Actions</h2>
        <div className="quick-actions">
          <QuickCard href="/admin/students/new"         icon="👤" label="Add Student" />
          <QuickCard href="/admin/results/new"          icon="📋" label="Create Result" />
          <QuickCard href="/admin/results?status=DRAFT" icon="📝" label="View Drafts" />
          <QuickCard href="/" target="_blank"           icon="🌐" label="Public Portal" />
        </div>
      </section>

    </div>
  );
}

// ── Presentational sub-components (still server, no state) ────────────────

function StatCard({
  href, icon, value, label, accent,
}: {
  href: string;
  icon: string;
  value: number;
  label: string;
  accent: "pink" | "blue" | "green" | "amber";
}) {
  return (
    <Link href={href} className={`stat-card stat-${accent}`}>
      <span className="stat-icon">{icon}</span>
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
      <span className="stat-arrow">→</span>
    </Link>
  );
}

function QuickCard({
  href, icon, label, target,
}: {
  href: string;
  icon: string;
  label: string;
  target?: string;
}) {
  return (
    <Link href={href} target={target} className="quick-card">
      <span className="quick-icon">{icon}</span>
      <p className="quick-label">{label}</p>
    </Link>
  );
}

// ── Util ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}