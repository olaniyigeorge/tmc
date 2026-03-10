"use client";
// src/app/(admin)/admin/students/[id]/EditStudentClient.tsx

import StudentForm from "@/components/admin/StudentForm";

interface Props {
  initialData: any;
}

export default function EditStudentClient({ initialData }: Props) {
  return <StudentForm mode="edit" initialData={initialData} />;
}