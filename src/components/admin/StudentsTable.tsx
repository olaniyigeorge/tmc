"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface Props {
  students: any[];
}

const StudentsTable: React.FC<Props> = ({ students }) => {
  const router = useRouter();
  return (
    <table className="w-full border">
      <thead>
        <tr>
          <th>School</th>
          <th>Code</th>
          <th>Name</th>
          <th>Class</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => (
          <tr key={s._id} className="border-t">
            <td>{s.schoolName}</td>
            <td>{s.studentCode}</td>
            <td>{s.firstName} {s.lastName}</td>
            <td>{s.className || s.classId}</td>
            <td>
              <button
                className="text-blue-600 underline"
                onClick={() => router.push(`/admin/students/${s._id}/edit`)}
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StudentsTable;