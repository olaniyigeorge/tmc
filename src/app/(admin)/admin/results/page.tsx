// src/app/(admin)/admin/results/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Result  from "@/models/Result";
import Class   from "@/models/Class";
import School  from "@/models/School";
import Link from "next/link";

interface Props {
  searchParams: Promise<{
    schoolId?: string;
    classId?:  string;
    session?:  string;
    term?:     string;
  }>;
}

export default async function ResultsPage({ searchParams }: Props) {
  const sessionAuth = await auth();
  if (!sessionAuth?.user) redirect("/admin/login");

  // Next.js 15: await searchParams before use
  const { schoolId: spSchoolId, classId, session, term } = await searchParams;

  const user         = sessionAuth.user as any;
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  await connectToDatabase();

  const schoolFilter = isSuperAdmin
    ? (spSchoolId ? { schoolId: spSchoolId } : {})
    : { schoolId: user.schoolId };

  const query: any = { ...schoolFilter };
  if (classId) query["classSnapshot.classId"] = classId;
  if (session) query.session = session;
  if (term)    query.term    = term;

  const [results, allClasses, allSchools] = await Promise.all([
    Result.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("studentId", "firstName lastName studentCode")
      .lean(),
    Class.find(isSuperAdmin ? {} : { schoolId: user.schoolId }).sort({ name: 1 }).lean(),
    isSuperAdmin ? School.find({}).lean() : Promise.resolve([]),
  ]);

  const schoolMap: Record<string, string> = {};
  (allSchools as any[]).forEach((s) => { schoolMap[s._id.toString()] = s.name; });

  return (
    <div className="admin-page">

      <div className="sf-page-header">
        <div>
          <h1 className="sf-page-title">Results</h1>
          <p className="sf-page-sub">{results.length} result{results.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/results/new" className="btn btn-primary">
          + New Result
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="st-filters">
        {isSuperAdmin && (
          <div className="sf-select-wrap st-filter-item">
            <select name="schoolId" className="form-input sf-select" defaultValue={spSchoolId ?? ""}>
              <option value="">All Schools</option>
              {(allSchools as any[]).map((s) => (
                <option key={s._id.toString()} value={s._id.toString()}>{s.name}</option>
              ))}
            </select>
            <span className="sf-select-arrow">▾</span>
          </div>
        )}
        <div className="sf-select-wrap st-filter-item">
          <select name="classId" className="form-input sf-select" defaultValue={classId ?? ""}>
            <option value="">All Classes</option>
            {(allClasses as any[]).map((c) => (
              <option key={c._id.toString()} value={c._id.toString()}>{c.name}</option>
            ))}
          </select>
          <span className="sf-select-arrow">▾</span>
        </div>
        <input name="session" className="form-input st-filter-item" placeholder="Session e.g. 2025/2026" defaultValue={session ?? ""} style={{ minWidth: 160 }} />
        <div className="sf-select-wrap st-filter-item">
          <select name="term" className="form-input sf-select" defaultValue={term ?? ""}>
            <option value="">All Terms</option>
            <option value="1st">1st Term</option>
            <option value="2nd">2nd Term</option>
            <option value="3rd">3rd Term</option>
          </select>
          <span className="sf-select-arrow">▾</span>
        </div>
        <button type="submit" className="btn btn-secondary">Filter</button>
        {(spSchoolId || classId || session || term) && (
          <Link href="/admin/results" className="btn btn-ghost">Clear</Link>
        )}
      </form>

      {results.length === 0 ? (
        <div className="st-empty">
          <span style={{ fontSize: 40 }}>📋</span>
          <p>No results found.</p>
          <Link href="/admin/results/new" className="btn btn-primary" style={{ marginTop: 12 }}>
            Create First Result
          </Link>
        </div>
      ) : (
        <div className="st-table-wrap">
          <table className="st-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Session</th>
                <th>Term</th>
                <th>Template</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(results as any[]).map((r) => {
                const rid = r._id.toString();
                const stu = r.studentId as any;
                return (
                  <tr key={rid}>
                    <td>
                      <div className="st-name-cell">
                        <div className="st-avatar">
                          {stu?.firstName?.[0]}{stu?.lastName?.[0]}
                        </div>
                        <div>
                          <div className="st-full-name">
                            {stu?.lastName} {stu?.firstName}
                          </div>
                          <div className="st-other-name">{stu?.studentCode}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="st-class-badge">{r.classSnapshot?.name ?? "—"}</span></td>
                    <td className="st-muted">{r.session}</td>
                    <td className="st-muted">{r.term} Term</td>
                    <td>
                      <code className="st-code" style={{ fontSize: 11 }}>
                        {r.templateKey === "TINABEL_SECONDARY" ? "Secondary" : "Primary"}
                      </code>
                    </td>
                    <td>
                      <span className={`result-status-badge ${r.status === "PUBLISHED" ? "published" : "draft"}`}>
                        {r.status === "PUBLISHED" ? "✅ Published" : "✏️ Draft"}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/results/${rid}`} className="st-edit-btn">
                        {r.status === "PUBLISHED" ? "View →" : "Edit →"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}