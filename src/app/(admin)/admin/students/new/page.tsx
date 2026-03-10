"use client";
// src/app/(admin)/admin/students/new/page.tsx
import StudentForm from "@/components/admin/StudentForm";
import Link from "next/link";

export default function NewStudentPage() {
  return (
    <div className="admin-page">

      {/* Breadcrumb */}
      <div className="sf-breadcrumb">
        <Link href="/admin/students" className="sf-breadcrumb-link">Students</Link>
        <span className="sf-breadcrumb-sep">›</span>
        <span>New Student</span>
      </div>

      {/* Header */}
      <div className="sf-page-header">
        <div>
          <h1 className="sf-page-title">Add New Student</h1>
          <p className="sf-page-sub">Fill in the student details below. Student code is used for result lookup.</p>
        </div>
      </div>

      <StudentForm mode="create" />
    </div>
  );
}