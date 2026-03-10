// src/app/(admin)/admin/students/[id]/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Student from "@/models/Student";
import Link from "next/link";
import EditStudentClient from "./EditStudentClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditStudentPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  // Next.js 15: MUST await params before accessing any property
  const { id } = await params;

  await connectToDatabase();

  const raw = await Student.findById(id).lean() as any;

  if (!raw) {
    return (
      <div className="admin-page">
        <div className="sf-not-found">
          <span style={{ fontSize: 40 }}>🔍</span>
          <h2>Student not found</h2>
          <p style={{ color: "var(--mid)", fontSize: 13 }}>ID: {id}</p>
          <Link href="/admin/students" className="btn btn-secondary" style={{ marginTop: 16 }}>
            ← Back to Students
          </Link>
        </div>
      </div>
    );
  }

  // Serialize: Mongoose ObjectIds/Dates are not serializable across server→client boundary
  const student = JSON.parse(JSON.stringify(raw));

  return (
    <div className="admin-page">
      <div className="sf-breadcrumb">
        <Link href="/admin/students" className="sf-breadcrumb-link">Students</Link>
        <span className="sf-breadcrumb-sep">›</span>
        <span>{student.lastName} {student.firstName}</span>
        <span className="sf-breadcrumb-sep">›</span>
        <span>Edit</span>
      </div>

      <div className="sf-page-header">
        <div>
          <h1 className="sf-page-title">Edit Student</h1>
          <p className="sf-page-sub">
            {student.lastName} {student.firstName}
            {student.otherName ? ` ${student.otherName}` : ""} —
            Code: <strong>{student.studentCode}</strong>
          </p>
        </div>
      </div>

      <EditStudentClient initialData={student} />
    </div>
  );
}