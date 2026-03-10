// src/app/(admin)/admin/students/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Student from "@/models/Student";
import Class   from "@/models/Class";
import School  from "@/models/School";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ classId?: string; schoolId?: string; q?: string }>;
}

export default async function StudentsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  // Next.js 15: MUST await searchParams before accessing any property
  const { classId, schoolId: spSchoolId, q } = await searchParams;

  const user         = session.user as any;
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  await connectToDatabase();

  const schoolFilter = isSuperAdmin
    ? (spSchoolId ? { schoolId: spSchoolId } : {})
    : { schoolId: user.schoolId };

  const query: any = { ...schoolFilter };
  if (classId)  query.classId = classId;
  if (q) {
    const re = new RegExp(q, "i");
    query.$or = [
      { firstName:   re },
      { lastName:    re },
      { studentCode: re },
      { admissionNo: re },
    ];
  }

  const [students, allClasses, allSchools] = await Promise.all([
    Student.find(query).sort({ lastName: 1, firstName: 1 }).limit(200).lean(),
    Class.find(isSuperAdmin ? {} : { schoolId: user.schoolId }).sort({ name: 1 }).lean(),
    isSuperAdmin ? School.find({}).lean() : Promise.resolve([]),
  ]);

  const classMap:  Record<string, string> = {};
  const schoolMap: Record<string, string> = {};
  (allClasses  as any[]).forEach((c) => { classMap[c._id.toString()]  = c.name; });
  (allSchools  as any[]).forEach((s) => { schoolMap[s._id.toString()] = s.name; });

  const currentSchoolName = isSuperAdmin
    ? (spSchoolId ? (schoolMap[spSchoolId] ?? "All Schools") : "All Schools")
    : (schoolMap[user.schoolId] ?? "");

  return (
    <div className="admin-page">

      <div className="sf-page-header">
        <div>
          <h1 className="sf-page-title">Students</h1>
          <p className="sf-page-sub">
            {currentSchoolName && <>{currentSchoolName} · </>}
            {students.length} student{students.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/students/new" className="btn btn-primary">
          + Add Student
        </Link>
      </div>

      {/* Filters — plain GET form, no JS needed */}
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

        <input
          name="q"
          className="form-input st-filter-item st-search"
          placeholder="Search name or code…"
          defaultValue={q ?? ""}
          style={{ minWidth: 200 }}
        />

        <button type="submit" className="btn btn-secondary">Filter</button>
        {(classId || q || spSchoolId) && (
          <Link href="/admin/students" className="btn btn-ghost">Clear</Link>
        )}
      </form>

      {students.length === 0 ? (
        <div className="st-empty">
          <span style={{ fontSize: 40 }}>👥</span>
          <p>No students found.</p>
          <Link href="/admin/students/new" className="btn btn-primary" style={{ marginTop: 12 }}>
            Add First Student
          </Link>
        </div>
      ) : (
        <div className="st-table-wrap">
          <table className="st-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Class</th>
                {isSuperAdmin && <th>School</th>}
                <th>Sex</th>
                <th>Adm. No</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(students as any[]).map((s) => {
                const sid = s._id.toString();
                return (
                  <tr key={sid}>
                    <td>
                      <div className="st-name-cell">
                        <div className="st-avatar">
                          {s.firstName?.[0]}{s.lastName?.[0]}
                        </div>
                        <div>
                          <div className="st-full-name">{s.lastName} {s.firstName}</div>
                          {s.otherName && <div className="st-other-name">{s.otherName}</div>}
                        </div>
                      </div>
                    </td>
                    <td><code className="st-code">{s.studentCode}</code></td>
                    <td>
                      <span className="st-class-badge">
                        {classMap[s.classId?.toString()] ?? "—"}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td className="st-muted">{schoolMap[s.schoolId?.toString()] ?? "—"}</td>
                    )}
                    <td className="st-muted">
                      {s.sex === "M" ? "Male" : s.sex === "F" ? "Female" : "—"}
                    </td>
                    <td className="st-muted">{s.admissionNo ?? "—"}</td>
                    <td>
                      <Link href={`/admin/students/${sid}`} className="st-edit-btn">
                        Edit →
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