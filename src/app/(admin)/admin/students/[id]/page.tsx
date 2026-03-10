import React from "react";
import StudentForm from "@/components/admin/StudentForm";

interface Props {
  params: { id: string };
}

const EditStudentPage = async ({ params }: Props) => {
  const res = await fetch(`/api/admin/students/${params.id}`, { cache: "no-store" });
  const data = await res.json();
  const student = data.ok ? data.data : null;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Student</h1>
      {student ? <StudentForm initialData={student} /> : <p>Not found</p>}
    </div>
  );
};

export default EditStudentPage;